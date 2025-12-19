/**
 * Migration-specific types for state tracking and results
 */

export type MigrationPhase = 'categories' | 'products' | 'customers' | 'orders';
export type MigrationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';

export interface IdMapping {
  wcId: number;
  bcId: number;
  sku?: string;
  name?: string;
}

export interface PhaseState {
  status: MigrationStatus;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  lastProcessedId: number | null;
  lastProcessedAt: string | null;
  errors: MigrationError[];
}

export interface MigrationError {
  phase: MigrationPhase;
  itemId: number;
  itemSku?: string;
  itemName?: string;
  errorCode: string;
  errorMessage: string;
  details?: unknown;
  timestamp: string;
  retriable: boolean;
}

export interface MigrationState {
  migrationId: string;
  sourceStoreUrl: string;
  targetStoreHash: string;
  startedAt: string;
  lastUpdatedAt: string;
  status: MigrationStatus;
  phases: {
    categories: PhaseState;
    products: PhaseState;
    customers: PhaseState;
    orders: PhaseState;
  };
  mappings: {
    categories: IdMapping[];
    products: IdMapping[];
    customers: IdMapping[];
    orders: IdMapping[];
  };
}

export interface MigrationResult {
  phase: MigrationPhase;
  success: boolean;
  totalProcessed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  duration: number; // milliseconds
  errors: MigrationError[];
}

export interface MigrationOptions {
  delta: boolean;
  skipExisting: boolean;
  batchSize: number;
  dryRun: boolean;
  phases: MigrationPhase[];
}

export interface MigrationSummary {
  migrationId: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  overallStatus: MigrationStatus;
  results: {
    categories: MigrationResult;
    products: MigrationResult;
    customers: MigrationResult;
    orders: MigrationResult;
  };
  totalErrors: number;
  errorsLogPath?: string;
}

/**
 * Transformer result type for consistent handling
 */
export interface TransformResult<T> {
  success: boolean;
  data?: T;
  warnings: string[];
  errors: string[];
}
