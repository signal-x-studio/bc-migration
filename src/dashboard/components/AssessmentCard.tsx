'use client';

import { Package, FolderTree, Users, ShoppingCart, Search, Puzzle, Database, Loader2, AlertTriangle, CheckCircle, XCircle, Circle, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge, CountBadge } from './ui/Badge';
import type { AssessmentArea, AssessmentStatus, BaseAssessment } from '../lib/types';

// ============================================
// Icon Mapping
// ============================================

const areaIcons: Record<AssessmentArea, React.ComponentType<{ className?: string }>> = {
  products: Package,
  categories: FolderTree,
  customers: Users,
  orders: ShoppingCart,
  seo: Search,
  plugins: Puzzle,
  customData: Database,
};

const areaLabels: Record<AssessmentArea, string> = {
  products: 'Products',
  categories: 'Categories',
  customers: 'Customers',
  orders: 'Orders',
  seo: 'SEO & URLs',
  plugins: 'Plugins',
  customData: 'Custom Data',
};

// Reframed as what you're MOVING to BigCommerce (not issues)
const areaDescriptions: Record<AssessmentArea, string> = {
  products: 'Your catalog moving to enterprise-grade PIM',
  categories: 'Your taxonomy migrating to BC structure',
  customers: 'Customer accounts moving with purchase history',
  orders: 'Order history preserved for reference',
  seo: 'URL structure analysis for redirect planning',
  plugins: 'Extension functionality mapping to BC native features',
  customData: 'Custom fields mapping to BC metafields',
};

// What you GAIN with BigCommerce for each area
const bcUpgrades: Record<AssessmentArea, string> = {
  products: '600 variants, bulk pricing, B2B native',
  categories: 'Faceted search, SEO-optimized URLs',
  customers: 'Customer groups, price lists, saved cards',
  orders: 'Multi-warehouse, partial fulfillment, built-in returns',
  seo: '301 redirects, canonical URLs, structured data',
  plugins: 'Native subscriptions, Apple Pay, multi-storefront',
  customData: 'Metafields API, custom templates, headless-ready',
};

// ============================================
// Assessment Card Component
// ============================================

interface AssessmentCardProps {
  area: AssessmentArea;
  assessment: BaseAssessment | null;
  isLoading: boolean;
  error: string | null;
  count?: number | null;
  onAssess: () => void;
  onViewDetails?: () => void;
}

export function AssessmentCard({
  area,
  assessment,
  isLoading,
  error,
  count,
  onAssess,
  onViewDetails,
}: AssessmentCardProps) {
  const Icon = areaIcons[area];
  const label = areaLabels[area];
  const description = areaDescriptions[area];
  const upgrade = bcUpgrades[area];

  // Determine status
  let status: AssessmentStatus = 'not-assessed';
  if (isLoading) status = 'loading';
  else if (assessment) {
    if (assessment.issues.blockers.length > 0) status = 'blocker';
    else if (assessment.issues.warnings.length > 0) status = 'warning';
    else status = 'ready';
  }

  const blockerCount = assessment?.issues.blockers.length || 0;
  const warningCount = assessment?.issues.warnings.length || 0;

  // Reframe issue language
  const getReadinessLabel = () => {
    if (blockerCount > 0) return `${blockerCount} item${blockerCount > 1 ? 's' : ''} need attention`;
    if (warningCount > 0) return `${warningCount} minor adjustment${warningCount > 1 ? 's' : ''}`;
    return 'Ready for seamless transfer';
  };

  return (
    <Card variant="bordered" className="relative overflow-hidden">
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusBarColor(status)}`} />

      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getIconBgColor(status)}`}>
              <Icon className={`w-5 h-5 ${getIconColor(status)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">{label}</h3>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
          <StatusIndicator status={status} />
        </div>

        {/* Count display */}
        {count !== null && count !== undefined && (
          <div className="mb-3">
            <span className="text-2xl font-bold text-slate-100">{count.toLocaleString()}</span>
            <span className="text-sm text-slate-500 ml-2">items moving</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Assessment results - reframed as readiness */}
        {assessment && !error && (
          <div className="mb-3 flex flex-wrap gap-2">
            {blockerCount > 0 && <CountBadge count={blockerCount} type="blocker" />}
            {warningCount > 0 && <CountBadge count={warningCount} type="warning" />}
            {blockerCount === 0 && warningCount === 0 && (
              <Badge variant="success">Ready to transfer</Badge>
            )}
          </div>
        )}

        {/* What you get with BC - only show after assessment */}
        {assessment && !error && (
          <div className="mb-4 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                <span className="text-blue-400 font-medium">BC Upgrade:</span> {upgrade}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={assessment ? 'secondary' : 'primary'}
            size="sm"
            onClick={onAssess}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Analyzing...' : assessment ? 'Re-analyze' : 'Analyze'}
          </Button>
          {assessment && onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Status Indicator
// ============================================

function StatusIndicator({ status }: { status: AssessmentStatus }) {
  const config: Record<AssessmentStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    'not-assessed': { icon: Circle, color: 'text-slate-500', label: 'Not analyzed' },
    loading: { icon: Loader2, color: 'text-blue-400 animate-spin', label: 'Analyzing' },
    ready: { icon: CheckCircle, color: 'text-green-400', label: 'Ready' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Minor items' },
    blocker: { icon: XCircle, color: 'text-amber-400', label: 'Needs attention' },
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs ${color}`}>{label}</span>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function getStatusBarColor(status: AssessmentStatus): string {
  switch (status) {
    case 'ready': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'blocker': return 'bg-amber-500';
    case 'loading': return 'bg-blue-500';
    default: return 'bg-slate-700';
  }
}

function getIconBgColor(status: AssessmentStatus): string {
  switch (status) {
    case 'ready': return 'bg-green-500/20';
    case 'warning': return 'bg-yellow-500/20';
    case 'blocker': return 'bg-amber-500/20';
    case 'loading': return 'bg-blue-500/20';
    default: return 'bg-slate-800';
  }
}

function getIconColor(status: AssessmentStatus): string {
  switch (status) {
    case 'ready': return 'text-green-400';
    case 'warning': return 'text-yellow-400';
    case 'blocker': return 'text-amber-400';
    case 'loading': return 'text-blue-400';
    default: return 'text-slate-400';
  }
}
