'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Package,
  FolderTree,
  Users,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import {
  loadBCCredentials,
  loadValidationResult,
  saveValidationResult,
} from '@/lib/storage';
import type { ValidationResult, CountComparison, BCCredentials } from '@/lib/types';

export default function ValidatePage() {
  const { credentials: wcCredentials, storeInfo } = useConnection();
  const [bcCredentials, setBcCredentials] = useState<BCCredentials | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedBC = loadBCCredentials();
    if (savedBC) {
      setBcCredentials(savedBC);
    }

    const savedValidation = loadValidationResult();
    if (savedValidation) {
      setValidation(savedValidation);
    }
  }, []);

  const runValidation = async () => {
    if (!wcCredentials || !bcCredentials) {
      setError('Both WooCommerce and BigCommerce connections required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wcCredentials, bcCredentials }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Validation failed');
      }

      setValidation(result.data);
      saveValidationResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: CountComparison['status']) => {
    switch (status) {
      case 'matched':
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case 'over':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'under':
        return <XCircle className="w-6 h-6 text-red-400" />;
    }
  };

  const getOverallStatusBadge = (status: ValidationResult['overallStatus']) => {
    switch (status) {
      case 'matched':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            All Matched
          </span>
        );
      case 'partial':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            Partial Match
          </span>
        );
      case 'mismatch':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
            Mismatch Detected
          </span>
        );
    }
  };

  const ComparisonCard = ({
    title,
    icon: Icon,
    comparison,
    color,
  }: {
    title: string;
    icon: typeof Package;
    comparison: CountComparison;
    color: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          {getStatusIcon(comparison.status)}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {comparison.wcCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">WooCommerce</div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {comparison.bcCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">BigCommerce</div>
          </div>
        </div>

        {comparison.notes && (
          <p className="text-sm text-slate-400">{comparison.notes}</p>
        )}
      </CardContent>
    </Card>
  );

  // Check if connections are ready
  const isReady = wcCredentials && bcCredentials;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Migration Validation</h1>
                <p className="text-sm text-slate-400">
                  Compare WC source vs BC destination counts
                </p>
              </div>
            </div>
            {validation && getOverallStatusBadge(validation.overallStatus)}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Connection Status */}
        {!isReady && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4" />
            <div>
              <strong>Connections Required</strong>
              <p className="text-sm mt-1">
                {!wcCredentials && 'WooCommerce not connected. '}
                {!bcCredentials && 'BigCommerce not connected. '}
                <Link href="/migrate" className="text-blue-400 hover:underline">
                  Connect stores on the Migrate page
                </Link>
              </p>
            </div>
          </Alert>
        )}

        {/* Store Info Cards */}
        {isReady && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card variant="bordered">
              <CardContent className="pt-4">
                <div className="text-sm text-slate-400 mb-1">WooCommerce Source</div>
                <div className="text-white font-medium">
                  {storeInfo?.name || 'Connected Store'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {wcCredentials?.url}
                </div>
              </CardContent>
            </Card>
            <Card variant="bordered">
              <CardContent className="pt-4">
                <div className="text-sm text-slate-400 mb-1">BigCommerce Destination</div>
                <div className="text-white font-medium">Store {bcCredentials?.storeHash}</div>
                <div className="text-xs text-slate-500">
                  api.bigcommerce.com/stores/{bcCredentials?.storeHash}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Run Validation Button */}
        {isReady && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={runValidation}
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {validation ? 'Re-validate Migration' : 'Run Validation'}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            <XCircle className="w-4 h-4" />
            <div>{error}</div>
          </Alert>
        )}

        {/* Validation Results */}
        {validation && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <ComparisonCard
                title="Products"
                icon={Package}
                comparison={validation.products}
                color="blue"
              />
              <ComparisonCard
                title="Categories"
                icon={FolderTree}
                comparison={validation.categories}
                color="purple"
              />
              <ComparisonCard
                title="Customers"
                icon={Users}
                comparison={validation.customers}
                color="green"
              />
            </div>

            {/* Recommendations */}
            {validation.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {validation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card variant="bordered">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {validation.overallStatus !== 'matched' && (
                    <Link href="/migrate">
                      <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="font-medium text-white">Continue Migration</div>
                        <div className="text-sm text-slate-400">
                          Migrate remaining products and customers
                        </div>
                      </div>
                    </Link>
                  )}
                  <Link href="/go-live">
                    <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                      <div className="font-medium text-white">Go-Live Checklist</div>
                      <div className="text-sm text-slate-400">
                        Complete pre-launch verification
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-sm text-slate-500">
              Last validated: {new Date(validation.timestamp).toLocaleString()}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
