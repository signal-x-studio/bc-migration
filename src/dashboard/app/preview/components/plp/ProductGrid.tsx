'use client';

import { ProductCard } from './ProductCard';
import { PATH_THEMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface ProductGridProps {
  products: BCProductPreview[];
  selectedPath: PreviewPathId;
  onProductClick: (productId: number) => void;
}

/**
 * Product grid with authentic layout based on frontend codebases:
 * - Catalyst: gap-6, responsive 2/3/4 columns
 * - Stencil: gap-0 (cards touch), 2/3/4 columns
 * - Makeswift: gap-8, generous spacing, 1/2/3/4 columns
 */
export function ProductGrid({ products, selectedPath, onProductClick }: ProductGridProps) {
  const theme = PATH_THEMES[selectedPath];

  return (
    <div className={`${theme.gridWrapper} ${theme.gridColumns}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedPath={selectedPath}
          onClick={() => onProductClick(product.id)}
        />
      ))}
    </div>
  );
}
