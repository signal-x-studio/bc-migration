'use client';

import { useState } from 'react';
import { AlertTriangle, XCircle, Info, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { BCProductPreview, PreviewIssueType } from '@/lib/types';

interface ValidationSummaryProps {
  products: BCProductPreview[];
}

const ISSUE_LABELS: Record<PreviewIssueType, string> = {
  missing_image: 'Missing Images',
  truncated_name: 'Long Names',
  truncated_description: 'Long Descriptions',
  missing_price: 'Missing Prices',
  variant_limit: 'Variant Limits',
  missing_sku: 'Missing SKUs',
  low_inventory: 'Low Inventory',
};

const ISSUE_ICONS: Record<PreviewIssueType, typeof AlertTriangle> = {
  missing_image: AlertTriangle,
  truncated_name: AlertTriangle,
  truncated_description: Info,
  missing_price: AlertTriangle,
  variant_limit: XCircle,
  missing_sku: Info,
  low_inventory: AlertTriangle,
};

export function ValidationSummary({ products }: ValidationSummaryProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<PreviewIssueType>>(new Set());

  // Group issues by type
  const issuesByType = products.reduce((acc, product) => {
    product._validation.issues.forEach((issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push({ product, issue });
    });
    return acc;
  }, {} as Record<PreviewIssueType, { product: BCProductPreview; issue: typeof products[0]['_validation']['issues'][0] }[]>);

  const issueTypes = Object.keys(issuesByType) as PreviewIssueType[];
  const totalIssues = Object.values(issuesByType).reduce((sum, arr) => sum + arr.length, 0);
  const errorCount = Object.values(issuesByType)
    .flat()
    .filter(i => i.issue.severity === 'error').length;
  const warningCount = Object.values(issuesByType)
    .flat()
    .filter(i => i.issue.severity === 'warning').length;

  const toggleType = (type: PreviewIssueType) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  if (totalIssues === 0) {
    return (
      <Card className="bg-slate-900/50 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            All Products Valid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            No validation issues found. Your products are ready for preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Validation Issues</span>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                {errorCount} errors
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                {warningCount} warnings
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {issueTypes.map((type) => {
          const items = issuesByType[type];
          const Icon = ISSUE_ICONS[type];
          const isExpanded = expandedTypes.has(type);
          const severity = items[0].issue.severity;

          return (
            <div key={type} className="border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleType(type)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/50 transition-colors"
              >
                <Icon className={`w-4 h-4 ${
                  severity === 'error' ? 'text-red-400' :
                  severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                }`} />
                <span className="text-sm text-white flex-1 text-left">
                  {ISSUE_LABELS[type]}
                </span>
                <span className="text-xs text-slate-400">{items.length}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-slate-700 max-h-40 overflow-y-auto">
                  {items.map(({ product, issue }, idx) => (
                    <div
                      key={`${product.id}-${idx}`}
                      className="px-3 py-2 text-xs border-b border-slate-700/50 last:border-0"
                    >
                      <div className="text-slate-300 truncate">{product.name}</div>
                      <div className="text-slate-500 mt-0.5">{issue.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
