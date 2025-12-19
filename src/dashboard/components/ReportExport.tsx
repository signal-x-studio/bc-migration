'use client';

import { Download, FileJson, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { useAssessment } from '../lib/contexts/AssessmentContext';
import { useConnection } from '../lib/contexts/ConnectionContext';

export function ReportExport() {
  const { storeInfo } = useConnection();
  const { products, categories, customers, orders, seo, plugins, customData, getOverallReadiness } = useAssessment();

  const hasAnyAssessment = products || categories || customers || orders || seo || plugins || customData;

  if (!hasAnyAssessment) return null;

  const { score, blockers, warnings } = getOverallReadiness();

  // Calculate what stays vs what moves
  const whatStays = [
    'WordPress site structure',
    'Blog content & posts',
    'Theme & design',
    'SEO rankings & equity',
    'Domain & URLs',
  ];

  const whatUpgrades: string[] = [];
  if (products) whatUpgrades.push(`${products.metrics.total} products`);
  if (categories) whatUpgrades.push(`${categories.metrics.total} categories`);
  if (customers) whatUpgrades.push(`${customers.metrics.total} customers`);
  if (orders) whatUpgrades.push(`${orders.metrics.total} orders`);

  const generateReport = () => {
    return {
      generatedAt: new Date().toISOString(),
      reportType: 'Commerce Upgrade Readiness Report',
      storeInfo,
      overallReadiness: {
        score,
        blockers,
        warnings,
        readinessLevel: blockers === 0 && warnings === 0 ? 'Ready' : blockers === 0 ? 'Minor adjustments' : 'Preparation needed'
      },
      whatStays: whatStays,
      whatMoves: whatUpgrades,
      assessments: {
        products: products ? {
          metrics: products.metrics,
          issues: products.issues,
          samples: products.samples,
        } : null,
        categories: categories ? {
          metrics: categories.metrics,
          issues: categories.issues,
          deepCategories: categories.deepCategories,
        } : null,
        customers: customers ? {
          metrics: customers.metrics,
          issues: customers.issues,
        } : null,
        orders: orders ? {
          metrics: orders.metrics,
          issues: orders.issues,
          statusMapping: orders.statusMapping,
        } : null,
        seo: seo ? {
          metrics: seo.metrics,
          issues: seo.issues,
          urlSamples: seo.urlSamples,
        } : null,
        plugins: plugins ? {
          metrics: plugins.metrics,
          issues: plugins.issues,
          pluginMappings: plugins.pluginMappings,
        } : null,
        customData: customData ? {
          metrics: customData.metrics,
          issues: customData.issues,
          metaFields: customData.metaFields,
        } : null,
      },
    };
  };

  const exportJSON = () => {
    const report = generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commerce-upgrade-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    let md = `# Commerce Upgrade Readiness Report\n\n`;
    md += `> **Keep WordPress. Upgrade Commerce.**\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n`;
    md += `**Store:** ${storeInfo?.name || 'Unknown'}\n\n`;

    // Executive Summary
    md += `## Executive Summary\n\n`;
    md += `Your WordPress site is **${score}% ready** for a commerce upgrade to BigCommerce.\n\n`;

    if (blockers === 0 && warnings === 0) {
      md += `Your commerce data is fully compatible. No preparation required.\n\n`;
    } else if (blockers === 0) {
      md += `${warnings} minor item(s) identified for review. No blockers found.\n\n`;
    } else {
      md += `${blockers} item(s) need attention before migration. ${warnings} minor item(s) for review.\n\n`;
    }

    // What Stays
    md += `## What Stays (Your WordPress Site)\n\n`;
    whatStays.forEach(item => {
      md += `- ${item}\n`;
    });
    md += `\n`;

    // What Moves to BigCommerce
    md += `## What Moves to BigCommerce\n\n`;
    if (products) {
      md += `- **${products.metrics.total.toLocaleString()} Products** with ${products.metrics.totalVariants.toLocaleString()} variants\n`;
    }
    if (categories) {
      md += `- **${categories.metrics.total.toLocaleString()} Categories** (max depth: ${categories.metrics.maxDepth})\n`;
    }
    if (customers) {
      md += `- **${customers.metrics.total.toLocaleString()} Customers** (${customers.metrics.withOrders} with purchase history)\n`;
    }
    if (orders) {
      md += `- **${orders.metrics.total.toLocaleString()} Orders** for reference\n`;
    }
    md += `\n`;

    // What You Get with BigCommerce
    md += `## What You Get with BigCommerce\n\n`;
    md += `| Feature | WooCommerce | BigCommerce |\n`;
    md += `|---------|-------------|-------------|\n`;
    md += `| Variants per product | Plugin limits | 600 native |\n`;
    md += `| Checkout | Extension sprawl | Apple Pay, Google Pay built-in |\n`;
    md += `| B2B Features | Plugins required | Native price lists, customer groups |\n`;
    md += `| Uptime SLA | None | 99.99% guaranteed |\n`;
    md += `| API Rate Limits | Server dependent | Unlimited |\n`;
    md += `| Multi-storefront | Plugin required | Native |\n\n`;

    // Preparation Checklist
    if (blockers > 0 || warnings > 0) {
      md += `## Preparation Checklist\n\n`;

      if (products?.issues.blockers.length) {
        products.issues.blockers.forEach(issue => {
          md += `- [ ] **${issue.title}** - ${issue.description}`;
          if (issue.affectedItems) md += ` (${issue.affectedItems} items)`;
          md += `\n`;
        });
      }
      if (categories?.issues.blockers.length) {
        categories.issues.blockers.forEach(issue => {
          md += `- [ ] **${issue.title}** - ${issue.description}`;
          if (issue.affectedItems) md += ` (${issue.affectedItems} items)`;
          md += `\n`;
        });
      }
      if (products?.issues.warnings.length) {
        products.issues.warnings.forEach(issue => {
          md += `- [ ] *(Minor)* ${issue.title} - ${issue.description}`;
          if (issue.affectedItems) md += ` (${issue.affectedItems} items)`;
          md += `\n`;
        });
      }
      md += `\n`;
    }

    // Detailed Assessments
    md += `---\n\n`;
    md += `## Detailed Assessment Data\n\n`;

    if (products) {
      md += `### Products\n\n`;
      md += `| Metric | Value |\n|--------|-------|\n`;
      md += `| Total Products | ${products.metrics.total.toLocaleString()} |\n`;
      md += `| Total Variants | ${products.metrics.totalVariants.toLocaleString()} |\n`;
      md += `| Variable Products | ${products.metrics.withVariants} |\n`;
      md += `| Average Price | $${products.metrics.avgPrice.toFixed(2)} |\n`;
      md += `| Without SKU | ${products.metrics.withoutSKU} |\n`;
      md += `| Without Images | ${products.metrics.withoutImages} |\n\n`;

      if (products.metrics.byType) {
        md += `**Product Types:** `;
        md += Object.entries(products.metrics.byType).map(([type, count]) => `${type}: ${count}`).join(', ');
        md += `\n\n`;
      }
    }

    if (categories) {
      md += `### Categories\n\n`;
      md += `| Metric | Value | BC Limit |\n|--------|-------|----------|\n`;
      md += `| Total Categories | ${categories.metrics.total} | Unlimited |\n`;
      md += `| Maximum Depth | ${categories.metrics.maxDepth} | 5 levels |\n`;
      md += `| Empty Categories | ${categories.metrics.emptyCategories} | - |\n\n`;
    }

    if (customers) {
      md += `### Customers\n\n`;
      md += `| Metric | Value |\n|--------|-------|\n`;
      md += `| Total Customers | ${customers.metrics.total.toLocaleString()} |\n`;
      md += `| With Purchase History | ${customers.metrics.withOrders} |\n`;
      md += `| With Addresses | ${customers.metrics.withAddresses} |\n\n`;
      md += `*Note: Customer passwords will require reset after migration.*\n\n`;
    }

    if (orders) {
      md += `### Orders\n\n`;
      md += `| Metric | Value |\n|--------|-------|\n`;
      md += `| Total Orders | ${orders.metrics.total.toLocaleString()} |\n`;
      md += `| With Refunds | ${orders.metrics.withRefunds} |\n`;
      md += `| Avg Items/Order | ${orders.metrics.avgItemsPerOrder.toFixed(1)} |\n\n`;

      if (orders.statusMapping?.length > 0) {
        md += `**Status Mapping (WC to BC):**\n\n`;
        md += `| WC Status | BC Status | Count |\n|-----------|-----------|-------|\n`;
        orders.statusMapping.forEach(m => {
          md += `| ${m.wcStatus} | ${m.bcStatus} | ${m.count} |\n`;
        });
        md += `\n`;
      }
    }

    if (seo) {
      md += `### SEO Protection\n\n`;
      md += `| Setting | Value |\n|---------|-------|\n`;
      md += `| Permalink Structure | ${seo.metrics.permalinkStructure} |\n`;
      md += `| Yoast SEO | ${seo.metrics.hasYoast ? 'Detected' : 'Not found'} |\n`;
      md += `| Rank Math | ${seo.metrics.hasRankMath ? 'Detected' : 'Not found'} |\n`;
      md += `| Estimated Redirects | ${seo.metrics.redirectEstimate} |\n\n`;
    }

    if (plugins) {
      md += `### Plugin Functionality Mapping\n\n`;
      md += `| Metric | Value |\n|--------|-------|\n`;
      md += `| Active Plugins | ${plugins.metrics.totalActive} |\n`;
      md += `| With BC Equivalent | ${plugins.metrics.withBCEquivalent} |\n`;
      md += `| Native in BC | Check BigCommerce features |\n`;
      md += `| Needs Manual Review | ${plugins.metrics.requiresManualReview} |\n\n`;

      if (plugins.pluginMappings?.length > 0) {
        md += `**Mapping Details:**\n\n`;
        md += `| WC Plugin | BC Equivalent | Complexity |\n|-----------|---------------|------------|\n`;
        plugins.pluginMappings.slice(0, 20).forEach(p => {
          md += `| ${p.wcPlugin} | ${p.bcEquivalent || 'Native/None'} | ${p.migrationComplexity} |\n`;
        });
        md += `\n`;
      }
    }

    if (customData) {
      md += `### Custom Data\n\n`;
      md += `| Metric | Value |\n|--------|-------|\n`;
      md += `| Unique Meta Fields | ${customData.metrics.uniqueMetaKeys} |\n`;
      md += `| Total Meta Entries | ${customData.metrics.totalMetaKeys.toLocaleString()} |\n`;
      md += `| Serialized (Complex) | ${customData.metrics.serializedFields} |\n\n`;
    }

    // Footer
    md += `---\n\n`;
    md += `## Next Steps\n\n`;
    md += `1. Review and resolve any preparation items listed above\n`;
    md += `2. Contact your BigCommerce partner or sales representative\n`;
    md += `3. Schedule your commerce upgrade\n\n`;
    md += `*Report generated by Commerce Upgrade Assessment Tool*\n`;
    md += `*Keep WordPress. Upgrade Commerce.*\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commerce-upgrade-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          Commerce Upgrade Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">
              {score}% ready for commerce upgrade
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Download your readiness report to share with your team or BigCommerce partner.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportJSON}>
            <FileJson className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="primary"
            onClick={exportMarkdown}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
