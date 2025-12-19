import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Get system status and a sample product
    const [systemStatus, productsResponse] = await Promise.all([
      api.get('system_status').catch(() => ({ data: {} })),
      api.get('products', { per_page: 5 }),
    ]);

    const activePlugins = systemStatus.data?.active_plugins || [];
    const hasYoast = activePlugins.some((p: any) => p.plugin?.includes('wordpress-seo') || p.name?.toLowerCase().includes('yoast'));
    const hasRankMath = activePlugins.some((p: any) => p.plugin?.includes('seo-by-rank-math') || p.name?.toLowerCase().includes('rank math'));

    // Infer permalink structure from product URLs
    const products = productsResponse.data || [];
    let permalinkStructure = '/product/%productname%';
    let isStandard = true;
    const urlSamples: string[] = [];

    if (products.length > 0) {
      const sampleUrl = products[0].permalink || '';
      urlSamples.push(sampleUrl);

      if (sampleUrl.includes('/shop/')) {
        permalinkStructure = '/shop/%productname%';
      } else if (sampleUrl.includes('/store/')) {
        permalinkStructure = '/store/%productname%';
      }

      isStandard = sampleUrl.includes('/product/');
    }

    // Get total counts for redirect estimate
    const productCountResponse = await api.get('products', { per_page: 1 });
    const productCount = parseInt(productCountResponse.headers['x-wp-total'] || '0', 10);

    // Estimate redirects needed
    const redirectEstimate = isStandard ? 0 : productCount;

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    if (!isStandard) {
      issues.warnings.push({
        id: 'non-standard-permalinks',
        severity: 'warning',
        title: 'Non-standard permalink structure',
        description: `URLs use "${permalinkStructure}" instead of standard "/product/" structure. May require redirects.`,
        affectedItems: productCount,
        recommendation: 'Set up URL redirects from old WooCommerce URLs to new BigCommerce URLs.',
      });
    }

    if (hasYoast || hasRankMath) {
      issues.info.push({
        id: 'seo-plugin-detected',
        severity: 'info',
        title: `SEO plugin detected`,
        description: `${hasYoast ? 'Yoast SEO' : 'Rank Math'} found. Meta data may need migration.`,
        recommendation: 'Export SEO meta data before migration.',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          permalinkStructure,
          isStandard,
          hasYoast,
          hasRankMath,
          redirectEstimate,
        },
        issues,
        urlSamples,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
