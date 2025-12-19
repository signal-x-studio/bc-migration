'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProductGrid } from './ProductGrid';
import { PATH_THEMES, PATH_NAMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface PLPPreviewProps {
  products: BCProductPreview[];
  selectedPath: PreviewPathId;
  onProductClick: (productId: number) => void;
}

export function PLPPreview({ products, selectedPath, onProductClick }: PLPPreviewProps) {
  const theme = PATH_THEMES[selectedPath];

  return (
    <Card className={`bg-slate-900/80 border ${theme.colors.border}`}>
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${theme.colors.accent}`} />
            {PATH_NAMES[selectedPath]} Preview
          </CardTitle>
          <span className="text-sm text-slate-400">
            {products.length} products
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Preview how your product listing will appear with {PATH_NAMES[selectedPath]} styling
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <ProductGrid
          products={products}
          selectedPath={selectedPath}
          onProductClick={onProductClick}
        />
      </CardContent>
    </Card>
  );
}
