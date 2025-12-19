'use client';

import { useReducer, useCallback, useEffect } from 'react';
import {
  WizardState,
  WizardAction,
  PhaseNumber,
  PHASES,
  createInitialWizardState,
  isPhaseAvailable,
  isPhaseComplete,
  getNextAvailablePhase,
  FoundationPhaseData,
  CoreDataPhaseData,
  TransactionsPhaseData,
  ContentPhaseData,
} from '../types';

const WIZARD_STATE_KEY = 'wc-migration-wizard-state';

// Reducer for wizard state management
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'GO_TO_PHASE': {
      if (!isPhaseAvailable(action.phase, state)) {
        console.warn(`Phase ${action.phase} is not available`);
        return state;
      }
      return {
        ...state,
        currentPhase: action.phase,
        lastUpdated: now,
      };
    }

    case 'START_PHASE': {
      return {
        ...state,
        phases: {
          ...state.phases,
          [action.phase]: {
            ...state.phases[action.phase],
            status: 'in_progress',
            startedAt: now,
          },
        },
        lastUpdated: now,
      };
    }

    case 'COMPLETE_PHASE': {
      const newPhases: WizardState['phases'] = {
        ...state.phases,
        [action.phase]: {
          ...state.phases[action.phase],
          status: 'complete' as const,
          data: action.data,
          completedAt: now,
        },
      } as WizardState['phases'];

      // Unlock dependent phases
      const phaseNum = action.phase as PhaseNumber;
      ([1, 2, 3, 4] as PhaseNumber[]).forEach(p => {
        const phaseInfo = PHASES[p];
        if (phaseInfo.dependencies.includes(phaseNum)) {
          const depsSatisfied = phaseInfo.dependencies.every(dep =>
            newPhases[dep].status === 'complete'
          );
          if (depsSatisfied && newPhases[p].status === 'locked') {
            (newPhases as Record<PhaseNumber, { status: string }>)[p] = { ...newPhases[p], status: 'pending' };
          }
        }
      });

      return {
        ...state,
        phases: newPhases,
        lastUpdated: now,
      };
    }

    case 'SKIP_PHASE': {
      const phaseInfo = PHASES[action.phase];
      if (phaseInfo.isRequired) {
        console.warn(`Cannot skip required phase ${action.phase}`);
        return state;
      }
      return {
        ...state,
        phases: {
          ...state.phases,
          [action.phase]: {
            ...state.phases[action.phase],
            status: 'skipped',
            completedAt: now,
          },
        },
        lastUpdated: now,
      };
    }

    case 'UPDATE_PHASE_DATA': {
      return {
        ...state,
        phases: {
          ...state.phases,
          [action.phase]: {
            ...state.phases[action.phase],
            data: {
              ...state.phases[action.phase].data,
              ...action.data,
            },
          },
        },
        lastUpdated: now,
      };
    }

    case 'RESET_WIZARD': {
      return createInitialWizardState(state.wcStoreUrl, state.bcStoreHash);
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    default:
      return state;
  }
}

// Save wizard state to localStorage
function saveWizardState(state: WizardState): void {
  if (typeof window === 'undefined') return;
  const key = `${WIZARD_STATE_KEY}-${state.wcStoreUrl}-${state.bcStoreHash}`;
  localStorage.setItem(key, JSON.stringify(state));
}

// Load wizard state from localStorage
function loadWizardState(wcStoreUrl: string, bcStoreHash: string): WizardState | null {
  if (typeof window === 'undefined') return null;
  const key = `${WIZARD_STATE_KEY}-${wcStoreUrl}-${bcStoreHash}`;
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as WizardState;
  } catch {
    return null;
  }
}

// Clear wizard state from localStorage
function clearWizardState(wcStoreUrl: string, bcStoreHash: string): void {
  if (typeof window === 'undefined') return;
  const key = `${WIZARD_STATE_KEY}-${wcStoreUrl}-${bcStoreHash}`;
  localStorage.removeItem(key);
}

export interface UseMigrationWizardOptions {
  wcStoreUrl: string;
  bcStoreHash: string;
  autoSave?: boolean;
}

export interface UseMigrationWizardReturn {
  // State
  state: WizardState;
  currentPhase: PhaseNumber;
  currentPhaseInfo: typeof PHASES[PhaseNumber];

  // Phase status helpers
  isPhaseAvailable: (phase: PhaseNumber) => boolean;
  isPhaseComplete: (phase: PhaseNumber) => boolean;
  isCurrentPhaseComplete: boolean;
  canProceed: boolean;
  canSkip: boolean;

  // Navigation
  goToPhase: (phase: PhaseNumber) => void;
  nextPhase: () => void;
  previousPhase: () => void;

