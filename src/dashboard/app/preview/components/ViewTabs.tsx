'use client';

import { Grid, FileText } from 'lucide-react';
import type { PreviewView } from '@/lib/types';

interface ViewTabsProps {
  selectedView: PreviewView;
  onViewChange: (view: PreviewView) => void;
}

export function ViewTabs({ selectedView, onViewChange }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
      <button
        onClick={() => onViewChange('plp')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all
          ${selectedView === 'plp'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }
        `}
      >
        <Grid className="w-4 h-4" />
        <span className="text-sm font-medium">Product List</span>
      </button>
      <button
        onClick={() => onViewChange('pdp')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all
          ${selectedView === 'pdp'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }
        `}
      >
        <FileText className="w-4 h-4" />
        <span className="text-sm font-medium">Product Detail</span>
      </button>
    </div>
  );
}
