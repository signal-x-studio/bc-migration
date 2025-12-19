'use client';

import { useState } from 'react';
import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import {
  CheckSquare, Download, Copy, Check, AlertTriangle, XCircle,
  ArrowRight, Sparkles, Clock, Target, ListChecks
} from 'lucide-react';
import type { Issue } from '@/lib/types';

interface ActionItem {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  area: string;
  title: string;
  description: string;
  effort: 'quick' | 'moderate' | 'significant';
  wcIds?: (number | string)[];
}

export function NextActions() {
  const { storeInfo } = useConnection();
  const {
    products,
    categories,
    customers,
    orders,
    seo,
    plugins,
    customData,
  } = useAssessment();

  const [copied, setCopied] = useState(false);

  // Build action items from all assessments
  const buildActionItems = (): ActionItem[] => {
    const items: ActionItem[] = [];

    // Products blockers - Critical priority
    if (products) {
      products.issues.blockers.forEach((issue: Issue) => {
        // Get affected product IDs from samples if available
        const affectedIds = products.samples.highVariantProducts
          .filter(p => p.issue?.toLowerCase().includes(issue.title.toLowerCase().split(' ')[0]))
          .map(p => p.id);
        items.push({
          id: `products-${issue.id}`,
          priority: 'critical',
          area: 'Products',
          title: issue.title,
          description: issue.description,
          effort: issue.affectedItems && issue.affectedItems > 10 ? 'significant' : 'moderate',
          wcIds: affectedIds.length > 0 ? affectedIds : undefined,
        });
      });
      products.issues.warnings.forEach((issue: Issue) => {
        items.push({
          id: `products-${issue.id}`,
          priority: 'high',
          area: 'Products',
          title: issue.title,
          description: issue.description,
          effort: issue.affectedItems && issue.affectedItems > 5 ? 'moderate' : 'quick',
        });
      });
    }

    // Categories blockers - Critical
    if (categories) {
      categories.issues.blockers.forEach((issue: Issue) => {
        items.push({
          id: `categories-${issue.id}`,
          priority: 'critical',
          area: 'Categories',
          title: issue.title,
          description: issue.description,
          effort: 'moderate',
        });
      });
    }

    // Customers - passwords always need attention
    if (customers && customers.metrics.total > 0) {
      items.push({
        id: 'customers-password-reset',
        priority: 'medium',
        area: 'Customers',
        title: 'Prepare Customer Password Reset Campaign',
        description: `${customers.metrics.total} customers will need to reset passwords. Download the email template from the Customers detail page.`,
        effort: 'moderate',
      });
    }

    // SEO redirects
    if (seo && seo.metrics.redirectEstimate > 0) {
      items.push({
        id: 'seo-redirects',
        priority: 'high',
        area: 'SEO',
        title: 'Configure SEO Redirects',
        description: `Download the redirect rules (${seo.metrics.redirectEstimate} estimated) from the SEO detail page and apply to your hosting.`,
        effort: seo.metrics.redirectEstimate > 100 ? 'moderate' : 'quick',
      });
    }

    // Plugins without equivalents
    if (plugins) {
      const noEquivalent = plugins.pluginMappings.filter(p => p.type === 'none');
      if (noEquivalent.length > 0) {
        items.push({
          id: 'plugins-review',
          priority: 'medium',
          area: 'Plugins',
          title: 'Review Plugin Functionality',
          description: `${noEquivalent.length} plugin(s) have no BigCommerce equivalent. Determine if functionality is still needed.`,
          effort: 'moderate',
        });
      }
    }

    // Custom data serialized fields
    if (customData && customData.metrics.serializedFields > 0) {
      items.push({
        id: 'customdata-serialize',
        priority: 'high',
        area: 'Custom Data',
        title: 'Transform Serialized Meta Fields',
        description: `${customData.metrics.serializedFields} serialized PHP fields need to be converted to JSON or flattened.`,
        effort: 'significant',
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return items;
  };

  const actions = buildActionItems();
  const criticalCount = actions.filter(a => a.priority === 'critical').length;
  const highCount = actions.filter(a => a.priority === 'high').length;
  const hasAnyAssessment = products || categories || customers || orders || seo || plugins || customData;

  if (!hasAnyAssessment) return null;

  const generateActionPlan = () => {
    const storeName = storeInfo?.name || 'Your Store';
    const date = new Date().toLocaleDateString();

    let plan = `# Commerce Upgrade Action Plan
## ${storeName}
Generated: ${date}

---

## Summary
- **Critical Actions:** ${criticalCount}
- **High Priority:** ${highCount}
- **Total Actions:** ${actions.length}

---

## Pre-Migration Checklist

`;

    // Group by priority
    const byPriority = {
      critical: actions.filter(a => a.priority === 'critical'),
      high: actions.filter(a => a.priority === 'high'),
      medium: actions.filter(a => a.priority === 'medium'),
      low: actions.filter(a => a.priority === 'low'),
    };

    if (byPriority.critical.length > 0) {
      plan += `### CRITICAL - Must Resolve Before Migration

`;
      byPriority.critical.forEach((action, i) => {
        plan += `${i + 1}. [ ] **${action.title}** (${action.area})
   ${action.description}
   ${action.wcIds ? `Affected IDs: ${action.wcIds.join(', ')}` : ''}
   Estimated Effort: ${action.effort}

`;
      });
    }

    if (byPriority.high.length > 0) {
      plan += `### HIGH PRIORITY - Address Before Go-Live

`;
      byPriority.high.forEach((action, i) => {
        plan += `${i + 1}. [ ] **${action.title}** (${action.area})
   ${action.description}
   Estimated Effort: ${action.effort}

`;
      });
    }

    if (byPriority.medium.length > 0) {
      plan += `### MEDIUM PRIORITY - Complete Within First Week

`;
      byPriority.medium.forEach((action, i) => {
        plan += `${i + 1}. [ ] **${action.title}** (${action.area})
   ${action.description}

`;
      });
    }

    plan += `---

## Next Steps

1. Resolve all CRITICAL items before proceeding
2. Download artifacts from detail pages:
   - SEO Redirect Rules (htaccess/CSV)
   - Password Reset Email Template
   - Full Assessment Report
3. Back up your WooCommerce database
4. Contact your BigCommerce partner to schedule migration

---

Keep WordPress. Upgrade Commerce.
`;

    return plan;
  };

  const copyActionPlan = () => {
    navigator.clipboard.writeText(generateActionPlan());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadActionPlan = () => {
    const blob = new Blob([generateActionPlan()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-plan-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityBadge = (priority: ActionItem['priority']) => {
    const styles = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return `px-2 py-0.5 rounded text-xs border ${styles[priority]}`;
  };

  const getEffortBadge = (effort: ActionItem['effort']) => {
    const config = {
      quick: { icon: Clock, label: '< 1 hour', color: 'text-green-400' },
      moderate: { icon: Clock, label: '1-4 hours', color: 'text-yellow-400' },
      significant: { icon: Clock, label: '4+ hours', color: 'text-orange-400' },
    };
    const { icon: Icon, label, color } = config[effort];
    return (
      <span className={`flex items-center gap-1 text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-purple-400" />
          Next Best Actions
        </CardTitle>
        <p className="text-sm text-slate-400">
          Prioritized checklist to prepare for your commerce upgrade
        </p>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-medium">All Clear!</p>
            <p className="text-sm text-slate-400">No critical actions needed. You&apos;re ready for migration.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-400">Action Items:</span>
                <span className="font-bold text-slate-200">{actions.length}</span>
              </div>
              {criticalCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{criticalCount} critical</span>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400">{highCount} high priority</span>
                </div>
              )}
            </div>

            {/* Action List */}
            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {actions.slice(0, 10).map((action) => (
                <div
                  key={action.id}
                  className={`p-4 rounded-lg border ${
                    action.priority === 'critical'
                      ? 'border-red-500/30 bg-red-500/5'
                      : action.priority === 'high'
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-slate-700 bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CheckSquare className="w-4 h-4 text-slate-500 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={getPriorityBadge(action.priority)}>
                            {action.priority}
                          </span>
                          <span className="text-xs text-slate-500">{action.area}</span>
                        </div>
                        <p className="font-medium text-slate-200">{action.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                        {action.wcIds && action.wcIds.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            Affected IDs: {action.wcIds.slice(0, 5).join(', ')}
                            {action.wcIds.length > 5 && ` +${action.wcIds.length - 5} more`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getEffortBadge(action.effort)}
                    </div>
                  </div>
                </div>
              ))}
              {actions.length > 10 && (
                <p className="text-sm text-slate-500 text-center">
                  +{actions.length - 10} more items in full report
                </p>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={downloadActionPlan}>
                <Download className="w-4 h-4 mr-2" />
                Download Action Plan
              </Button>
              <Button variant="ghost" onClick={copyActionPlan}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
