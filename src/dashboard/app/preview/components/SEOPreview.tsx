'use client';

import { useState } from 'react';
import {
  Globe,
  Search,
  Share2,
  Code,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Monitor,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BCProductPreview } from '@/lib/types';

interface SEOPreviewProps {
  product: BCProductPreview | null;
  storeName?: string;
  storeUrl?: string;
}

type PreviewMode = 'google' | 'social' | 'structured';

/**
 * SEO Preview component showing how the product will appear in:
 * - Google search results
 * - Social media cards (Open Graph)
 * - Structured data (JSON-LD)
 */
export function SEOPreview({ product, storeName = 'Your Store', storeUrl = 'yourstore.com' }: SEOPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>('google');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!product) {
    return (
      <Card className="bg-slate-900/80 border border-slate-700">
        <CardContent className="p-8 text-center">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Product Selected</h3>
          <p className="text-slate-400">
            Select a product to preview its SEO appearance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const seoTitle = product.seo?.title || product.name;
  const seoDescription = product.seo?.description ||
    (product.description ? stripHtml(product.description).substring(0, 160) : '');
  const productUrl = `${storeUrl}${product.path || `/products/${product.sku}`}`;

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description || ''),
    sku: product.sku,
    image: product.images[0]?.url_standard || product.image,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: product.currency || 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: (product.reviewCount ?? 0) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(structuredData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-slate-900/80 border border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            SEO Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-2 rounded ${deviceView === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-2 rounded ${deviceView === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Mode Tabs */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setMode('google')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'google'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Google
          </button>
          <button
            onClick={() => setMode('social')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'social'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-2" />
            Social Card
          </button>
          <button
            onClick={() => setMode('structured')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'structured'
                ? 'bg-green-500/20 text-green-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Schema
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Google Search Preview */}
        {mode === 'google' && (
          <div className={`bg-white rounded-lg p-6 ${deviceView === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
            <div className="space-y-1">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-sm text-green-700">
                <span>{storeUrl}</span>
                <ChevronRight className="w-3 h-3" />
                <span>products</span>
                <ChevronRight className="w-3 h-3" />
                <span className="truncate">{product.sku || 'item'}</span>
              </div>
              {/* Title */}
              <h3 className="text-xl text-blue-800 hover:underline cursor-pointer font-normal">
                {truncate(seoTitle, deviceView === 'mobile' ? 50 : 60)}
              </h3>
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {truncate(seoDescription, deviceView === 'mobile' ? 120 : 160)}
              </p>
              {/* Rich Results */}
              {((product.reviewCount ?? 0) > 0 || product.price > 0) && (
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  {(product.reviewCount ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">{'★'.repeat(Math.round(product.rating ?? 0))}</span>
                      <span>({product.reviewCount})</span>
                    </div>
                  )}
                  {product.price > 0 && (
                    <span className="font-medium text-gray-800">
                      ${product.salePrice || product.price}
                    </span>
                  )}
                  {product.inStock && (
                    <span className="text-green-600">In stock</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Card Preview (Open Graph) */}
        {mode === 'social' && (
          <div className={`${deviceView === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-lg mx-auto'}`}>
            {/* Twitter/X Card */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Twitter / X Card</p>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                {product.image && (
                  <div className="aspect-[1.91/1] bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm text-gray-500">{storeUrl}</p>
                  <h4 className="font-bold text-gray-900 mt-1">
                    {truncate(seoTitle, 70)}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {truncate(seoDescription, 200)}
                  </p>
                </div>
              </div>
            </div>

            {/* Facebook/LinkedIn Card */}
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Facebook / LinkedIn</p>
              <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {product.image && (
                  <div className="aspect-[1.91/1] bg-gray-200 relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase">{storeUrl}</p>
                  <h4 className="font-semibold text-gray-900 text-sm mt-1">
                    {truncate(seoTitle, 60)}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {truncate(seoDescription, 100)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structured Data Preview */}
        {mode === 'structured' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                JSON-LD Product Schema
              </p>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-green-400">
                {JSON.stringify(structuredData, null, 2)}
              </code>
            </pre>
            <div className="text-sm text-slate-400">
              <p className="mb-2">Schema Validation:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Product name present
                </li>
                <li className="flex items-center gap-2">
                  {product.image ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-yellow-400" />
                  )}
                  Product image {product.image ? 'present' : 'missing (recommended)'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Offer with price present
                </li>
                <li className="flex items-center gap-2">
                  {(product.reviewCount ?? 0) > 0 ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                  Aggregate rating {(product.reviewCount ?? 0) > 0 ? 'present' : 'optional'}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* SEO Issues/Recommendations */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-medium text-white mb-3">SEO Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Title Length</span>
                <span className={seoTitle.length > 60 ? 'text-yellow-400' : 'text-green-400'}>
                  {seoTitle.length}/60
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${seoTitle.length > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((seoTitle.length / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Description Length</span>
                <span className={seoDescription.length < 120 ? 'text-yellow-400' : 'text-green-400'}>
                  {seoDescription.length}/160
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${seoDescription.length < 120 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((seoDescription.length / 160) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
