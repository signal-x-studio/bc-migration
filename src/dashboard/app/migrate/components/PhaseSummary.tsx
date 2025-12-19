'use client';

import { CheckCircle, SkipForward, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  PhaseNumber,
  PHASES,
  FoundationPhaseData,
  CoreDataPhaseData,
  TransactionsPhaseData,
  ContentPhaseData,
} from '../types';
import { cn } from '@/lib/utils';

interface PhaseSummaryProps {
  phase: PhaseNumber;
  status: 'complete' | 'skipped';
  data?: FoundationPhaseData | CoreDataPhaseData | TransactionsPhaseData | ContentPhaseData;
  onClick?: () => void;
}

export function PhaseSummary({ phase, status, data, onClick }: PhaseSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const phaseInfo = PHASES[phase];

  const isSkipped = status === 'skipped';

  // Format summary based on phase
  const getSummary = () => {
    if (isSkipped) return 'Skipped';

    switch (phase) {
      case 1: {
        const d = data as FoundationPhaseData | undefined;
        if (!d) return 'Complete';
        return `${d.categoriesCreated} categories created`;
      }
      case 2: {
        const d = data as CoreDataPhaseData | undefined;
        if (!d) return 'Complete';
        const products = d.products?.migrated || 0;
        const customers = d.customers?.migrated || 0;
        return `${products} products, ${customers} customers`;
      }
      case 3: {
        const d = data as TransactionsPhaseData | undefined;
        if (!d) return 'Complete';
        const orders = d.orders?.migrated || 0;
        const coupons = d.coupons?.migrated || 0;
        return `${orders} orders, ${coupons} coupons`;
      }
      case 4: {
        const d = data as ContentPhaseData | undefined;
        if (!d) return 'Complete';
        const reviews = d.reviews?.migrated || 0;
        const pages = d.pages?.migrated || 0;
        const blog = d.blog?.migrated || 0;
        return `${reviews} reviews, ${pages} pages, ${blog} posts`;
      }
      default:
        return 'Complete';
    }
  };

  // Get detailed breakdown
  const getDetails = () => {
    if (isSkipped) return null;

    switch (phase) {
      case 1: {
        const d = data as FoundationPhaseData | undefined;
        if (!d) return null;
        return [
          { label: 'Created', value: d.categoriesCreated, color: 'text-green-400' },
          { label: 'Skipped', value: d.categoriesSkipped, color: 'text-amber-400' },
          { label: 'Errors', value: d.categoriesErrored, color: 'text-red-400' },
        ];
      }
      case 2: {
        const d = data as CoreDataPhaseData | undefined;
        if (!d) return null;
        return [
          { label: 'Products', value: d.products?.migrated || 0, color: 'text-purple-400' },
          { label: 'Customers', value: d.customers?.migrated || 0, color: 'text-green-400' },
          { label: 'Failed', value: (d.products?.failed || 0) + (d.customers?.failed || 0), color: 'text-red-400' },
        ];
      }
      case 3: {
        const d = data as TransactionsPhaseData | undefined;
        if (!d) return null;
        return [
          { label: 'Orders', value: d.orders?.migrated || 0, color: 'text-orange-400' },
          { label: 'Coupons', value: d.coupons?.migrated || 0, color: 'text-pink-400' },
          { label: 'Failed', value: (d.orders?.failed || 0) + (d.coupons?.failed || 0), color: 'text-red-400' },
        ];
      }
      case 4: {
        const d = data as ContentPhaseData | undefined;
        if (!d) return null;
        return [
          { label: 'Reviews', value: d.reviews?.migrated || 0, color: 'text-yellow-400' },
          { label: 'Pages', value: d.pages?.migrated || 0, color: 'text-cyan-400' },
          { label: 'Blog', value: d.blog?.migrated || 0, color: 'text-indigo-400' },
        ];
      }
      default:
        return null;
    }
  };

  const details = getDetails();

  return (
    <div
      className={cn(
        'border rounded-lg transition-all duration-200',
        isSkipped
          ? 'border-gray-700 bg-gray-800/50'
          : 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10',
        onClick && 'cursor-pointer'
      )}
    >
      <div
        className="flex items-center justify-between p-3"
        onClick={() => {
          if (details) setExpanded(!expanded);
          if (onClick) onClick();
        }}
      >
        <div className="flex items-center gap-3">
          {/* Status icon */}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isSkipped ? 'bg-gray-700' : 'bg-green-500/20'
          )}>
            {isSkipped ? (
              <SkipForward className="w-4 h-4 text-gray-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>

          {/* Phase info */}
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-medium',
                isSkipped ? 'text-gray-400' : 'text-white'
              )}>
                Phase {phase}: {phaseInfo.name}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {getSummary()}
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        {details && (
          <button
            className="p-1 text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && details && (
        <div className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-3 gap-2 text-sm">
            {details.map((item) => (
              <div key={item.label} className="text-center p-2 bg-gray-800 rounded">
                <div className={item.color}>{item.value}</div>
                <div className="text-gray-500 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
