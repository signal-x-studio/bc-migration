// localStorage utilities for persisting connection and assessment data

import type {
  WCCredentials,
  BCCredentials,
  AssessmentState,
  AssessmentArea,
  MigrationState,
  CustomerMigrationState,
  OrderMigrationState,
  CouponMigrationState,
  ReviewMigrationState,
  PageMigrationState,
  BlogMigrationState,
  ValidationResult,
  SetupWizardState,
  GoLiveChecklistState,
  ChecklistItem,
  MigrationMode,
} from './types';
import { GO_LIVE_CHECKLIST_ITEMS } from './types';

const STORAGE_KEYS = {
  CREDENTIALS: 'wc-migration-credentials',
  BC_CREDENTIALS: 'wc-migration-bc-credentials',
  STORE_INFO: 'wc-migration-store-info',
  ASSESSMENT_CACHE: 'wc-migration-assessment-cache',
  REMEMBER_ME: 'wc-migration-remember-me',
  MIGRATION_STATE: 'wc-migration-state',
  // New keys for turnkey self-service features
  CUSTOMER_MIGRATION_STATE: 'wc-migration-customer-state',
  ORDER_MIGRATION_STATE: 'wc-migration-order-state',
  COUPON_MIGRATION_STATE: 'wc-migration-coupon-state',
  REVIEW_MIGRATION_STATE: 'wc-migration-review-state',
  PAGE_MIGRATION_STATE: 'wc-migration-page-state',
  BLOG_MIGRATION_STATE: 'wc-migration-blog-state',
  VALIDATION_RESULT: 'wc-migration-validation',
  SETUP_WIZARD_STATE: 'wc-migration-setup-wizard',
  GO_LIVE_CHECKLIST: 'wc-migration-go-live-checklist',
  MIGRATION_MODE: 'wc-migration-mode',
} as const;

// ============================================
// Credentials Storage
// ============================================

export function saveCredentials(credentials: WCCredentials): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save credentials:', error);
  }
}

export function loadCredentials(): WCCredentials | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Validate the structure
    if (parsed && typeof parsed.url === 'string' &&
        typeof parsed.consumerKey === 'string' &&
        typeof parsed.consumerSecret === 'string') {
      return parsed as WCCredentials;
    }

    return null;
  } catch (error) {
    console.error('Failed to load credentials:', error);
    return null;
  }
}

export function clearCredentials(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    localStorage.removeItem(STORAGE_KEYS.STORE_INFO);
    localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_CACHE);
  } catch (error) {
    console.error('Failed to clear credentials:', error);
  }
}

// ============================================
// Remember Me Preference
// ============================================

export function getRememberMe(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  } catch {
    return false;
  }
}

export function setRememberMe(remember: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      // Also clear credentials if user doesn't want to remember
      clearCredentials();
    }
  } catch (error) {
    console.error('Failed to set remember me:', error);
  }
}

// ============================================
// Assessment Cache
// ============================================

interface AssessmentCacheEntry<T> {
  data: T;
  timestamp: string;
  url: string;
}

type AssessmentCache = Partial<Record<AssessmentArea, AssessmentCacheEntry<unknown>>>;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function cacheAssessment<T>(area: AssessmentArea, data: T, url: string): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = loadAssessmentCache();
    cache[area] = {
      data,
      timestamp: new Date().toISOString(),
      url,
    };
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_CACHE, JSON.stringify(cache));
  } catch (error) {
    console.error(`Failed to cache ${area} assessment:`, error);
  }
}

export function loadCachedAssessment<T>(area: AssessmentArea, url: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cache = loadAssessmentCache();
    const entry = cache[area] as AssessmentCacheEntry<T> | undefined;

    if (!entry) return null;

    // Check if cache is for the same URL
    if (entry.url !== url) return null;

    // Check if cache is expired
    const cacheTime = new Date(entry.timestamp).getTime();
    if (Date.now() - cacheTime > CACHE_TTL_MS) {
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`Failed to load cached ${area} assessment:`, error);
    return null;
  }
}

function loadAssessmentCache(): AssessmentCache {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_CACHE);
    if (!stored) return {};
    return JSON.parse(stored) as AssessmentCache;
  } catch {
    return {};
  }
}

