'use client';

import { useState } from 'react';
import { PATH_THEMES } from '@/lib/preview-themes';
import type { BCProductPreview, PreviewPathId } from '@/lib/types';

interface VariantSelectorProps {
  product: BCProductPreview;
  selectedPath: PreviewPathId;
}

export function VariantSelector({ product, selectedPath }: VariantSelectorProps) {
  const theme = PATH_THEMES[selectedPath];
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Group variants by option name
  const optionGroups = product.variants.reduce((groups, variant) => {
    variant.option_values?.forEach((opt) => {
      if (!groups[opt.option_display_name]) {
        groups[opt.option_display_name] = new Set<string>();
      }
      groups[opt.option_display_name].add(opt.label);
    });
    return groups;
  }, {} as Record<string, Set<string>>);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  if (Object.keys(optionGroups).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {Object.entries(optionGroups).map(([optionName, values]) => (
        <div key={optionName}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {optionName}
            {selectedOptions[optionName] && (
              <span className="text-slate-500 font-normal ml-2">
                {selectedOptions[optionName]}
              </span>
            )}
          </label>

          {/* Color swatches for color options */}
          {optionName.toLowerCase().includes('color') ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => (
                <button
                  key={value}
                  onClick={() => handleOptionSelect(optionName, value)}
                  title={value}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all
                    ${selectedOptions[optionName] === value
                      ? `${theme.colors.border} ring-2 ${theme.colors.ring} ring-offset-2 ring-offset-slate-900`
                      : 'border-slate-600 hover:border-slate-500'
                    }
                  `}
                  style={{
                    backgroundColor: getColorCode(value),
                  }}
                />
              ))}
            </div>
          ) : selectedPath === 'makeswift' ? (
            /* Pill buttons for Makeswift */
            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => (
                <button
                  key={value}
                  onClick={() => handleOptionSelect(optionName, value)}
                  className={`
                    px-4 py-2 rounded-full text-sm transition-all
                    ${selectedOptions[optionName] === value
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  {value}
                </button>
              ))}
            </div>
          ) : selectedPath === 'stencil' ? (
            /* Dropdown for Stencil */
            <select
              value={selectedOptions[optionName] || ''}
              onChange={(e) => handleOptionSelect(optionName, e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select {optionName}</option>
              {Array.from(values).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          ) : (
            /* Button group for BC Bridge */
            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => (
                <button
                  key={value}
                  onClick={() => handleOptionSelect(optionName, value)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm border transition-all
                    ${selectedOptions[optionName] === value
                      ? `${theme.colors.border} ${theme.colors.bg} text-white`
                      : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }
                  `}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Variant count indicator */}
      <p className="text-xs text-slate-500">
        {product.variants.length} total variants available
      </p>
    </div>
  );
}

// Helper to convert color names to hex codes
function getColorCode(colorName: string): string {
  const colors: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#ec4899',
    gray: '#6b7280',
    grey: '#6b7280',
    navy: '#1e3a5f',
    brown: '#92400e',
    beige: '#f5f5dc',
    gold: '#ffd700',
    silver: '#c0c0c0',
  };

  const lowerName = colorName.toLowerCase();
  return colors[lowerName] || '#6b7280';
}
