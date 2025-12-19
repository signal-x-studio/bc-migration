import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// Known plugin mappings
const PLUGIN_MAPPINGS: Record<string, { bcEquivalent: string | null; type: string; complexity: string; notes: string }> = {
  'woocommerce-subscriptions': {
    bcEquivalent: 'BigCommerce Subscriptions / Recharge',
    type: 'app',
    complexity: 'high',
    notes: 'Complex migration, subscription data needs careful handling',
  },
  'woocommerce-memberships': {
    bcEquivalent: 'MemberStack / Bold Memberships',
    type: 'app',
    complexity: 'high',
    notes: 'Membership tiers need manual recreation',
  },
  'advanced-custom-fields': {
    bcEquivalent: 'BigCommerce Metafields',
    type: 'native',
    complexity: 'medium',
    notes: 'Custom fields map to metafields',
  },
  'wordpress-seo': {
    bcEquivalent: 'BigCommerce Native SEO',
    type: 'native',
    complexity: 'low',
    notes: 'Meta titles/descriptions migrate, some features native to BC',
  },
  'seo-by-rank-math': {
    bcEquivalent: 'BigCommerce Native SEO',
    type: 'native',
    complexity: 'low',
    notes: 'Similar to Yoast migration',
  },
  'woocommerce-gateway-stripe': {
    bcEquivalent: 'BigCommerce Stripe Integration',
    type: 'native',
    complexity: 'low',
    notes: 'Stripe is natively supported',
  },
  'woocommerce-paypal-payments': {
    bcEquivalent: 'BigCommerce PayPal Integration',
    type: 'native',
    complexity: 'low',
    notes: 'PayPal is natively supported',
  },
  'mailchimp-for-woocommerce': {
    bcEquivalent: 'Mailchimp for BigCommerce',
    type: 'app',
    complexity: 'low',
    notes: 'Official app available',
  },
  'wpml': {
    bcEquivalent: 'BigCommerce Multi-Storefront',
    type: 'native',
    complexity: 'high',
    notes: 'Requires enterprise plan for full multi-language',
  },
  'elementor': {
    bcEquivalent: null,
    type: 'none',
    complexity: 'high',
    notes: 'Page builder content needs manual recreation',
  },
  'contact-form-7': {
    bcEquivalent: 'Typeform / JotForm',
    type: 'app',
    complexity: 'low',
    notes: 'Forms need recreation in chosen tool',
  },
};

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Get active plugins
    const systemStatus = await api.get('system_status').catch(() => ({ data: {} }));
    const activePlugins = systemStatus.data?.active_plugins || [];

    const pluginMappings: any[] = [];
    let withEquivalent = 0;
    let withoutEquivalent = 0;
    let requiresManualReview = 0;

    for (const plugin of activePlugins) {
      const pluginSlug = plugin.plugin?.split('/')[0] || plugin.name?.toLowerCase().replace(/\s+/g, '-') || '';
      const mapping = PLUGIN_MAPPINGS[pluginSlug];

      if (mapping) {
        pluginMappings.push({
          wcPlugin: plugin.name || pluginSlug,
          bcEquivalent: mapping.bcEquivalent,
          type: mapping.type,
          migrationComplexity: mapping.complexity,
          notes: mapping.notes,
        });

        if (mapping.bcEquivalent) withEquivalent++;
        else withoutEquivalent++;
        if (mapping.complexity === 'high') requiresManualReview++;
      } else {
        pluginMappings.push({
          wcPlugin: plugin.name || pluginSlug,
          bcEquivalent: null,
          type: 'none',
          migrationComplexity: 'unknown',
          notes: 'No known BC equivalent - review required',
        });
        withoutEquivalent++;
        requiresManualReview++;
      }
    }

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    if (withoutEquivalent > 0) {
      issues.warnings.push({
        id: 'plugins-without-equivalent',
        severity: 'warning',
        title: 'Plugins without BC equivalent',
        description: `${withoutEquivalent} plugins have no direct BigCommerce equivalent.`,
        affectedItems: withoutEquivalent,
        recommendation: 'Review each plugin to determine if functionality is needed.',
      });
    }

    if (requiresManualReview > 0) {
      issues.info.push({
        id: 'plugins-manual-review',
        severity: 'info',
        title: 'Plugins requiring manual review',
        description: `${requiresManualReview} plugins need manual configuration or data migration.`,
        affectedItems: requiresManualReview,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          totalActive: activePlugins.length,
          withBCEquivalent: withEquivalent,
          withoutEquivalent,
          requiresManualReview,
        },
        issues,
        pluginMappings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
