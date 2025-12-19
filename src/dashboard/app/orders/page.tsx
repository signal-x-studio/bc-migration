'use client';

import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingCart, RefreshCw, AlertTriangle, Info, ArrowRight,
  CheckCircle, Sparkles, Package, Truck, RotateCcw
} from 'lucide-react';

export default function OrdersPage() {
  const { isConnected, credentials } = useConnection();
  const { orders, loading, errors, assessArea } = useAssessment();

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

  const isLoading = loading.orders;
  const error = errors.orders;
  const assessment = orders;

  const statusEntries = assessment?.metrics.byStatus
    ? Object.entries(assessment.metrics.byStatus).sort(([, a], [, b]) => b - a)
    : [];

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
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Order History Transfer</h1>
                  <p className="text-sm text-slate-400">Preserving your order data for reference</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('orders', credentials)}
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
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Orders have not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('orders', credentials)}>
                Analyze Order History
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing order history...</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* BigCommerce Upgrade Banner */}
            <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    What You Get with BigCommerce Orders
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Multi-Warehouse</p>
                        <p className="text-xs text-slate-400">Ship from multiple locations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Partial Fulfillment</p>
                        <p className="text-xs text-slate-400">Ship items as available</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Built-in Returns</p>
                        <p className="text-xs text-slate-400">Native RMA system</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-400">{assessment.metrics.total}</p>
                  <p className="text-sm text-slate-400">Orders Preserved</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-orange-400" />
                    <p className="text-sm text-slate-400">Total Orders</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-slate-400">Avg Items/Order</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.avgItemsPerOrder.toFixed(1)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCcw className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-slate-400">With Refunds</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.withRefunds}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-3xl font-bold text-white">{Object.keys(assessment.metrics.byStatus).length}</p>
                  <p className="text-sm text-slate-400">Status Types</p>
                </CardContent>
              </Card>
            </div>

            {/* Date Range */}
            {assessment.metrics.dateRange && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Oldest Order</p>
                      <p className="text-lg font-medium text-white">
                        {new Date(assessment.metrics.dateRange.oldest).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-600" />
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Newest Order</p>
                      <p className="text-lg font-medium text-white">
                        {new Date(assessment.metrics.dateRange.newest).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusEntries.map(([status, count]) => {
                    const percentage = (count / assessment.metrics.total) * 100;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300 capitalize">{status.replace(/-/g, ' ')}</span>
                          <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status Mapping Table */}
            <Card>
              <CardHeader>
                <CardTitle>WooCommerce to BigCommerce Status Mapping</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  How order statuses will be mapped during transfer
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">WooCommerce Status</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">BigCommerce Status</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Count</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.statusMapping.map((mapping) => (
                        <tr key={mapping.wcStatus} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-slate-700 rounded text-slate-300 capitalize">
                              {mapping.wcStatus.replace(/-/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                              {mapping.bcStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{mapping.count}</td>
                          <td className="py-3 px-4 text-slate-400 text-xs">{mapping.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* BC Order Features */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Order Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-orange-400" />
                      <p className="font-medium text-slate-200">Multi-Location Fulfillment</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Ship from multiple warehouses with automatic inventory allocation.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className="w-4 h-4 text-blue-400" />
                      <p className="font-medium text-slate-200">Native Returns (RMA)</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Built-in return merchandise authorization without plugins.
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