export function clearAssessmentCache(area?: AssessmentArea): void {
  if (typeof window === 'undefined') return;

  try {
    if (area) {
      const cache = loadAssessmentCache();
      delete cache[area];
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_CACHE, JSON.stringify(cache));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_CACHE);
    }
  } catch (error) {
    console.error('Failed to clear assessment cache:', error);
  }
}

// ============================================
// Utility Functions
// ============================================

export function getStorageSize(): { used: number; available: number } {
  if (typeof window === 'undefined') return { used: 0, available: 0 };

  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }

    // localStorage typically has a 5MB limit
    const available = 5 * 1024 * 1024 - used;

    return { used, available };
  } catch {
    return { used: 0, available: 0 };
  }
}

export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all storage:', error);
  }
}

// ============================================
// BigCommerce Credentials Storage
// ============================================

export function saveBCCredentials(credentials: BCCredentials): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.BC_CREDENTIALS, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save BC credentials:', error);
  }
}

export function loadBCCredentials(): BCCredentials | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BC_CREDENTIALS);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (parsed && typeof parsed.storeHash === 'string' &&
        typeof parsed.accessToken === 'string') {
      return parsed as BCCredentials;
    }

    return null;
  } catch (error) {
    console.error('Failed to load BC credentials:', error);
    return null;
  }
}

export function clearBCCredentials(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.BC_CREDENTIALS);
  } catch (error) {
    console.error('Failed to clear BC credentials:', error);
  }
}

// ============================================
// Migration State Storage
// ============================================

export function saveMigrationState(state: MigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save migration state:', error);
  }
}

export function loadMigrationState(wcStoreUrl: string, bcStoreHash: string): MigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as MigrationState;

    // Verify it's for the same stores
    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load migration state:', error);
    return null;
  }
}

export function clearMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear migration state:', error);
  }
}

export function updateMigrationProgress(
  categoryId: number,
  completedProducts: number[],
  status: 'in_progress' | 'completed' | 'failed'
): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MIGRATION_STATE);
    if (!stored) return;

    const state = JSON.parse(stored) as MigrationState;

    // Add newly migrated products
    const newMigratedIds = [...new Set([...state.migratedProductIds, ...completedProducts])];

    // Update current migration status
    if (state.currentMigration && state.currentMigration.categoryId === categoryId) {
      state.currentMigration.completedProducts = completedProducts.length;
      state.currentMigration.status = status;
    }

    // If completed, add to migrated categories
    if (status === 'completed') {
      state.migratedCategories = [...new Set([...state.migratedCategories, categoryId])];
      state.currentMigration = undefined;
    }

    state.migratedProductIds = newMigratedIds;
    state.lastUpdated = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.MIGRATION_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to update migration progress:', error);
  }
}

// ============================================
// Customer Migration State Storage
// ============================================

export function saveCustomerMigrationState(state: CustomerMigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save customer migration state:', error);
  }
}

export function loadCustomerMigrationState(wcStoreUrl: string, bcStoreHash: string): CustomerMigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER_MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as CustomerMigrationState;

    // Verify it's for the same stores
    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load customer migration state:', error);
    return null;
  }
}

export function clearCustomerMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear customer migration state:', error);
  }
}

export function addMigratedEmail(email: string, wcStoreUrl: string, bcStoreHash: string): void {
  if (typeof window === 'undefined') return;

  try {
    const state = loadCustomerMigrationState(wcStoreUrl, bcStoreHash) || {
      wcStoreUrl,
      bcStoreHash,
      migratedEmails: [],
      lastUpdated: new Date().toISOString(),
    };

    // Add email if not already present
    if (!state.migratedEmails.includes(email)) {
      state.migratedEmails.push(email);
      saveCustomerMigrationState(state);
    }
  } catch (error) {
    console.error('Failed to add migrated email:', error);
  }
}

// ============================================
// Validation Result Storage
// ============================================

export function saveValidationResult(result: ValidationResult): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.VALIDATION_RESULT, JSON.stringify(result));
  } catch (error) {
    console.error('Failed to save validation result:', error);
  }
}

