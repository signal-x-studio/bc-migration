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

    // Sample products to analyze meta fields
    const productsResponse = await api.get('products', { per_page: 100 });
    const products = productsResponse.data || [];

    // Analyze meta fields
    const metaFieldCounts: Record<string, { count: number; samples: string[]; isSerialized: boolean }> = {};
    let totalMetaCount = 0;
    let serializedCount = 0;

    for (const product of products) {
      const metaData = product.meta_data || [];
      totalMetaCount += metaData.length;

      for (const meta of metaData) {
        const key = meta.key;
        if (!metaFieldCounts[key]) {
          metaFieldCounts[key] = { count: 0, samples: [], isSerialized: false };
        }
        metaFieldCounts[key].count++;

        // Check if value looks serialized
        const valueStr = typeof meta.value === 'string' ? meta.value : JSON.stringify(meta.value);
        const isSerialized = /^[aOis]:\d+:/.test(valueStr) || (typeof meta.value === 'object' && meta.value !== null);

        if (isSerialized && !metaFieldCounts[key].isSerialized) {
          metaFieldCounts[key].isSerialized = true;
          serializedCount++;
        }

        // Keep sample values (up to 3)
        if (metaFieldCounts[key].samples.length < 3) {
          const sample = typeof meta.value === 'string' ? meta.value.substring(0, 100) : JSON.stringify(meta.value).substring(0, 100);
          metaFieldCounts[key].samples.push(sample);
        }
      }
    }

    // Convert to array
    const metaFields = Object.entries(metaFieldCounts)
      .map(([key, data]) => ({
        key,
        occurrences: data.count,
        sampleValues: data.samples,
        isSerialized: data.isSerialized,
        bcMapping: key.startsWith('_') ? 'Internal WC field' : 'Custom metafield',
      }))
      .sort((a, b) => b.occurrences - a.occurrences);

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Check for serialized data
    const serializedFields = metaFields.filter(m => m.isSerialized);
    if (serializedFields.length > 0) {
      issues.warnings.push({
        id: 'serialized-meta',
        severity: 'warning',
        title: 'Serialized meta data detected',
        description: `${serializedFields.length} meta fields contain serialized/complex data that may need special handling.`,
        affectedItems: serializedFields.length,
        recommendation: 'Review serialized fields and plan data transformation.',
      });
    }

    // Info about internal fields
    const internalFields = metaFields.filter(m => m.key.startsWith('_'));
    if (internalFields.length > 0) {
      issues.info.push({
        id: 'internal-meta',
        severity: 'info',
        title: 'Internal WC meta fields',
        description: `${internalFields.length} internal WooCommerce fields (starting with _) found. These are typically handled automatically.`,
        affectedItems: internalFields.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          totalMetaKeys: Object.keys(metaFieldCounts).length,
          uniqueMetaKeys: Object.keys(metaFieldCounts).length,
          serializedFields: serializedCount,
          avgMetaPerProduct: products.length > 0 ? totalMetaCount / products.length : 0,
        },
        issues,
        metaFields: metaFields.slice(0, 50), // Return top 50
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
