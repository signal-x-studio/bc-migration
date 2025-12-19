'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  CheckCircle, AlertTriangle, XCircle, Info, Loader2,
  Package, Users, FolderTree, ShoppingCart, ChevronDown, ChevronRight,
  Download
} from 'lucide-react';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  entity: 'product' | 'customer' | 'category' | 'order';
  entityId: number | string;
  entityName: string;
  issue: string;
  details?: string;
}

interface EntityStats {
  total: number;
  valid: number;
  issues: number;
  issueList: ValidationIssue[];
}

interface DetailedValidationResult {
  overallScore: number;
  products: EntityStats;
  customers: EntityStats;
  categories: EntityStats;
  orders: EntityStats;
  timestamp: string;
}

interface DetailedValidationProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  } | null;
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  } | null;
}

export function DetailedValidation({ wcCredentials, bcCredentials }: DetailedValidationProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetailedValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleValidate = async () => {
    if (!wcCredentials || !bcCredentials) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/validate/detailed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wcCredentials, bcCredentials }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const exportReport = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderEntitySection = (
    title: string,
    icon: React.ReactNode,
    stats: EntityStats,
    sectionKey: string
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    const hasIssues = stats.issueList.length > 0;
    const progressPercent = stats.total > 0 ? (stats.valid / stats.total) * 100 : 100;

    return (
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium text-white">{title}</span>
            {hasIssues && (
              <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
                {stats.issueList.length} issues
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  progressPercent >= 90 ? 'bg-green-500' :
                  progressPercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm text-gray-400 w-20 text-right">
              {stats.valid}/{stats.total}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && hasIssues && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.issueList.map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg"
                >
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white truncate">
                        {issue.entityName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {issue.entityId}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5">
                      {issue.issue}
                    </p>
                    {issue.details && (
                      <p className="text-xs text-gray-500 mt-1">
                        {issue.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExpanded && !hasIssues && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50 text-center text-gray-400">
            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-green-400" />
            No issues found
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Quality Validation</CardTitle>
          <div className="flex gap-2">
            {result && (
              <Button variant="secondary" size="sm" onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <Button
              onClick={handleValidate}
              disabled={loading || !wcCredentials || !bcCredentials}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Run Validation'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="error">
            <XCircle className="w-4 h-4" />
            <span>{error}</span>
          </Alert>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-8 text-gray-400">
            <Info className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Run validation to check for data quality issues</p>
            <p className="text-sm mt-1 text-gray-500">
              Checks for missing images, duplicate SKUs, invalid emails, and more
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400" />
            <p className="text-gray-400 mt-3">Analyzing your data...</p>
          </div>
        )}

        {result && (
          <>
            {/* Overall Score */}
            <div className="text-center py-6 bg-gray-800/50 rounded-lg">
              <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}%
              </div>
              <p className="text-gray-400 mt-1">Data Quality Score</p>
              <p className="text-xs text-gray-500 mt-2">
                Last checked: {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Entity Sections */}
            <div className="space-y-3">
              {renderEntitySection(
                'Products',
                <Package className="w-5 h-5 text-purple-400" />,
                result.products,
                'products'
              )}
              {renderEntitySection(
                'Customers',
                <Users className="w-5 h-5 text-green-400" />,
                result.customers,
                'customers'
              )}
              {renderEntitySection(
                'Categories',
                <FolderTree className="w-5 h-5 text-blue-400" />,
                result.categories,
                'categories'
              )}
              {renderEntitySection(
                'Orders',
                <ShoppingCart className="w-5 h-5 text-orange-400" />,
                result.orders,
                'orders'
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
