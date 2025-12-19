'use client';

import { Rocket, Palette, Sparkles } from 'lucide-react';
import type { PreviewPathId } from '@/lib/types';
import { PATH_THEMES } from '@/lib/preview-themes';

interface PathSwitcherProps {
  selectedPath: PreviewPathId;
  onPathChange: (path: PreviewPathId) => void;
}

const PATH_ICONS: Record<PreviewPathId, typeof Rocket> = {
  catalyst: Rocket,     // Modern, headless
  stencil: Palette,     // Theme/design focused
  makeswift: Sparkles,  // Visual builder
};

export function PathSwitcher({ selectedPath, onPathChange }: PathSwitcherProps) {
  const paths: PreviewPathId[] = ['catalyst', 'stencil', 'makeswift'];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
      {paths.map((path) => {
        const Icon = PATH_ICONS[path];
        const theme = PATH_THEMES[path];
        const isSelected = selectedPath === path;

        return (
          <button
            key={path}
            onClick={() => onPathChange(path)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md transition-all
              ${isSelected
                ? `${theme.colors.bg} ${theme.colors.border} border ${theme.colors.text}`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{theme.name}</span>
          </button>
        );
      })}
    </div>
  );
}