export function loadValidationResult(): ValidationResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VALIDATION_RESULT);
    if (!stored) return null;
    return JSON.parse(stored) as ValidationResult;
  } catch (error) {
    console.error('Failed to load validation result:', error);
    return null;
  }
}

export function clearValidationResult(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.VALIDATION_RESULT);
  } catch (error) {
    console.error('Failed to clear validation result:', error);
  }
}

// ============================================
// Setup Wizard State Storage
// ============================================

export function saveSetupWizardState(state: SetupWizardState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETUP_WIZARD_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save setup wizard state:', error);
  }
}

export function loadSetupWizardState(): SetupWizardState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETUP_WIZARD_STATE);
    if (!stored) return null;
    return JSON.parse(stored) as SetupWizardState;
  } catch (error) {
    console.error('Failed to load setup wizard state:', error);
    return null;
  }
}

export function clearSetupWizardState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SETUP_WIZARD_STATE);
  } catch (error) {
    console.error('Failed to clear setup wizard state:', error);
  }
}

// ============================================
// Go-Live Checklist State Storage
// ============================================

export function initializeGoLiveChecklist(wcStoreUrl: string, bcStoreHash: string): GoLiveChecklistState {
  const items: ChecklistItem[] = GO_LIVE_CHECKLIST_ITEMS.map(config => ({
    ...config,
    status: 'pending' as const,
  }));

  return {
    wcStoreUrl,
    bcStoreHash,
    items,
    overallProgress: 0,
    readyForLaunch: false,
    lastUpdated: new Date().toISOString(),
  };
}

export function saveGoLiveChecklistState(state: GoLiveChecklistState): void {
  if (typeof window === 'undefined') return;

  try {
    // Calculate overall progress
    const requiredItems = state.items.filter(i => i.category === 'required');
    const verifiedRequired = requiredItems.filter(i => i.status === 'verified' || i.status === 'skipped');
    const progress = Math.round((verifiedRequired.length / requiredItems.length) * 100);
    const readyForLaunch = requiredItems.every(i => i.status === 'verified' || i.status === 'skipped');

    localStorage.setItem(STORAGE_KEYS.GO_LIVE_CHECKLIST, JSON.stringify({
      ...state,
      overallProgress: progress,
      readyForLaunch,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save go-live checklist state:', error);
  }
}

export function loadGoLiveChecklistState(wcStoreUrl: string, bcStoreHash: string): GoLiveChecklistState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GO_LIVE_CHECKLIST);
    if (!stored) return null;

    const state = JSON.parse(stored) as GoLiveChecklistState;

    // Verify it's for the same stores
    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load go-live checklist state:', error);
    return null;
  }
}

export function updateChecklistItem(
  wcStoreUrl: string,
  bcStoreHash: string,
  itemId: string,
  status: ChecklistItem['status'],
  notes?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    let state = loadGoLiveChecklistState(wcStoreUrl, bcStoreHash);
    if (!state) {
      state = initializeGoLiveChecklist(wcStoreUrl, bcStoreHash);
    }

    const itemIndex = state.items.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
      state.items[itemIndex].status = status;
      if (status === 'verified') {
        state.items[itemIndex].verifiedAt = new Date().toISOString();
      }
      if (notes !== undefined) {
        state.items[itemIndex].notes = notes;
      }
    }

    saveGoLiveChecklistState(state);
  } catch (error) {
    console.error('Failed to update checklist item:', error);
  }
}

export function clearGoLiveChecklistState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.GO_LIVE_CHECKLIST);
  } catch (error) {
    console.error('Failed to clear go-live checklist state:', error);
  }
}

// ============================================
// Order Migration State Storage
// ============================================

export function saveOrderMigrationState(state: OrderMigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.ORDER_MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save order migration state:', error);
  }
}

export function loadOrderMigrationState(wcStoreUrl: string, bcStoreHash: string): OrderMigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDER_MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as OrderMigrationState;

    // Verify it's for the same stores
    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load order migration state:', error);
    return null;
  }
}

export function clearOrderMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.ORDER_MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear order migration state:', error);
  }
}

// ============================================
// Coupon Migration State Storage
// ============================================