  // Phase lifecycle
  startPhase: (phase: PhaseNumber) => void;
  completePhase: (phase: PhaseNumber, data: FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData) => void;
  skipPhase: (phase: PhaseNumber) => void;
  updatePhaseData: (phase: PhaseNumber, data: Partial<FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData>) => void;

  // Wizard lifecycle
  resetWizard: () => void;

  // Data accessors
  getPhaseData: <T>(phase: PhaseNumber) => T | undefined;
  getCategoryMapping: () => Record<number, number>;
  getProductMapping: () => Record<number, number>;
  getCustomerMapping: () => Record<number, number>;
}

export function useMigrationWizard({
  wcStoreUrl,
  bcStoreHash,
  autoSave = true,
}: UseMigrationWizardOptions): UseMigrationWizardReturn {
  // Initialize state from localStorage or create new
  const initialState = loadWizardState(wcStoreUrl, bcStoreHash) ||
    createInitialWizardState(wcStoreUrl, bcStoreHash);

  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave) {
      saveWizardState(state);
    }
  }, [state, autoSave]);

  // Current phase info
  const currentPhaseInfo = PHASES[state.currentPhase];

  // Phase status helpers
  const checkPhaseAvailable = useCallback(
    (phase: PhaseNumber) => isPhaseAvailable(phase, state),
    [state]
  );

  const checkPhaseComplete = useCallback(
    (phase: PhaseNumber) => isPhaseComplete(phase, state),
    [state]
  );

  const isCurrentPhaseComplete = isPhaseComplete(state.currentPhase, state);

  const canProceed = isCurrentPhaseComplete && getNextAvailablePhase(state.currentPhase, state) !== null;

  const canSkip = !currentPhaseInfo.isRequired && state.phases[state.currentPhase].status !== 'complete';

  // Navigation
  const goToPhase = useCallback((phase: PhaseNumber) => {
    dispatch({ type: 'GO_TO_PHASE', phase });
  }, []);

  const nextPhase = useCallback(() => {
    const next = getNextAvailablePhase(state.currentPhase, state);
    if (next) {
      dispatch({ type: 'GO_TO_PHASE', phase: next });
    }
  }, [state]);

  const previousPhase = useCallback(() => {
    if (state.currentPhase > 1) {
      dispatch({ type: 'GO_TO_PHASE', phase: (state.currentPhase - 1) as PhaseNumber });
    }
  }, [state.currentPhase]);

  // Phase lifecycle
  const startPhase = useCallback((phase: PhaseNumber) => {
    dispatch({ type: 'START_PHASE', phase });
  }, []);

  const completePhase = useCallback(
    (phase: PhaseNumber, data: FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData) => {
      dispatch({ type: 'COMPLETE_PHASE', phase, data });
    },
    []
  );

  const skipPhase = useCallback((phase: PhaseNumber) => {
    dispatch({ type: 'SKIP_PHASE', phase });
  }, []);

  const updatePhaseData = useCallback(
    (phase: PhaseNumber, data: Partial<FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData>) => {
      dispatch({ type: 'UPDATE_PHASE_DATA', phase, data });
    },
    []
  );

  // Wizard lifecycle
  const resetWizard = useCallback(() => {
    clearWizardState(wcStoreUrl, bcStoreHash);
    dispatch({ type: 'RESET_WIZARD' });
  }, [wcStoreUrl, bcStoreHash]);

  // Data accessors
  const getPhaseData = useCallback(
    <T,>(phase: PhaseNumber): T | undefined => {
      return state.phases[phase].data as T | undefined;
    },
    [state.phases]
  );

  const getCategoryMapping = useCallback((): Record<number, number> => {
    const data = state.phases[1].data as FoundationPhaseData | undefined;
    return data?.categoryIdMapping || {};
  }, [state.phases]);

  const getProductMapping = useCallback((): Record<number, number> => {
    const data = state.phases[2].data as CoreDataPhaseData | undefined;
    return data?.products?.mapping || {};
  }, [state.phases]);

  const getCustomerMapping = useCallback((): Record<number, number> => {
    const data = state.phases[2].data as CoreDataPhaseData | undefined;
    return data?.customers?.mapping || {};
  }, [state.phases]);

  return {
    // State
    state,
    currentPhase: state.currentPhase,
    currentPhaseInfo,

    // Phase status helpers
    isPhaseAvailable: checkPhaseAvailable,
    isPhaseComplete: checkPhaseComplete,
    isCurrentPhaseComplete,
    canProceed,
    canSkip,

    // Navigation
    goToPhase,
    nextPhase,
    previousPhase,

    // Phase lifecycle
    startPhase,
    completePhase,
    skipPhase,
    updatePhaseData,

    // Wizard lifecycle
    resetWizard,

    // Data accessors
    getPhaseData,
    getCategoryMapping,
    getProductMapping,
    getCustomerMapping,
  };
}
