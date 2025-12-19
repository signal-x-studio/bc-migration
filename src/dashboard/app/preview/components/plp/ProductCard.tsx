'use client';

import { Package, AlertTriangle, XCircle, Star } from 'lucide-react';
import { PATH_THEMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface ProductCardProps {
  product: BCProductPreview;
  selectedPath: PreviewPathId;
  onClick: () => void;
}

/**
 * ProductCard with authentic styling based on actual frontend codebases:
 * - Catalyst: Soul design system from bigcommerce/catalyst
 * - Stencil: Cornerstone theme from bigcommerce/cornerstone
 * - Makeswift: Visual builder patterns from makeswift.com
 */
export function ProductCard({ product, selectedPath, onClick }: ProductCardProps) {
  const theme = PATH_THEMES[selectedPath];
  const hasErrors = product._validation.issues.some(i => i.severity === 'error');
  const hasWarnings = product._validation.issues.some(i => i.severity === 'warning');
  const mainImage = product.images.find(img => img.is_thumbnail) || product.images[0];
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isOutOfStock = product.inventory_level === 0;

  return (
    <button
      onClick={onClick}
      className={`
        text-left w-full transition-all
        ${theme.cardWrapper}
        ${hasErrors ? 'ring-2 ring-red-500/30' : hasWarnings ? 'ring-2 ring-yellow-500/20' : ''}
      `}
    >
      {/* Image Container */}
      <div className={`${theme.cardImageContainer} ${theme.imageAspect}`}>
        {mainImage ? (
          <img
            src={mainImage.url_standard}
            alt={product.name}
            className={theme.cardImageStyle}
          />
        ) : (
          <div className={`w-full h-full ${theme.placeholderStyle}`}>
            <Package className="w-12 h-12 text-slate-500" />
          </div>
        )}

        {/* Badge - Sale or Out of Stock */}
        {isOnSale && (
          <div className={theme.badgeWrapper}>
            <span className={theme.badgeSale}>
              {selectedPath === 'stencil' ? 'On Sale!' : 'Sale'}
            </span>
          </div>
        )}
        {isOutOfStock && !isOnSale && (
          <div className={theme.badgeWrapper}>
            <span className={theme.badgeOutOfStock}>
              Sold Out
            </span>
          </div>
        )}

        {/* Validation Indicator */}
        {(hasErrors || hasWarnings) && (
          <div className="absolute top-2 right-2">
            {hasErrors ? (
              <div className="p-1 rounded-full bg-red-500/90">
                <XCircle className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-yellow-500/90">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className={theme.cardBody}>
        {/* Rating - Stencil shows this prominently */}
        {selectedPath === 'stencil' && (
          <div className={theme.ratingWrapper}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= 4 ? theme.ratingStar : theme.ratingStarEmpty} />
            ))}
          </div>
        )}

        {/* Product Name */}
        <h3 className={theme.cardTitle}>
          {product.name}
        </h3>

        {/* Subtitle - Catalyst shows SKU as subtitle */}
        {selectedPath === 'catalyst' && product.sku && (
          <span className={theme.cardSubtitle}>{product.sku}</span>
        )}

        {/* Price */}
        <div className={theme.priceWrapper}>
          {isOnSale ? (
            <>
              <span className={theme.priceOriginal}>${product.price.toFixed(2)}</span>
              <span className={theme.priceSale}>${product.sale_price!.toFixed(2)}</span>
            </>
          ) : (
            <span className={theme.priceRegular}>${product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Variants Count - Stencil style */}
        {selectedPath === 'stencil' && product.variants.length > 1 && (
          <p className="text-xs text-neutral-500 mt-1">{product.variants.length} options</p>
        )}

        {/* Add to Cart Button - Catalyst uses minimal/no button, Stencil has primary button */}
        {selectedPath === 'stencil' && (
          <div className="mt-3">
            <span className={`${theme.buttonPrimary} w-full text-sm`}>
              Add to Cart
            </span>
          </div>
        )}

        {/* Quick Add Button - Makeswift gradient style */}
        {selectedPath === 'makeswift' && (
          <div className="mt-3">
            <span className={`${theme.buttonPrimary} w-full text-sm`}>
              Quick Add
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
