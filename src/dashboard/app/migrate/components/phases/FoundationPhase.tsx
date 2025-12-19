'use client';

import { useState, useEffect } from 'react';
import { FolderTree, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { FoundationPhaseData } from '../../types';
import { decodeHtmlEntities } from '@/lib/utils';

interface FoundationPhaseProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  phaseData?: FoundationPhaseData;
  onComplete: (data: FoundationPhaseData) => void;
}

export function FoundationPhase({
  wcCredentials,
  bcCredentials,
  phaseData,
  onComplete,
}: FoundationPhaseProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [result, setResult] = useState<{
    totalCreated: number;
    totalSkipped: number;
    totalErrors: number;
    mappings: Array<{ wcId: number; bcId: number; name: string }>;
    errors?: Array<{ wcId: number; name: string; error: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize from saved phase data
  useEffect(() => {
    if (phaseData) {
      setResult({
        totalCreated: phaseData.categoriesCreated,
        totalSkipped: phaseData.categoriesSkipped,
        totalErrors: phaseData.categoriesErrored,
        mappings: Object.entries(phaseData.categoryIdMapping).map(([wcId, bcId]) => ({
          wcId: Number(wcId),
          bcId,
          name: '', // Name not stored in mapping
        })),
      });
    }
  }, [phaseData]);

  const handleSetupCategories = async () => {
    setIsSettingUp(true);
    setError(null);

    try {
      const response = await fetch('/api/migrate/setup-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wcCredentials: {
            url: wcCredentials.url,
            consumerKey: wcCredentials.consumerKey,
            consumerSecret: wcCredentials.consumerSecret,
          },
          bcCredentials,
          dryRun: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);

        // Build category ID mapping
        const categoryIdMapping: Record<number, number> = {};
        data.data.mappings.forEach((m: { wcId: number; bcId: number }) => {
          categoryIdMapping[m.wcId] = m.bcId;
        });

        // Notify parent of completion
        onComplete({
          categoriesCreated: data.data.totalCreated,
          categoriesSkipped: data.data.totalSkipped,
          categoriesErrored: data.data.totalErrors,
          categoryIdMapping,
        });
      } else {
        setError(data.error || 'Failed to set up categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up categories');
    } finally {
      setIsSettingUp(false);
    }
  };

  const isComplete = result !== null && result.totalErrors === 0;

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
          <FolderTree className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Phase 1: Foundation</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Set up your category structure in BigCommerce. This creates the foundation for your product catalog.
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-400" />
            Category Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info message */}
          {!result && !isSettingUp && (
            <Alert variant="info">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Before you begin</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This will create all your WooCommerce categories in BigCommerce,
                    preserving the parent-child hierarchy. Existing categories with
                    matching names will be skipped.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          {/* Error state */}
          {error && (
            <Alert variant="error">
              <p>{error}</p>
            </Alert>
          )}

          {/* Result display */}
          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-amber-400'}`} />
                  <span className={`font-medium ${isComplete ? 'text-green-400' : 'text-amber-400'}`}>
                    {isComplete ? 'Categories Ready' : 'Categories Setup Complete (with warnings)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Created</div>
                    <div className="text-2xl font-bold text-green-400">{result.totalCreated}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Skipped</div>
                    <div className="text-2xl font-bold text-amber-400">{result.totalSkipped}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Errors</div>
                    <div className="text-2xl font-bold text-red-400">{result.totalErrors}</div>
                  </div>
                </div>
              </div>

              {/* Show errors if any */}
              {result.errors && result.errors.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">Errors</h4>
                  <ul className="text-sm text-gray-400 space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <li key={i}>
                        <span className="text-white">{decodeHtmlEntities(err.name)}</span>: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={handleSetupCategories}
            disabled={isSettingUp}
            className="w-full"
            variant={result ? 'secondary' : 'primary'}
          >
            {isSettingUp ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up categories...
              </>
            ) : result ? (
              <>
                <FolderTree className="w-4 h-4 mr-2" />
                Run Again
              </>
            ) : (
              <>
                <FolderTree className="w-4 h-4 mr-2" />
                Setup Categories in BigCommerce
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Help text */}
      <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
        Categories are required before migrating products. Once complete, you can proceed to the next phase.
      </p>
    </div>
  );
}
