'use client';

import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import { CategoryNode } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, FolderTree, RefreshCw, AlertTriangle, XCircle, ChevronRight, Info, CheckCircle, Sparkles, Search } from 'lucide-react';
import { useState } from 'react';

function CategoryTreeItem({ category, level = 0 }: { category: CategoryNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = category.children && category.children.length > 0;
  const isOverDepth = category.depth > 5;
  const isAtLimit = category.depth === 5;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-slate-800/50 cursor-pointer ${
          isOverDepth ? 'bg-amber-500/10' : isAtLimit ? 'bg-yellow-500/10' : ''
        }`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        ) : (
          <span className="w-4" />
        )}
        <FolderTree className={`w-4 h-4 ${isOverDepth ? 'text-amber-400' : isAtLimit ? 'text-yellow-400' : 'text-slate-400'}`} />
        <span className={`flex-1 ${isOverDepth ? 'text-amber-400' : 'text-slate-200'}`}>
          {category.name}
        </span>
        <span className="text-xs text-slate-500">
          {category.productCount} products
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          isOverDepth
            ? 'bg-amber-500/20 text-amber-400'
            : isAtLimit
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-slate-700 text-slate-400'
        }`}>
          Level {category.depth}
        </span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {category.children.map((child) => (
            <CategoryTreeItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const { isConnected, credentials } = useConnection();
  const { categories, loading, errors, assessArea } = useAssessment();

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

  const isLoading = loading.categories;
  const error = errors.categories;
  const assessment = categories;

  const blockerCount = assessment?.issues.blockers.length || 0;
  const readyPercentage = assessment
    ? Math.round(100 - (blockerCount * 25))
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
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FolderTree className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Category Taxonomy Transfer</h1>
                  <p className="text-sm text-slate-400">Migrating to BigCommerce&apos;s enhanced category system</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('categories', credentials)}
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
              <FolderTree className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Categories have not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('categories', credentials)}>
                Analyze Category Structure
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing category hierarchy...</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* BigCommerce Upgrade Banner */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    What You Get with BigCommerce Categories
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Faceted Search</p>
                        <p className="text-xs text-slate-400">Filter by attributes automatically</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">SEO-Optimized URLs</p>
                        <p className="text-xs text-slate-400">Clean category permalinks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">16K Category Limit</p>
                        <p className="text-xs text-slate-400">Enterprise-scale taxonomy</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{readyPercentage}%</p>
                  <p className="text-sm text-slate-400">Transfer Ready</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderTree className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-slate-400">Categories Moving</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className={`text-3xl font-bold ${assessment.metrics.maxDepth > 5 ? 'text-amber-400' : 'text-white'}`}>
                    {assessment.metrics.maxDepth}
                  </p>
                  <p className="text-sm text-slate-400">Max Depth (BC limit: 5)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-3xl font-bold text-white">{assessment.metrics.avgProductsPerCategory.toFixed(1)}</p>
                  <p className="text-sm text-slate-400">Avg Products/Category</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className={`text-3xl font-bold ${assessment.metrics.emptyCategories > 0 ? 'text-yellow-400' : 'text-white'}`}>
                    {assessment.metrics.emptyCategories}
                  </p>
                  <p className="text-sm text-slate-400">Empty Categories</p>
                </CardContent>
              </Card>
            </div>

            {/* Depth Restructuring Alert */}
            {assessment.metrics.maxDepth > 5 && (
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">Category Restructuring Needed</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        BigCommerce supports 5 category levels. Your deepest category is level {assessment.metrics.maxDepth}.
                      </p>
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-slate-300">
                          <span className="text-green-400 font-medium">Recommended Action: </span>
                          Flatten categories at level 6+ by merging with parent categories or creating attribute-based filters instead.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Clear Message */}
            {assessment.metrics.maxDepth <= 5 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">Category Structure Ready for Transfer</h3>
                <p className="text-slate-400">Your category hierarchy is compatible with BigCommerce. No restructuring needed.</p>
              </div>
            )}

            {/* Deep Categories List */}
            {assessment.deepCategories && assessment.deepCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories Requiring Restructuring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Category Name</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Current Depth</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Levels to Flatten</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessment.deepCategories.map((cat) => (
                          <tr key={cat.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="py-3 px-4 text-slate-300">{cat.id}</td>
                            <td className="py-3 px-4 text-white">{cat.name}</td>
                            <td className="py-3 px-4 text-amber-400">{cat.depth}</td>
                            <td className="py-3 px-4 text-amber-400">+{cat.depth - 5} level(s)</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Hierarchy Tree */}
            <Card>
              <CardHeader>
                <CardTitle>Category Hierarchy Preview</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Categories at level 6+ highlighted in amber. Level 5 in yellow.
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto">
                  {assessment.hierarchy && assessment.hierarchy.length > 0 ? (
                    assessment.hierarchy.map((category) => (
                      <CategoryTreeItem key={category.id} category={category} />
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8">No category hierarchy data available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* BC Category Features */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Category Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-4 h-4 text-blue-400" />
                      <p className="font-medium text-slate-200">Faceted Search</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Automatically generate filter options from product attributes within categories.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderTree className="w-4 h-4 text-green-400" />
                      <p className="font-medium text-slate-200">Category Images</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Rich category pages with hero images, descriptions, and custom layouts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BC Limits Reference */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Category Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Maximum category depth</span>
                    <span className="text-green-400 font-medium">5 levels</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Maximum categories</span>
                    <span className="text-slate-300">16,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Category name max length</span>
                    <span className="text-slate-300">255 characters</span>
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
