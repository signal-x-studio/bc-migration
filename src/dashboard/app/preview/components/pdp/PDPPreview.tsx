'use client';

import { ArrowLeft, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { VariantSelector } from './VariantSelector';
import { PATH_THEMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface PDPPreviewProps {
  product: BCProductPreview | null;
  selectedPath: PreviewPathId;
  onBack: () => void;
}

/**
 * PDP Preview with authentic layouts based on actual frontend codebases:
 * - Catalyst: Clean two-column layout with generous spacing
 * - Stencil: Traditional e-commerce layout (60/40 split)
 * - Makeswift: Modern spacious layout with gradient accents
 */
export function PDPPreview({ product, selectedPath, onBack }: PDPPreviewProps) {
  const theme = PATH_THEMES[selectedPath];

  if (!product) {
    return (
      <Card className={`bg-slate-900/80 border ${theme.colors.border}`}>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Product Selected</h3>
          <p className="text-slate-400 mb-4">
            Select a product from the dropdown above to see its detail page preview.
          </p>
          <Button variant="secondary" onClick={onBack}>
            View Product List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-900/80 border ${theme.colors.border}`}>
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="w-px h-6 bg-slate-700" />
            <CardTitle className="text-lg flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${theme.colors.accent}`} />
              {theme.name} Product Detail
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Catalyst Layout - Clean, minimal two-column */}
        {selectedPath === 'catalyst' && (
          <div className={theme.pdpLayout}>
            <div className={theme.pdpGallery}>
              <ProductGallery product={product} selectedPath={selectedPath} />
            </div>
            <div className={theme.pdpInfo}>
              <ProductInfo product={product} selectedPath={selectedPath} />
              {product.variants.length > 1 && (
                <VariantSelector product={product} selectedPath={selectedPath} />
              )}
              <div className={`${theme.buttonPrimary} text-center cursor-pointer`}>
                Add to Cart
              </div>
            </div>
          </div>
        )}

        {/* Stencil Layout - Traditional e-commerce (60/40 split) */}
        {selectedPath === 'stencil' && (
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <ProductGallery product={product} selectedPath={selectedPath} />
            </div>
            <div className="md:col-span-2 space-y-6">
              <ProductInfo product={product} selectedPath={selectedPath} />
              {product.variants.length > 1 && (
                <VariantSelector product={product} selectedPath={selectedPath} />
              )}
              <div className="space-y-3">
                <div className={`${theme.buttonPrimary} w-full text-center cursor-pointer`}>
                  Add to Cart
                </div>
                <div className={`${theme.buttonSecondary} w-full text-center cursor-pointer`}>
                  Add to Wishlist
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Makeswift Layout - Modern, spacious */}
        {selectedPath === 'makeswift' && (
          <div className={theme.pdpLayout}>
            <div className={theme.pdpGallery}>
              <ProductGallery product={product} selectedPath={selectedPath} />
            </div>
            <div className={theme.pdpInfo}>
              <ProductInfo product={product} selectedPath={selectedPath} />
              {product.variants.length > 1 && (
                <VariantSelector product={product} selectedPath={selectedPath} />
              )}
              <div className={`${theme.buttonPrimary} text-center cursor-pointer`}>
                Add to Cart
              </div>
              <div className={`${theme.buttonSecondary} text-center cursor-pointer`}>
                Save for Later
              </div>
            </div>
          </div>
        )}

        {/* Product Description - Below main content */}
        {product.description && (
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h3 className={`text-lg font-semibold mb-4 ${
              selectedPath === 'makeswift'
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent'
                : 'text-white'
            }`}>
              Description
            </h3>
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-300"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Validation Issues Display */}
        {product._validation.issues.length > 0 && (
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">Validation Notes</h4>
            <ul className="space-y-2">
              {product._validation.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                    issue.severity === 'error' ? 'bg-red-500' :
                    issue.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-slate-400">{issue.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
