'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import type {
  AssessmentArea,
  AssessmentState,
  ProductsAssessment,
  CategoriesAssessment,
  CustomersAssessment,
  OrdersAssessment,
  SEOAssessment,
  PluginsAssessment,
  CustomDataAssessment,
  WCCredentials,
} from '../types';
import { cacheAssessment, loadCachedAssessment, clearAssessmentCache } from '../storage';

// ============================================
// State & Actions
// ============================================

type AssessmentAction =
  | { type: 'SET_LOADING'; area: AssessmentArea; payload: boolean }
  | { type: 'SET_ERROR'; area: AssessmentArea; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: ProductsAssessment }
  | { type: 'SET_CATEGORIES'; payload: CategoriesAssessment }
  | { type: 'SET_CUSTOMERS'; payload: CustomersAssessment }
  | { type: 'SET_ORDERS'; payload: OrdersAssessment }
  | { type: 'SET_SEO'; payload: SEOAssessment }
  | { type: 'SET_PLUGINS'; payload: PluginsAssessment }
  | { type: 'SET_CUSTOM_DATA'; payload: CustomDataAssessment }
  | { type: 'CLEAR_AREA'; area: AssessmentArea }
  | { type: 'CLEAR_ALL' }
  | { type: 'HYDRATE'; payload: Partial<AssessmentState> };

const initialLoadingState: Record<AssessmentArea, boolean> = {
  products: false,
  categories: false,
  customers: false,
  orders: false,
  seo: false,
  plugins: false,
  customData: false,
};

const initialErrorState: Record<AssessmentArea, string | null> = {
  products: null,
  categories: null,
  customers: null,
  orders: null,
  seo: null,
  plugins: null,
  customData: null,
};

const initialLastUpdated: Record<AssessmentArea, Date | null> = {
  products: null,
  categories: null,
  customers: null,
  orders: null,
  seo: null,
  plugins: null,
  customData: null,
};

const initialState: AssessmentState = {
  products: null,
  categories: null,
  customers: null,
  orders: null,
  seo: null,
  plugins: null,
  customData: null,
  loading: { ...initialLoadingState },
  errors: { ...initialErrorState },
  lastUpdated: { ...initialLastUpdated },
};

