'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { PATH_THEMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface ProductGalleryProps {
  product: BCProductPreview;
  selectedPath: PreviewPathId;
}

export function ProductGallery({ product, selectedPath }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = PATH_THEMES[selectedPath];
  const images = product.images;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className={`aspect-square bg-slate-800 flex items-center justify-center ${
        selectedPath === 'makeswift' ? 'rounded-2xl' :
        selectedPath === 'stencil' ? 'rounded-md' : 'rounded-lg'
      }`}>
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative">
        <div className={`aspect-square overflow-hidden bg-slate-800 ${
          selectedPath === 'makeswift' ? 'rounded-2xl' :
          selectedPath === 'stencil' ? 'rounded-md' : 'rounded-lg'
        }`}>
          <img
            src={images[currentIndex].url_standard}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 rounded-full text-white hover:bg-slate-800 transition-colors ${theme.colors.borderHover} border border-transparent`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 rounded-full text-white hover:bg-slate-800 transition-colors ${theme.colors.borderHover} border border-transparent`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter - Makeswift style */}
        {selectedPath === 'makeswift' && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/80 rounded-full text-xs text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={`flex gap-2 overflow-x-auto pb-2 ${
          selectedPath === 'makeswift' ? 'justify-center' : ''
        }`}>
          {images.map((image, idx) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                flex-shrink-0 w-16 h-16 overflow-hidden transition-all
                ${selectedPath === 'makeswift' ? 'rounded-xl' :
                  selectedPath === 'stencil' ? 'rounded' : 'rounded-md'}
                ${idx === currentIndex
                  ? `ring-2 ${theme.colors.ring}`
                  : 'opacity-60 hover:opacity-100'
                }
              `}
            >
              <img
                src={image.url_tiny}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