export function saveCouponMigrationState(state: CouponMigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.COUPON_MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save coupon migration state:', error);
  }
}

export function loadCouponMigrationState(wcStoreUrl: string, bcStoreHash: string): CouponMigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COUPON_MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as CouponMigrationState;

    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load coupon migration state:', error);
    return null;
  }
}

export function clearCouponMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.COUPON_MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear coupon migration state:', error);
  }
}

// ============================================
// Review Migration State Storage
// ============================================

export function saveReviewMigrationState(state: ReviewMigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.REVIEW_MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save review migration state:', error);
  }
}

export function loadReviewMigrationState(wcStoreUrl: string, bcStoreHash: string): ReviewMigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEW_MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as ReviewMigrationState;

    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load review migration state:', error);
    return null;
  }
}

export function clearReviewMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.REVIEW_MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear review migration state:', error);
  }
}

// ============================================
// Page Migration State Storage
// ============================================

export function savePageMigrationState(state: PageMigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.PAGE_MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save page migration state:', error);
  }
}

export function loadPageMigrationState(wcStoreUrl: string, bcStoreHash: string): PageMigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAGE_MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as PageMigrationState;

    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load page migration state:', error);
    return null;
  }
}

export function clearPageMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.PAGE_MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear page migration state:', error);
  }
}

// ============================================
// Blog Migration State Storage
// ============================================

export function saveBlogMigrationState(state: BlogMigrationState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.BLOG_MIGRATION_STATE, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save blog migration state:', error);
  }
}

export function loadBlogMigrationState(wcStoreUrl: string, bcStoreHash: string): BlogMigrationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BLOG_MIGRATION_STATE);
    if (!stored) return null;

    const state = JSON.parse(stored) as BlogMigrationState;

    if (state.wcStoreUrl !== wcStoreUrl || state.bcStoreHash !== bcStoreHash) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load blog migration state:', error);
    return null;
  }
}

export function clearBlogMigrationState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.BLOG_MIGRATION_STATE);
  } catch (error) {
    console.error('Failed to clear blog migration state:', error);
  }
}

// ============================================
// Migration Mode Storage
// ============================================

export function saveMigrationMode(mode: MigrationMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.MIGRATION_MODE, mode);
  } catch (error) {
    console.error('Failed to save migration mode:', error);
  }
}

export function loadMigrationMode(): MigrationMode {
  if (typeof window === 'undefined') return 'assessment';

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MIGRATION_MODE);
    if (stored === 'fresh-start') return 'fresh-start';
    return 'assessment';
  } catch {
    return 'assessment';
  }
}

export function clearMigrationMode(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_MODE);
  } catch (error) {
    console.error('Failed to clear migration mode:', error);
  }
}

// ============================================
// Migration State Export/Import
// ============================================

export interface MigrationExport {
  version: '1.0';
  exportDate: string;
  wcStore: string;
  bcStore: string;
  wizardState?: unknown;
  migrationStates: {
    customers?: CustomerMigrationState;
    orders?: OrderMigrationState;
    coupons?: CouponMigrationState;
    reviews?: ReviewMigrationState;
    pages?: PageMigrationState;
    blog?: BlogMigrationState;
  };
  mappings: {
    categories?: Record<number, number>;
    products?: Record<number, number>;
    customers?: Record<number, number>;
  };
  goLiveChecklist?: GoLiveChecklistState;
  validationResult?: ValidationResult;
}

/**
 * Export all migration state to a JSON object
 */
