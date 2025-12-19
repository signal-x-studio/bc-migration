/**
 * Migration Wizard Types
 *
 * Defines types for the phase-based migration wizard flow.
 */

// Phase numbers
export type PhaseNumber = 1 | 2 | 3 | 4;

// Phase status types
export type RequiredPhaseStatus = 'pending' | 'in_progress' | 'complete';
export type OptionalPhaseStatus = 'locked' | 'pending' | 'in_progress' | 'complete' | 'skipped';

// Phase metadata
export interface PhaseInfo {
  number: PhaseNumber;
  name: string;
  shortName: string;
  description: string;
  isRequired: boolean;
  dependencies: PhaseNumber[];
}

// Phase definitions
export const PHASES: Record<PhaseNumber, PhaseInfo> = {
  1: {
    number: 1,
    name: 'Foundation',
    shortName: 'Foundation',
    description: 'Set up your category structure in BigCommerce',
    isRequired: true,
    dependencies: [],
  },
  2: {
    number: 2,
    name: 'Core Data',
    shortName: 'Core Data',
    description: 'Migrate your product catalog and customer accounts',
    isRequired: true,
    dependencies: [1],
  },
  3: {
    number: 3,
    name: 'Transactions',
    shortName: 'Transactions',
    description: 'Transfer order history and discount codes',
    isRequired: false,
    dependencies: [2],
  },
  4: {
    number: 4,
    name: 'Content',
    shortName: 'Content',
    description: 'Migrate reviews, pages, and blog posts',
    isRequired: false,
    dependencies: [2],
  },
};

// Phase data structures
export interface FoundationPhaseData {
  categoriesCreated: number;
  categoriesSkipped: number;
  categoriesErrored: number;
  categoryIdMapping: Record<number, number>;
}

export interface CoreDataPhaseData {
  products: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
    mapping: Record<number, number>;
  };
  customers: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
    mapping: Record<number, number>;
  };
}

export interface TransactionsPhaseData {
  orders?: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
    warnings: string[];
  };
  coupons?: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
  };
}

export interface ContentPhaseData {
  reviews?: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
  };
  pages?: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
  };
  blog?: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
  };
}

// Phase state with status and data
export interface PhaseState<TData> {
  status: RequiredPhaseStatus | OptionalPhaseStatus;
  data?: TData;
  startedAt?: string;
  completedAt?: string;
}

// Complete wizard state
export interface WizardState {
  currentPhase: PhaseNumber;
  phases: {
    1: PhaseState<FoundationPhaseData>;
    2: PhaseState<CoreDataPhaseData>;
    3: PhaseState<TransactionsPhaseData>;
    4: PhaseState<ContentPhaseData>;
  };
  wcStoreUrl: string;
  bcStoreHash: string;
  lastUpdated: string;
}

// Initial wizard state factory
export function createInitialWizardState(wcStoreUrl: string, bcStoreHash: string): WizardState {
  return {
    currentPhase: 1,
    phases: {
      1: { status: 'pending' },
      2: { status: 'pending' },
      3: { status: 'locked' },
      4: { status: 'locked' },
    },
    wcStoreUrl,
    bcStoreHash,
    lastUpdated: new Date().toISOString(),
  };
}

// Phase props interface for phase components
export interface PhaseProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  phaseData?: FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData;
  previousPhaseData?: {
    categoryIdMapping?: Record<number, number>;
    productIdMapping?: Record<number, number>;
    customerIdMapping?: Record<number, number>;
  };
  onComplete: (data: FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData) => void;
  onSkip?: () => void;
  onProgress?: (progress: PhaseProgress) => void;
}

// Progress tracking
export interface PhaseProgress {
  phase: PhaseNumber;
  entity?: string; // 'categories', 'products', 'customers', etc.
  total: number;
  completed: number;
  current?: string; // Current item name
}

// Wizard actions for useReducer
export type WizardAction =
  | { type: 'GO_TO_PHASE'; phase: PhaseNumber }
  | { type: 'START_PHASE'; phase: PhaseNumber }
  | { type: 'COMPLETE_PHASE'; phase: PhaseNumber; data: FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData }
  | { type: 'SKIP_PHASE'; phase: PhaseNumber }
  | { type: 'UPDATE_PHASE_DATA'; phase: PhaseNumber; data: Partial<FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData> }
  | { type: 'RESET_WIZARD' }
  | { type: 'LOAD_STATE'; state: WizardState };

// Helper to check if a phase is available
export function isPhaseAvailable(phase: PhaseNumber, wizardState: WizardState): boolean {
  const phaseInfo = PHASES[phase];

  // Check all dependencies are complete
  return phaseInfo.dependencies.every(dep => {
    const depState = wizardState.phases[dep];
    return depState.status === 'complete';
  });
}

// Helper to check if phase is complete
export function isPhaseComplete(phase: PhaseNumber, wizardState: WizardState): boolean {
  const phaseState = wizardState.phases[phase];
  return phaseState.status === 'complete' || phaseState.status === 'skipped';
}

// Helper to get next available phase
export function getNextAvailablePhase(currentPhase: PhaseNumber, wizardState: WizardState): PhaseNumber | null {
  const nextPhase = (currentPhase + 1) as PhaseNumber;

  if (nextPhase > 4) return null;
  if (isPhaseAvailable(nextPhase, wizardState)) return nextPhase;

  return null;
}

// Helper to check if all required phases are complete
export function areRequiredPhasesComplete(wizardState: WizardState): boolean {
  return (
    wizardState.phases[1].status === 'complete' &&
    wizardState.phases[2].status === 'complete'
  );
}
