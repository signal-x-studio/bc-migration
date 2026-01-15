'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Eye,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  Tag,
  FileText,
  Newspaper,
  AlertTriangle,
  CheckCircle,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useBCConnection } from '@/lib/contexts/BCConnectionContext';

interface EntityOption {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultChecked: boolean;
}

interface DeleteStats {
  entity: string;
  found: number;
  deleted: number;
  errors: string[];
}

interface ClearResult {
  dryRun: boolean;
  results: DeleteStats[];
  summary: {
    totalDeleted: number;
    totalErrors: number;
  };
}

const ENTITY_OPTIONS: EntityOption[] = [
  {
    key: 'products',
    label: 'Products',
    description: 'Includes variants, options, and images',
    icon: <Package className="w-5 h-5" />,
    defaultChecked: true,
  },
  {
    key: 'categories',
    label: 'Categories',
    description: 'All product categories',
    icon: <FolderTree className="w-5 h-5" />,
    defaultChecked: true,
  },
  {
    key: 'customers',
    label: 'Customers',
    description: 'Customer accounts (first customer preserved)',
    icon: <Users className="w-5 h-5" />,
    defaultChecked: false,
  },
  {
    key: 'orders',
    label: 'Orders',
    description: 'All order records',
    icon: <ShoppingCart className="w-5 h-5" />,
    defaultChecked: false,
  },
  {
    key: 'coupons',
    label: 'Coupons',
    description: 'Discount codes and promotions',
    icon: <Tag className="w-5 h-5" />,
    defaultChecked: false,
  },
  {
    key: 'pages',
    label: 'Web Pages',
    description: 'Static content pages',
    icon: <FileText className="w-5 h-5" />,
    defaultChecked: false,
  },
  {
    key: 'blog',
    label: 'Blog Posts',
    description: 'Blog articles and content',
    icon: <Newspaper className="w-5 h-5" />,
    defaultChecked: false,
  },
];

export default function ClearDataPage() {
  const { credentials, isConnected } = useBCConnection();
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(
    new Set(ENTITY_OPTIONS.filter(e => e.defaultChecked).map(e => e.key))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [result, setResult] = useState<ClearResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleEntity = (key: string) => {
    setSelectedEntities(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedEntities(new Set(ENTITY_OPTIONS.map(e => e.key)));
  };

  const selectNone = () => {
    setSelectedEntities(new Set());
  };

  const handleClearData = async (dryRun: boolean) => {
    if (!credentials) return;

    setIsLoading(true);
    setError(null);
    setShowConfirmation(false);

    try {
      const entities: Record<string, boolean> = {};
      selectedEntities.forEach(key => {
        entities[key] = true;
      });

      const response = await fetch('/api/bc/clear-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeHash: credentials.storeHash,
          accessToken: credentials.accessToken,
          entities,
          dryRun,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to clear data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Alert variant="warning">
            <p className="font-medium">BigCommerce Connection Required</p>
            <p className="text-sm text-slate-400 mt-1">
              Please connect to a BigCommerce store before clearing data.
            </p>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-red-500/20">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Clear BigCommerce Data</h1>
            <p className="text-slate-400">
              Remove sample or migrated data from your BC store
            </p>
          </div>
        </div>

        {/* Warning Alert */}
        <Alert variant="warning" className="mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Destructive Action</p>
              <p className="text-sm text-slate-400 mt-1">
                This action will permanently delete data from your BigCommerce store.
                This cannot be undone. Use Preview first to see what will be deleted.
              </p>
            </div>
          </div>
        </Alert>

        {/* Entity Selection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Data Types to Clear</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Select All
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={selectNone}
                  className="text-sm text-slate-400 hover:text-slate-300"
                >
                  Select None
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ENTITY_OPTIONS.map(entity => (
                <label
                  key={entity.key}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all
                    ${selectedEntities.has(entity.key)
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedEntities.has(entity.key)}
                    onChange={() => toggleEntity(entity.key)}
                    className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <div className={`
                    p-2 rounded-lg
                    ${selectedEntities.has(entity.key) ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}
                  `}>
                    {entity.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${selectedEntities.has(entity.key) ? 'text-white' : 'text-slate-300'}`}>
                      {entity.label}
                    </div>
                    <div className="text-sm text-slate-500">{entity.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="error" className="mb-6">
            <p>{error}</p>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.dryRun ? (
                  <>
                    <Eye className="w-5 h-5 text-blue-400" />
                    Preview Results
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Deletion Complete
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className={`p-4 rounded-lg ${result.dryRun ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-slate-400 text-sm">
                        {result.dryRun ? 'Would be deleted' : 'Deleted'}
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {result.summary.totalDeleted}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Errors</div>
                      <div className={`text-3xl font-bold ${result.summary.totalErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {result.summary.totalErrors}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per-entity results */}
                <div className="space-y-2">
                  {result.results.map(stat => (
                    <div
                      key={stat.entity}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          stat.deleted > 0 || stat.found > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'
                        }`}>
                          {stat.errors.length > 0 ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : stat.deleted > 0 || (result.dryRun && stat.found > 0) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">-</span>
                          )}
                        </div>
                        <span className="capitalize text-white">{stat.entity.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">
                          Found: <span className="text-white">{stat.found}</span>
                        </span>
                        {!result.dryRun && (
                          <span className="text-slate-400">
                            Deleted: <span className="text-green-400">{stat.deleted}</span>
                          </span>
                        )}
                        {stat.errors.length > 0 && (
                          <span className="text-red-400">
                            {stat.errors.length} error(s)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show errors if any */}
                {result.results.some(r => r.errors.length > 0) && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 className="font-medium text-red-400 mb-2">Errors</h4>
                    <ul className="text-sm text-slate-400 space-y-1 max-h-32 overflow-y-auto">
                      {result.results.flatMap(r => r.errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => handleClearData(true)}
            disabled={isLoading || selectedEntities.size === 0}
            className="flex-1"
          >
            {isLoading && !showConfirmation ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Preview (Dry Run)
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowConfirmation(true)}
            disabled={isLoading || selectedEntities.size === 0}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Selected Data
          </Button>
        </div>

        {/* Store Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Connected to: <span className="text-slate-400">{credentials?.storeHash}</span>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
                  <p className="text-slate-400">
                    You are about to permanently delete {selectedEntities.size} data type(s).
                    This action cannot be undone.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg mb-6">
                  <div className="text-sm text-slate-400 mb-2">Data types to delete:</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedEntities).map(key => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm capitalize"
                      >
                        {key.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleClearData(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Permanently
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
