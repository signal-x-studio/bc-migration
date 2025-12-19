'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { useBCConnection } from '@/lib/contexts/BCConnectionContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PathSwitcher } from './components/PathSwitcher';
import { ViewTabs } from './components/ViewTabs';
import { PLPPreview } from './components/plp/PLPPreview';
import { PDPPreview } from './components/pdp/PDPPreview';
import { SEOPreview } from './components/SEOPreview';
import { ValidationSummary } from './components/ValidationSummary';
import { ProductSelector } from './components/ProductSelector';
import type { PreviewPathId, PreviewView, BCProductPreview } from '@/lib/types';

export default function PreviewPage() {
  const { credentials: wcCredentials, isConnected: wcConnected } = useConnection();
  const { credentials: bcCredentials, isConnected: bcConnected } = useBCConnection();

  const [selectedPath, setSelectedPath] = useState<PreviewPathId>('catalyst');
  const [selectedView, setSelectedView] = useState<PreviewView>('plp');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<BCProductPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total: 0, withIssues: 0, errors: 0, warnings: 0 });

  const fetchProducts = async () => {
    if (!bcCredentials) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/preview/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeHash: bcCredentials.storeHash,
          accessToken: bcCredentials.accessToken,
          limit: 24,
          page: 1,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products);
        setSummary(result.data.summary);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bcConnected && bcCredentials) {
      fetchProducts();
    }
  }, [bcConnected, bcCredentials]);

  const handleProductSelect = (productId: number) => {
    setSelectedProductId(productId);
    setSelectedView('pdp');
  };

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  if (!wcConnected || !bcConnected) {
    return (
      <div className="min-h-screen bg-slate-950">
        <header className="border-b border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white">Store Preview</h1>
            <p className="text-slate-400 mt-1">Preview how your products will look in different storefronts</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-slate-900/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Connection Required</h3>
                  <p className="text-slate-400 mb-4">
                    To preview your store, you need both WooCommerce and BigCommerce connected.
                  </p>
                  <div className="flex gap-4">
                    {!wcConnected && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        WooCommerce not connected
                      </div>
                    )}
                    {!bcConnected && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        BigCommerce not connected
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    {!wcConnected && (
                      <Link href="/">
                        <Button variant="secondary">Connect WooCommerce</Button>
                      </Link>
                    )}
                    {!bcConnected && (
                      <Link href="/setup">
                        <Button variant="primary">Connect BigCommerce</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchProducts}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Store Preview</h1>
              <p className="text-slate-400 text-sm">Preview how your products will look in different storefronts</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-400">WC:</span>
              <span className="text-slate-200">{wcCredentials?.url.replace(/https?:\/\//, '')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-400">BC:</span>
              <span className="text-slate-200">store-{bcCredentials?.storeHash}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <PathSwitcher selectedPath={selectedPath} onPathChange={setSelectedPath} />
          <div className="w-px h-8 bg-slate-700" />
          <ViewTabs selectedView={selectedView} onViewChange={setSelectedView} />
          {(selectedView === 'pdp' || selectedView === 'seo') && (
            <>
              <div className="w-px h-8 bg-slate-700" />
              <ProductSelector
                products={products}
                selectedProductId={selectedProductId}
                onSelect={handleProductSelect}
              />
            </>
          )}
        </div>

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{summary.total}</div>
                <div className="text-sm text-slate-400">Products</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">{summary.total - summary.withIssues}</div>
                <div className="text-sm text-slate-400">Ready</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400">{summary.warnings}</div>
                <div className="text-sm text-slate-400">Warnings</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
                <div className="text-sm text-slate-400">Errors</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
              <Button variant="ghost" size="sm" onClick={fetchProducts} className="ml-auto">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && products.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading products from BigCommerce...</p>
            </div>
          </div>
        )}

        {/* Preview Content */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {selectedView === 'plp' && (
                <PLPPreview
                  products={products}
                  selectedPath={selectedPath}
                  onProductClick={handleProductSelect}
                />
              )}
              {selectedView === 'pdp' && (
                <PDPPreview
                  product={selectedProduct}
                  selectedPath={selectedPath}
                  onBack={() => setSelectedView('plp')}
                />
              )}
              {selectedView === 'seo' && (
                <SEOPreview
                  product={selectedProduct}
                  storeName={bcCredentials?.storeHash ? `Store ${bcCredentials.storeHash}` : 'Your Store'}
                  storeUrl={bcCredentials?.storeHash ? `store-${bcCredentials.storeHash}.mybigcommerce.com` : 'yourstore.com'}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              <ValidationSummary products={products} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && !error && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Products Found</h3>
              <p className="text-slate-400 mb-4">
                There are no visible products in your BigCommerce store yet.
              </p>
              <Link href="/migrate">
                <Button variant="primary">Migrate Products</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