function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.area]: action.payload },
        errors: action.payload ? { ...state.errors, [action.area]: null } : state.errors,
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.area]: action.payload },
        loading: { ...state.loading, [action.area]: false },
      };
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        loading: { ...state.loading, products: false },
        lastUpdated: { ...state.lastUpdated, products: new Date() },
      };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        loading: { ...state.loading, categories: false },
        lastUpdated: { ...state.lastUpdated, categories: new Date() },
      };
    case 'SET_CUSTOMERS':
      return {
        ...state,
        customers: action.payload,
        loading: { ...state.loading, customers: false },
        lastUpdated: { ...state.lastUpdated, customers: new Date() },
      };
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload,
        loading: { ...state.loading, orders: false },
        lastUpdated: { ...state.lastUpdated, orders: new Date() },
      };
    case 'SET_SEO':
      return {
        ...state,
        seo: action.payload,
        loading: { ...state.loading, seo: false },
        lastUpdated: { ...state.lastUpdated, seo: new Date() },
      };
    case 'SET_PLUGINS':
      return {
        ...state,
        plugins: action.payload,
        loading: { ...state.loading, plugins: false },
        lastUpdated: { ...state.lastUpdated, plugins: new Date() },
      };
    case 'SET_CUSTOM_DATA':
      return {
        ...state,
        customData: action.payload,
        loading: { ...state.loading, customData: false },
        lastUpdated: { ...state.lastUpdated, customData: new Date() },
      };
    case 'CLEAR_AREA':
      return {
        ...state,
        [action.area]: null,
        errors: { ...state.errors, [action.area]: null },
        lastUpdated: { ...state.lastUpdated, [action.area]: null },
      };
    case 'CLEAR_ALL':
      return { ...initialState };
    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        loading: { ...initialLoadingState },
        errors: { ...initialErrorState },
      };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface AssessmentContextValue extends AssessmentState {
  assessArea: (area: AssessmentArea, credentials: WCCredentials) => Promise<boolean>;
  assessAll: (credentials: WCCredentials, onProgress?: (area: AssessmentArea, status: 'start' | 'done' | 'error') => void) => Promise<void>;
  clearArea: (area: AssessmentArea) => void;
  clearAll: () => void;
  getOverallReadiness: () => { score: number; blockers: number; warnings: number };
  hydrateFromCache: (storeUrl: string) => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface AssessmentProviderProps {
  children: ReactNode;
}

export function AssessmentProvider({ children }: AssessmentProviderProps) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  const hydrateFromCache = useCallback((storeUrl: string) => {
    const areas: AssessmentArea[] = ['products', 'categories', 'customers', 'orders', 'seo', 'plugins', 'customData'];
    const hydrated: Partial<AssessmentState> = {
      lastUpdated: { ...initialLastUpdated },
    };

    for (const area of areas) {
      const cached = loadCachedAssessment(area, storeUrl);
      if (cached) {
        (hydrated as Record<string, unknown>)[area] = cached;
        hydrated.lastUpdated![area] = new Date();
      }
    }

    if (Object.keys(hydrated).length > 1) { // More than just lastUpdated
      dispatch({ type: 'HYDRATE', payload: hydrated });
    }
  }, []);

  const assessArea = useCallback(async (area: AssessmentArea, credentials: WCCredentials): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', area, payload: true });

    try {
      const response = await fetch(`/api/assess/${area}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Assessment failed' }));
        dispatch({ type: 'SET_ERROR', area, payload: error.error || 'Assessment failed' });
        return false;
      }

      const result = await response.json();

      if (!result.success) {
        dispatch({ type: 'SET_ERROR', area, payload: result.error || 'Assessment failed' });
        return false;
      }

      // Dispatch the appropriate action based on area
      const actionMap: Record<AssessmentArea, AssessmentAction['type']> = {
        products: 'SET_PRODUCTS',
        categories: 'SET_CATEGORIES',
        customers: 'SET_CUSTOMERS',
        orders: 'SET_ORDERS',
        seo: 'SET_SEO',
        plugins: 'SET_PLUGINS',
        customData: 'SET_CUSTOM_DATA',
      };

      dispatch({ type: actionMap[area], payload: result.data } as AssessmentAction);

      // Cache the result
      cacheAssessment(area, result.data, credentials.url);

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assessment failed';
      dispatch({ type: 'SET_ERROR', area, payload: message });
      return false;
    }
  }, []);

  const assessAll = useCallback(async (
    credentials: WCCredentials,
    onProgress?: (area: AssessmentArea, status: 'start' | 'done' | 'error') => void
  ): Promise<void> => {
    const areas: AssessmentArea[] = ['products', 'categories', 'customers', 'orders', 'seo', 'plugins', 'customData'];

    for (const area of areas) {
      onProgress?.(area, 'start');
      const success = await assessArea(area, credentials);
      onProgress?.(area, success ? 'done' : 'error');
    }
  }, [assessArea]);

  const clearArea = useCallback((area: AssessmentArea) => {
    dispatch({ type: 'CLEAR_AREA', area });
    clearAssessmentCache(area);
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    clearAssessmentCache();
  }, []);

  const getOverallReadiness = useCallback(() => {
    let blockers = 0;
    let warnings = 0;

    const assessments = [
      state.products,
      state.categories,
      state.customers,
      state.orders,
      state.seo,
      state.plugins,
      state.customData,
    ];

    for (const assessment of assessments) {
      if (assessment) {
        blockers += assessment.issues.blockers.length;
        warnings += assessment.issues.warnings.length;
      }
    }

    // Calculate score (100 - penalties)
    const assessedCount = assessments.filter(Boolean).length;
    if (assessedCount === 0) return { score: 0, blockers: 0, warnings: 0 };

    const blockerPenalty = blockers * 15;
    const warningPenalty = warnings * 5;
    const score = Math.max(0, 100 - blockerPenalty - warningPenalty);

    return { score, blockers, warnings };
  }, [state]);

  const value: AssessmentContextValue = {
    ...state,
    assessArea,
    assessAll,
    clearArea,
    clearAll,
    getOverallReadiness,
    hydrateFromCache,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