export function exportMigrationState(wcStoreUrl: string, bcStoreHash: string): MigrationExport | null {
  if (typeof window === 'undefined') return null;

  try {
    // Load wizard state - this is stored with a specific key pattern
    const wizardStateKey = `wc-migration-wizard-state-${wcStoreUrl}-${bcStoreHash}`;
    const wizardState = localStorage.getItem(wizardStateKey);

    // Load all migration states
    const customers = loadCustomerMigrationState(wcStoreUrl, bcStoreHash);
    const orders = loadOrderMigrationState(wcStoreUrl, bcStoreHash);
    const coupons = loadCouponMigrationState(wcStoreUrl, bcStoreHash);
    const reviews = loadReviewMigrationState(wcStoreUrl, bcStoreHash);
    const pages = loadPageMigrationState(wcStoreUrl, bcStoreHash);
    const blog = loadBlogMigrationState(wcStoreUrl, bcStoreHash);

    // Load go-live checklist
    const goLiveChecklist = loadGoLiveChecklistState(wcStoreUrl, bcStoreHash);

    // Load validation result
    const validationResult = loadValidationResult();

    // Extract mappings from wizard state if available
    let mappings: MigrationExport['mappings'] = {};
    if (wizardState) {
      try {
        const parsed = JSON.parse(wizardState);
        if (parsed?.phases?.[1]?.data?.categoryIdMapping) {
          mappings.categories = parsed.phases[1].data.categoryIdMapping;
        }
        if (parsed?.phases?.[2]?.data?.products?.mapping) {
          mappings.products = parsed.phases[2].data.products.mapping;
        }
        if (parsed?.phases?.[2]?.data?.customers?.mapping) {
          mappings.customers = parsed.phases[2].data.customers.mapping;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      wcStore: wcStoreUrl,
      bcStore: bcStoreHash,
      wizardState: wizardState ? JSON.parse(wizardState) : undefined,
      migrationStates: {
        customers: customers || undefined,
        orders: orders || undefined,
        coupons: coupons || undefined,
        reviews: reviews || undefined,
        pages: pages || undefined,
        blog: blog || undefined,
      },
      mappings,
      goLiveChecklist: goLiveChecklist || undefined,
      validationResult: validationResult || undefined,
    };
  } catch (error) {
    console.error('Failed to export migration state:', error);
    return null;
  }
}

/**
 * Import migration state from a JSON object
 */
export function importMigrationState(
  data: MigrationExport,
  options: { overwrite?: boolean } = {}
): { success: boolean; errors: string[] } {
  if (typeof window === 'undefined') {
    return { success: false, errors: ['Cannot import on server'] };
  }

  const errors: string[] = [];
  const { overwrite = false } = options;

  try {
    // Validate version
    if (data.version !== '1.0') {
      errors.push(`Unsupported export version: ${data.version}`);
      return { success: false, errors };
    }

    // Validate required fields
    if (!data.wcStore || !data.bcStore) {
      errors.push('Missing required store information');
      return { success: false, errors };
    }

    // Import wizard state
    if (data.wizardState) {
      const wizardStateKey = `wc-migration-wizard-state-${data.wcStore}-${data.bcStore}`;
      const existing = localStorage.getItem(wizardStateKey);
      if (!existing || overwrite) {
        localStorage.setItem(wizardStateKey, JSON.stringify(data.wizardState));
      }
    }

    // Import migration states (each state object contains wcStoreUrl and bcStoreHash)
    if (data.migrationStates.customers) {
      saveCustomerMigrationState({
        ...data.migrationStates.customers,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }
    if (data.migrationStates.orders) {
      saveOrderMigrationState({
        ...data.migrationStates.orders,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }
    if (data.migrationStates.coupons) {
      saveCouponMigrationState({
        ...data.migrationStates.coupons,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }
    if (data.migrationStates.reviews) {
      saveReviewMigrationState({
        ...data.migrationStates.reviews,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }
    if (data.migrationStates.pages) {
      savePageMigrationState({
        ...data.migrationStates.pages,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }
    if (data.migrationStates.blog) {
      saveBlogMigrationState({
        ...data.migrationStates.blog,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }

    // Import go-live checklist
    if (data.goLiveChecklist) {
      saveGoLiveChecklistState({
        ...data.goLiveChecklist,
        wcStoreUrl: data.wcStore,
        bcStoreHash: data.bcStore,
      });
    }

    return { success: true, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error during import');
    return { success: false, errors };
  }
}

/**
 * Download migration state as a JSON file
 */
export function downloadMigrationExport(wcStoreUrl: string, bcStoreHash: string): void {
  const exportData = exportMigrationState(wcStoreUrl, bcStoreHash);
  if (!exportData) {
    console.error('Failed to generate export data');
    return;
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `migration-state-${bcStoreHash}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
