'use client';

import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import { ArrowLeft, Package, RefreshCw, AlertTriangle, XCircle, Info, CheckCircle, Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function ProductsPage() {
  const { isConnected, credentials } = useConnection();
  const { products, loading, errors, assessArea } = useAssessment();

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

  const isLoading = loading.products;
  const error = errors.products;
  const assessment = products;

  // Calculate readiness
  const blockerCount = assessment?.issues.blockers.length || 0;
  const warningCount = assessment?.issues.warnings.length || 0;
  const readyPercentage = assessment
    ? Math.round(100 - (blockerCount * 20) - (warningCount * 5))
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Product Catalog Transfer</h1>
                  <p className="text-sm text-slate-400">Moving to BigCommerce enterprise PIM</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('products', credentials)}
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
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Products have not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('products', credentials)}>
                Analyze Product Catalog
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing your product catalog...</p>
              <p className="text-sm text-slate-500 mt-2">This may take a moment for large catalogs.</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* BigCommerce Upgrade Banner */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    What You Get with BigCommerce
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">600 Variants/Product</p>
                        <p className="text-xs text-slate-400">vs WooCommerce attribute limits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Native B2B Pricing</p>
                        <p className="text-xs text-slate-400">Customer groups, price lists</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Bulk Price Rules</p>
                        <p className="text-xs text-slate-400">Quantity discounts built-in</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-400">{readyPercentage}%</p>
                  <p className="text-sm text-slate-400">Transfer Ready</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-slate-400">Products Moving</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-slate-400">Total Variants</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.totalVariants}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-slate-400">Variable Products</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.withVariants}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-slate-400">Average Price</p>
                  </div>
                  <p className="text-3xl font-bold text-white">${assessment.metrics.avgPrice.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Preparation Items (formerly Issues) */}
            {(assessment.issues.blockers.length > 0 || assessment.issues.warnings.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Preparation Checklist
                  <span className="text-sm font-normal text-slate-400">
                    ({blockerCount + warningCount} items to review)
                  </span>
                </h2>

                {/* Items needing attention */}
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
                          <p className="text-sm text-slate-400 mb-2">{issue.description}</p>
                          {issue.affectedItems && (
                            <p className="text-sm text-amber-400">{issue.affectedItems} product(s) to update</p>
                          )}
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

                {/* Minor adjustments */}
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
                          <p className="text-sm text-slate-400 mb-2">{issue.description}</p>
                          {issue.affectedItems && (
                            <p className="text-sm text-yellow-400">{issue.affectedItems} product(s) affected</p>
                          )}
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

            {/* Info items (collapsed) */}
            {assessment.issues.info.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    Additional Notes ({assessment.issues.info.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assessment.issues.info.map((issue) => (
                      <div key={issue.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-slate-500 mt-0.5" />
                        <span className="text-slate-400">
                          {issue.title}: {issue.affectedItems && `${issue.affectedItems} items`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Clear Message */}
            {blockerCount === 0 && warningCount === 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">Product Catalog Ready for Transfer</h3>
                <p className="text-slate-400">Your products are compatible with BigCommerce. No preparation needed.</p>
              </div>
            )}

            {/* Product Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Product Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(assessment.metrics.byType).map(([type, count]) => {
                    const percentage = (count / assessment.metrics.total) * 100;
                    const isProblematic = type === 'grouped' || type === 'external';
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`capitalize ${isProblematic ? 'text-yellow-400' : 'text-slate-300'}`}>
                            {type}
                            {isProblematic && ' (manual review)'}
                          </span>
                          <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isProblematic ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Data Quality & BC Limits side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Products without SKU</span>
                      <span className={assessment.metrics.withoutSKU > 0 ? 'text-yellow-400' : 'text-green-400'}>
                        {assessment.metrics.withoutSKU}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Products without images</span>
                      <span className={assessment.metrics.withoutImages > 0 ? 'text-yellow-400' : 'text-green-400'}>
                        {assessment.metrics.withoutImages}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Zero-price products</span>
                      <span className={assessment.metrics.zeroPriceCount > 0 ? 'text-yellow-400' : 'text-green-400'}>
                        {assessment.metrics.zeroPriceCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>BigCommerce Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Max variants per product</span>
                      <span className="text-green-400 font-medium">600</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Max product name length</span>
                      <span className="text-slate-300">250 chars</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Max SKU length</span>
                      <span className="text-slate-300">250 chars</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">API rate limit</span>
                      <span className="text-slate-300">Unlimited</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Requiring Attention */}
            {assessment.samples.problematicProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Products to Review Before Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">SKU</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Action Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessment.samples.problematicProducts.map((product) => (
                          <tr key={product.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="py-3 px-4 text-slate-300">{product.id}</td>
                            <td className="py-3 px-4 text-white max-w-xs truncate">{product.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                product.type === 'grouped' || product.type === 'external'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-700 text-slate-300'
                              }`}>
                                {product.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-xs max-w-xs truncate">
                              {product.sku || '-'}
                            </td>
                            <td className="py-3 px-4 text-amber-400 text-xs">{product.issue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* High Variant Products */}
            {assessment.samples.highVariantProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>High Variant Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Variants</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessment.samples.highVariantProducts.map((product) => (
                          <tr key={product.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="py-3 px-4 text-slate-300">{product.id}</td>
                            <td className="py-3 px-4 text-white">{product.name}</td>
                            <td className="py-3 px-4">
                              <span className={`font-mono ${
                                (product.variantCount || 0) > 600
                                  ? 'text-amber-400'
                                  : (product.variantCount || 0) > 100
                                    ? 'text-yellow-400'
                                    : 'text-slate-300'
                              }`}>
                                {product.variantCount}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {(product.variantCount || 0) > 600 ? (
                                <span className="text-amber-400 text-xs">Needs restructuring</span>
                              ) : (product.variantCount || 0) > 100 ? (
                                <span className="text-yellow-400 text-xs">High but OK</span>
                              ) : (
                                <span className="text-green-400 text-xs">Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

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
