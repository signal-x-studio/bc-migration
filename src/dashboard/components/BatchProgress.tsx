'use client';

import { Package, FolderTree, Users, ShoppingCart, Search, Puzzle, Database, CheckCircle, Loader2, Circle } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import type { AssessmentArea } from '../lib/types';

interface BatchProgressProps {
  currentArea: AssessmentArea | null;
  completedAreas: AssessmentArea[];
  isRunning: boolean;
}

const areaConfig: Record<AssessmentArea, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  products: { icon: Package, label: 'Products' },
  categories: { icon: FolderTree, label: 'Categories' },
  customers: { icon: Users, label: 'Customers' },
  orders: { icon: ShoppingCart, label: 'Orders' },
  seo: { icon: Search, label: 'SEO & URLs' },
  plugins: { icon: Puzzle, label: 'Plugins' },
  customData: { icon: Database, label: 'Custom Data' },
};

const areaOrder: AssessmentArea[] = ['products', 'categories', 'customers', 'orders', 'seo', 'plugins', 'customData'];

export function BatchProgress({ currentArea, completedAreas, isRunning }: BatchProgressProps) {
  if (!isRunning && completedAreas.length === 0) return null;

  const progress = (completedAreas.length / areaOrder.length) * 100;

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-100">Batch Assessment Progress</h3>
          <span className="text-sm text-slate-400">
            {completedAreas.length} / {areaOrder.length} complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Area steps */}
        <div className="flex justify-between">
          {areaOrder.map((area, index) => {
            const config = areaConfig[area];
            const Icon = config.icon;
            const isCompleted = completedAreas.includes(area);
            const isCurrent = currentArea === area;
            const isPending = !isCompleted && !isCurrent;

            return (
              <div key={area} className="flex flex-col items-center">
                {/* Connector line (except for first item) */}
                <div className="flex items-center w-full mb-2">
                  {index > 0 && (
                    <div className={`h-0.5 flex-1 ${
                      completedAreas.includes(areaOrder[index - 1]) ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}

                  {/* Status icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500/20'
                      : isCurrent
                        ? 'bg-blue-500/20'
                        : 'bg-slate-800'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  {index < areaOrder.length - 1 && (
                    <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-green-500' : 'bg-slate-700'}`} />
                  )}
                </div>

                {/* Icon and label */}
                <Icon className={`w-4 h-4 mb-1 ${
                  isCompleted
                    ? 'text-green-400'
                    : isCurrent
                      ? 'text-blue-400'
                      : 'text-slate-600'
                }`} />
                <span className={`text-xs ${
                  isCompleted
                    ? 'text-green-400'
                    : isCurrent
                      ? 'text-blue-400'
                      : 'text-slate-600'
                }`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
