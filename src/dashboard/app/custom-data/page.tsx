'use client';

import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  ArrowLeft, Database, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle,
  Sparkles, Code, FileJson, Layers
} from 'lucide-react';

export default function CustomDataPage() {
  const { isConnected, credentials } = useConnection();
  const { customData, loading, errors, assessArea } = useAssessment();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="warning">
            Please connect to a WooCommerce store first.
          </Alert>
          <Link href="/" className="text-blue-400 hover:underline mt-4 inline-block">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = loading.customData;
  const error = errors.customData;
  const assessment = customData;

  const readyPercentage = assessment
    ? Math.round(100 - (assessment.metrics.serializedFields * 5))
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Database className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Custom Data Transfer</h1>
                  <p className="text-sm text-slate-400">Mapping meta fields to BigCommerce metafields</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('customData', credentials)}
              disabled={isLoading}
              variant="secondary"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {!assessment && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Custom data has not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('customData', credentials)}>
                Analyze Custom Data
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing custom meta fields...</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* BigCommerce Metafields Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    What You Get with BigCommerce Metafields
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Structured API</p>
                        <p className="text-xs text-slate-400">Type-safe metafield storage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Custom Templates</p>
                        <p className="text-xs text-slate-400">Display metafields in themes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Headless Ready</p>
                        <p className="text-xs text-slate-400">GraphQL metafield access</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-400">{readyPercentage}%</p>
                  <p className="text-sm text-slate-400">Transfer Ready</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <p className="text-sm text-slate-400">Unique Meta Keys</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.uniqueMetaKeys}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-slate-400">Total Entries</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.totalMetaKeys.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-slate-400">Serialized Fields</p>
                  </div>
                  <p className={`text-3xl font-bold ${assessment.metrics.serializedFields > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {assessment.metrics.serializedFields}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-3xl font-bold text-white">{assessment.metrics.avgMetaPerProduct.toFixed(1)}</p>
                  <p className="text-sm text-slate-400">Avg Meta/Product</p>
                </CardContent>
              </Card>
            </div>

            {/* Serialized Data Warning */}
            {assessment.metrics.serializedFields > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">Serialized Data Detected</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {assessment.metrics.serializedFields} fields contain serialized PHP data (arrays/objects).
                        These will need to be transformed to JSON or flattened for BigCommerce metafields.
                      </p>
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-slate-300">
                          <span className="text-green-400 font-medium">Recommended Action: </span>
                          Review serialized fields and decide whether to convert to JSON strings or split into multiple metafields.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Clear Message */}
            {assessment.metrics.serializedFields === 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">Custom Data Ready for Transfer</h3>
                <p className="text-slate-400">All meta fields are simple key-value pairs. Direct mapping to BC metafields.</p>
              </div>
            )}

            {/* Issues Section */}
            {(assessment.issues.blockers.length > 0 || assessment.issues.warnings.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Considerations</h2>

                {assessment.issues.blockers.map((issue) => (
                  <Card key={issue.id} className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{issue.title}</h3>
                            <StatusBadge status="blocker" />
                          </div>
                          <p className="text-sm text-slate-400">{issue.description}</p>
                          {issue.recommendation && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                              <p className="text-sm text-slate-300">
                                <span className="text-green-400 font-medium">Action: </span>
                                {issue.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {assessment.issues.warnings.map((issue) => (
                  <Card key={issue.id} className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{issue.title}</h3>
                            <StatusBadge status="warning" />
                          </div>
                          <p className="text-sm text-slate-400">{issue.description}</p>
                          {issue.recommendation && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                              <p className="text-sm text-slate-300">
                                <span className="text-blue-400 font-medium">Note: </span>
                                {issue.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Meta Fields Table */}
            <Card>
              <CardHeader>
                <CardTitle>Meta Field Inventory</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Custom fields found in your product data (top 50 by occurrence)
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Meta Key</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Occurrences</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Format</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Sample Values</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.metaFields.map((field, index) => {
                        const isInternal = field.key.startsWith('_');
                        return (
                          <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="py-3 px-4">
                              <code className={`text-xs ${isInternal ? 'text-slate-500' : 'text-indigo-400'}`}>
                                {field.key}
                              </code>
                              {isInternal && (
                                <span className="ml-2 text-xs text-slate-600">(WC internal)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{field.occurrences}</td>
                            <td className="py-3 px-4">
                              {field.isSerialized ? (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-400 text-xs">Serialized</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-xs">Simple</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-xs max-w-xs truncate">
                              {field.sampleValues.slice(0, 2).join(', ')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* BC Metafield Features */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Metafield Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileJson className="w-4 h-4 text-indigo-400" />
                      <p className="font-medium text-slate-200">Typed Values</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Store strings, integers, or decimals with type validation.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-blue-400" />
                      <p className="font-medium text-slate-200">GraphQL Access</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Query metafields in headless storefronts via GraphQL API.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BC Metafield Limits */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Metafield Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max metafields per resource</span>
                    <span className="text-green-400 font-medium">250</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max key length</span>
                    <span className="text-slate-300">64 characters</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max value length</span>
                    <span className="text-slate-300">65,535 characters</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Supported value types</span>
                    <span className="text-slate-300">string, integer, decimal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamp */}
            <p className="text-sm text-slate-500 text-center">
              Last analyzed: {new Date(assessment.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
