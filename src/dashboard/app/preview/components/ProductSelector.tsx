'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Package } from 'lucide-react';
import type { BCProductPreview } from '@/lib/types';

interface ProductSelectorProps {
  products: BCProductPreview[];
  selectedProductId: number | null;
  onSelect: (productId: number) => void;
}

export function ProductSelector({ products, selectedProductId, onSelect }: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors min-w-[250px]"
      >
        {selectedProduct ? (
          <>
            {selectedProduct.images[0] ? (
              <img
                src={selectedProduct.images[0].url_tiny}
                alt=""
                className="w-6 h-6 rounded object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center">
                <Package className="w-3 h-3 text-slate-500" />
              </div>
            )}
            <span className="text-sm text-white truncate flex-1 text-left">
              {selectedProduct.name}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-400">Select a product...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No products found
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelect(product.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`
                    w-full flex items-center gap-3 p-3 hover:bg-slate-700/50 transition-colors text-left
                    ${selectedProductId === product.id ? 'bg-slate-700/50' : ''}
                  `}
                >
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url_tiny}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{product.name}</div>
                    <div className="text-xs text-slate-500">
                      {product.sku || 'No SKU'} · ${product.price.toFixed(2)}
                    </div>
                  </div>
                  {product._validation.issues.length > 0 && (
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
