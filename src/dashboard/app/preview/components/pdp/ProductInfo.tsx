'use client';

import { Star, Truck, Shield, AlertTriangle } from 'lucide-react';
import { PATH_THEMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface ProductInfoProps {
  product: BCProductPreview;
  selectedPath: PreviewPathId;
}

/**
 * ProductInfo with authentic styling based on frontend codebases:
 * - Catalyst: Clean, minimal typography with neutral colors
 * - Stencil: Traditional e-commerce with star ratings and trust badges
 * - Makeswift: Modern with gradients and pill-shaped badges
 */
export function ProductInfo({ product, selectedPath }: ProductInfoProps) {
  const theme = PATH_THEMES[selectedPath];
  const hasSale = product.sale_price && product.sale_price < product.price;

  return (
    <div className="space-y-4">
      {/* Product Name - styled per frontend */}
      <div>
        {selectedPath === 'makeswift' ? (
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            {product.name}
          </h1>
        ) : selectedPath === 'stencil' ? (
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {product.name}
          </h1>
        ) : (
          // Catalyst - clean, semibold
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-100">
            {product.name}
          </h1>
        )}
      </div>

      {/* SKU / Product Meta - Catalyst shows this subtly */}
      {selectedPath === 'catalyst' && product.sku && (
        <p className={theme.cardSubtitle}>SKU: {product.sku}</p>
      )}

      {/* Star Rating - Stencil shows this prominently */}
      {selectedPath === 'stencil' && (
        <div className={theme.ratingWrapper}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={theme.ratingStar} />
          ))}
          <span className="text-sm text-slate-400 ml-2">(0 reviews)</span>
        </div>
      )}

      {/* Price */}
      <div className={theme.priceWrapper}>
        {hasSale ? (
          <>
            <span className={`${theme.priceOriginal} text-lg`}>
              ${product.price.toFixed(2)}
            </span>
            <span className={`${theme.priceSale} text-2xl`}>
              ${product.sale_price!.toFixed(2)}
            </span>
            {selectedPath === 'makeswift' && (
              <span className={theme.badgeSale}>
                Save ${(product.price - product.sale_price!).toFixed(2)}
              </span>
            )}
            {selectedPath === 'stencil' && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm">
                {Math.round((1 - product.sale_price! / product.price) * 100)}% OFF
              </span>
            )}
          </>
        ) : (
          <span className={`${theme.priceRegular} text-2xl`}>
            ${product.price.toFixed(2)}
          </span>
        )}
      </div>

      {/* Missing price warning */}
      {!product._validation.hasPrice && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>No price set for this product</span>
        </div>
      )}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {product.inventory_level > 0 ? (
          <span className="text-sm text-green-400">
            {product.inventory_level > 10
              ? 'In Stock'
              : `Only ${product.inventory_level} left`}
          </span>
        ) : (
          <span className="text-sm text-red-400">Out of Stock</span>
        )}
      </div>

      {/* Trust Badges - Stencil style (full text) */}
      {selectedPath === 'stencil' && (
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      )}

      {/* Quick Info - Makeswift style (pill badges) */}
      {selectedPath === 'makeswift' && (
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-full text-sm text-pink-400">
            <Truck className="w-4 h-4" />
            Free Shipping
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-full text-sm text-pink-400">
            <Shield className="w-4 h-4" />
            Secure Checkout
          </div>
        </div>
      )}

      {/* Catalyst - minimal trust indicators */}
      {selectedPath === 'catalyst' && (
        <div className="flex items-center gap-4 pt-4 text-sm text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
        </div>
      )}
    </div>
  );
}
