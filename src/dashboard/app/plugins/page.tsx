'use client';

import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  ArrowLeft, Puzzle, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle, ArrowRight,
  Sparkles, ExternalLink, Zap, CreditCard, Repeat
} from 'lucide-react';

export default function PluginsPage() {
  const { isConnected, credentials } = useConnection();
  const { plugins, loading, errors, assessArea } = useAssessment();

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

  const isLoading = loading.plugins;
  const error = errors.plugins;
  const assessment = plugins;

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
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Puzzle className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Plugin Functionality Mapping</h1>
                  <p className="text-sm text-slate-400">Your plugins mapped to BigCommerce native features</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('plugins', credentials)}
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
              <Puzzle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Plugins have not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('plugins', credentials)}>
                Analyze Active Plugins
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-pink-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing active plugins...</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* BigCommerce Native Features Banner */}
            <div className="bg-gradient-to-r from-pink-500/10 to-blue-500/10 border border-pink-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    No More Plugin Tax with BigCommerce
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">
                    Many WooCommerce plugins are native features in BigCommerce - no extra cost, no compatibility issues.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Native Subscriptions</p>
                        <p className="text-xs text-slate-400">No plugin needed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Apple Pay / Google Pay</p>
                        <p className="text-xs text-slate-400">Built into checkout</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Multi-Storefront</p>
                        <p className="text-xs text-slate-400">Native platform feature</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{assessment.metrics.withBCEquivalent}</p>
                  <p className="text-sm text-slate-400">Plugins with BC equivalent</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Puzzle className="w-4 h-4 text-pink-400" />
                    <p className="text-sm text-slate-400">Active Plugins</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.totalActive}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-slate-400">BC Equivalent</p>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{assessment.metrics.withBCEquivalent}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-slate-400">No Equivalent</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{assessment.metrics.withoutEquivalent}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-3xl font-bold text-orange-400">{assessment.metrics.requiresManualReview}</p>
                  <p className="text-sm text-slate-400">Manual Review</p>
                </CardContent>
              </Card>
            </div>

            {/* Issues Section */}
            {(assessment.issues.warnings.length > 0 || assessment.issues.info.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Considerations</h2>

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

                {assessment.issues.info.map((issue) => (
                  <Card key={issue.id} className="border-blue-500/50 bg-blue-500/5">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{issue.title}</h3>
                            <StatusBadge status="info" />
                          </div>
                          <p className="text-sm text-slate-400">{issue.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Plugin Mapping Table */}
            <Card>
              <CardHeader>
                <CardTitle>Plugin Mapping Details</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  How your WooCommerce plugins map to BigCommerce features
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">WooCommerce Plugin</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">BC Equivalent</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Complexity</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.pluginMappings.map((mapping, index) => (
                        <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-3 px-4 text-white">{mapping.wcPlugin}</td>
                          <td className="py-3 px-4">
                            {mapping.bcEquivalent ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">{mapping.bcEquivalent}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400">Review needed</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              mapping.type === 'native'
                                ? 'bg-green-500/20 text-green-400'
                                : mapping.type === 'app'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-slate-700 text-slate-400'
                            }`}>
                              {mapping.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              mapping.migrationComplexity === 'low'
                                ? 'bg-green-500/20 text-green-400'
                                : mapping.migrationComplexity === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : mapping.migrationComplexity === 'high'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-slate-700 text-slate-400'
                            }`}>
                              {mapping.migrationComplexity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs max-w-xs">{mapping.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Migration Path by Type */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-5 h-5 text-green-400" />
                    Native in BC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3">
                    Built into BigCommerce. No additional cost or setup.
                  </p>
                  <ul className="text-sm space-y-2">
                    {assessment.pluginMappings
                      .filter(p => p.type === 'native')
                      .map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-slate-300">{p.wcPlugin}</span>
                        </li>
                      ))}
                    {assessment.pluginMappings.filter(p => p.type === 'native').length === 0 && (
                      <li className="text-slate-500">No native equivalents detected</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Puzzle className="w-5 h-5 text-blue-400" />
                    BC App Store
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3">
                    Available in the BigCommerce App Store.
                  </p>
                  <ul className="text-sm space-y-2">
                    {assessment.pluginMappings
                      .filter(p => p.type === 'app')
                      .map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                          <span className="text-slate-300">{p.wcPlugin}</span>
                        </li>
                      ))}
                    {assessment.pluginMappings.filter(p => p.type === 'app').length === 0 && (
                      <li className="text-slate-500">No app equivalents detected</li>
                    )}
                  </ul>
                  <a
                    href="https://www.bigcommerce.com/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-3"
                  >
                    Browse BC App Store <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Manual Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3">
                    No direct equivalent. Review if needed.
                  </p>
                  <ul className="text-sm space-y-2">
                    {assessment.pluginMappings
                      .filter(p => p.type === 'none')
                      .map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <XCircle className="w-3 h-3 text-yellow-400" />
                          <span className="text-slate-300">{p.wcPlugin}</span>
                        </li>
                      ))}
                    {assessment.pluginMappings.filter(p => p.type === 'none').length === 0 && (
                      <li className="text-green-400">All plugins have equivalents!</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* BC Native Features Highlight */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Native Features (No Plugin Needed)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Repeat className="w-4 h-4 text-green-400" />
                      <p className="font-medium text-slate-200">Subscriptions</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Built-in recurring billing without WooCommerce Subscriptions.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <p className="font-medium text-slate-200">Digital Wallets</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Apple Pay, Google Pay, Amazon Pay native in checkout.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <p className="font-medium text-slate-200">B2B Features</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Price lists, customer groups, quote management native.
                    </p>
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
