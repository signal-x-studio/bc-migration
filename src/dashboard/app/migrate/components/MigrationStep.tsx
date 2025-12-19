'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { LucideIcon, Play, CheckCircle, AlertTriangle, Loader2, RotateCcw, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface MigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

interface PreviousProgress {
  migratedCount: number;
  totalCount?: number;
  lastMigratedAt?: string;
}

interface MigrationStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
  stepNumber: number;
  endpoint: string;
  entityName: string; // e.g., 'orders', 'coupons', 'reviews'
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  } | null;
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  } | null;
  dependencies?: {
    productIdMapping?: Record<number, number>;
    customerIdMapping?: Record<number, number>;
    categoryIdMapping?: Record<number, number>;
  };
  savedMigrationIds?: number[] | string[];
  previousProgress?: PreviousProgress; // For resume functionality
  onComplete?: (stats: MigrationStats, migratedIds: (number | string)[]) => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function MigrationStep({
  title,
  description,
  icon: Icon,
  iconColorClass,
  stepNumber,
  endpoint,
  entityName,
  wcCredentials,
  bcCredentials,
  dependencies = {},
  savedMigrationIds = [],
  previousProgress,
  onComplete,
  disabled = false,
  disabledReason,
}: MigrationStepProps) {
  const [resumeMode, setResumeMode] = useState(true); // When true, skip already-migrated
  const [startFresh, setStartFresh] = useState(false); // Flag for starting fresh
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    current?: string;
  } | null>(null);
  const [result, setResult] = useState<{
    stats: MigrationStats;
    migratedIds: (number | string)[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = useCallback(async (fresh = false) => {
    if (!wcCredentials || !bcCredentials) return;

    setMigrating(true);
    setProgress(null);
    setResult(null);
    setError(null);
    setStartFresh(false); // Reset the flag

    try {
      // Pass migrated IDs only if resuming (not starting fresh)
      const shouldResume = resumeMode && !fresh && !startFresh;
      const migratedIds = shouldResume ? savedMigrationIds : [];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wcCredentials: {
            url: wcCredentials.url,
            consumerKey: wcCredentials.consumerKey,
            consumerSecret: wcCredentials.consumerSecret,
          },
          bcCredentials,
          [`migrated${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Ids`]: migratedIds,
          ...dependencies,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));

              if (data.type === 'started') {
                setProgress({
                  total: data[`total${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`] || data.totalOrders || data.totalCoupons || data.totalReviews || data.totalPages || data.totalPosts || 0,
                  completed: 0,
                });
              } else if (data.type === 'progress') {
                const completedKey = `completed${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`;
                setProgress(prev => prev ? {
                  ...prev,
                  completed: data[completedKey] || data.completedOrders || data.completedCoupons || data.completedReviews || data.completedPages || data.completedPosts || 0,
                  current: data.currentOrder?.wcNumber ||
                           data.currentCoupon?.code ||
                           data.currentReview?.reviewer ||
                           data.currentPage?.title ||
                           data.currentPost?.title ||
                           undefined,
                } : null);
              } else if (data.type === 'complete') {
                const migratedIds = data.migratedOrderIds ||
                                   data.migratedCodes ||
                                   data.migratedReviewIds ||
                                   data.migratedPageIds ||
                                   data.migratedPostIds ||
                                   [];
                setResult({
                  stats: data.stats,
                  migratedIds,
                });
                onComplete?.(data.stats, migratedIds);
              } else if (data.type === 'error') {
                setError(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setMigrating(false);
    }
  }, [wcCredentials, bcCredentials, endpoint, entityName, savedMigrationIds, resumeMode, startFresh, dependencies, onComplete]);

  const isComplete = result !== null;
  const hasErrors = (result?.stats.failed || 0) > 0;
  const hasIncompleteProgress = previousProgress && previousProgress.migratedCount > 0 && !isComplete;

  // Effect to trigger migration when startFresh is set
  useEffect(() => {
    if (startFresh && !migrating) {
      handleMigrate(true);
    }
  }, [startFresh, migrating, handleMigrate]);

  return (
    <Card className={`bg-slate-900/80 border-slate-700 ${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border border-slate-600 text-slate-400">
                {stepNumber}
              </span>
              <CardTitle className="text-base">{title}</CardTitle>
              {isComplete && !hasErrors && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {isComplete && hasErrors && (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <Alert variant="warning">
            {disabledReason || 'Complete previous steps first'}
          </Alert>
        ) : result ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-slate-800 rounded">
                <p className="text-slate-400 text-xs">Total</p>
                <p className="text-lg font-bold text-slate-200">{result.stats.total}</p>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded">
                <p className="text-green-400 text-xs">Success</p>
                <p className="text-lg font-bold text-green-400">{result.stats.successful}</p>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded">
                <p className="text-yellow-400 text-xs">Skipped</p>
                <p className="text-lg font-bold text-yellow-400">{result.stats.skipped}</p>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <p className="text-red-400 text-xs">Failed</p>
                <p className="text-lg font-bold text-red-400">{result.stats.failed}</p>
              </div>
            </div>
            {result.stats.warnings.length > 0 && (
              <details className="text-xs">
                <summary className="text-yellow-400 cursor-pointer">
                  {result.stats.warnings.length} warning(s)
                </summary>
                <div className="mt-2 p-2 bg-slate-800 rounded max-h-32 overflow-y-auto">
                  {result.stats.warnings.slice(0, 10).map((w, i) => (
                    <p key={i} className="text-slate-400 mb-1">{w}</p>
                  ))}
                  {result.stats.warnings.length > 10 && (
                    <p className="text-slate-500">...and {result.stats.warnings.length - 10} more</p>
                  )}
                </div>
              </details>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResult(null)}
              className="w-full"
            >
              Run Again
            </Button>
          </div>
        ) : progress ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {migrating ? 'Migrating...' : 'Progress'}
              </span>
              <span className="text-slate-300">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: progress.total > 0 ? `${(progress.completed / progress.total) * 100}%` : '0%' }}
              />
            </div>
            {progress.current && (
              <p className="text-xs text-slate-500 truncate">
                Current: {progress.current}
              </p>
            )}
          </div>
        ) : error ? (
          <div className="space-y-3">
            <Alert variant="error">{error}</Alert>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              Try Again
            </Button>
          </div>
        ) : hasIncompleteProgress ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400 mb-1">
                Previous progress found
              </p>
              <p className="text-xs text-gray-400">
                {previousProgress.migratedCount} items migrated
                {previousProgress.totalCount && ` of ${previousProgress.totalCount}`}
                {previousProgress.lastMigratedAt && (
                  <span className="block mt-1">
                    Last updated: {new Date(previousProgress.lastMigratedAt).toLocaleString()}
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleMigrate(false)}
                disabled={migrating || !wcCredentials || !bcCredentials}
                className="flex-1"
              >
                {migrating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resuming...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resume Migration
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStartFresh(true);
                }}
                disabled={migrating || !wcCredentials || !bcCredentials}
                title="Start fresh, re-migrating all items"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => handleMigrate(false)}
            disabled={migrating || !wcCredentials || !bcCredentials}
            className="w-full"
          >
            {migrating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
