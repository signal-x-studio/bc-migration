import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

interface WCCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  description: string;
  date_expires: string | null;
  usage_count: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  free_shipping: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  product_categories: number[];
  excluded_product_categories: number[];
  minimum_amount: string;
  maximum_amount: string;
  individual_use: boolean;
}

// WC to BC discount type mapping
const DISCOUNT_TYPE_MAPPING = [
  { wcType: 'percent', bcType: 'percentage_discount', notes: 'Direct mapping' },
  { wcType: 'fixed_cart', bcType: 'per_total_discount', notes: 'Direct mapping' },
  { wcType: 'fixed_product', bcType: 'per_item_discount', notes: 'Direct mapping' },
];

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Fetch all coupons
    let page = 1;
    const allCoupons: WCCoupon[] = [];
    while (true) {
      const response = await api.get('coupons', { page, per_page: 100 });
      if (!response.data || response.data.length === 0) break;
      allCoupons.push(...response.data);
      page++;
      if (page > 10) break; // Safety limit (1000 coupons)
    }

    // Analyze coupons
    const byType: Record<string, number> = {};
    let withExpiration = 0;
    let withUsageLimit = 0;
    let withProductRestrictions = 0;
    let withCategoryRestrictions = 0;
    let withFreeShipping = 0;
    let withMinimumAmount = 0;
    let expiredCount = 0;

    const now = new Date();

    for (const coupon of allCoupons) {
      // Count by type
      const type = coupon.discount_type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      // Check features
      if (coupon.date_expires) {
        withExpiration++;
        if (new Date(coupon.date_expires) < now) {
          expiredCount++;
        }
      }
      if (coupon.usage_limit) withUsageLimit++;
      if (coupon.product_ids?.length > 0 || coupon.excluded_product_ids?.length > 0) {
        withProductRestrictions++;
      }
      if (coupon.product_categories?.length > 0 || coupon.excluded_product_categories?.length > 0) {
        withCategoryRestrictions++;
      }
      if (coupon.free_shipping) withFreeShipping++;
      if (coupon.minimum_amount && parseFloat(coupon.minimum_amount) > 0) withMinimumAmount++;
    }

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Check for unknown discount types
    const knownTypes = DISCOUNT_TYPE_MAPPING.map(m => m.wcType);
    const unknownTypes = Object.keys(byType).filter(t => !knownTypes.includes(t));
    if (unknownTypes.length > 0) {
      issues.warnings.push({
        id: 'unknown-coupon-types',
        severity: 'warning',
        title: 'Unknown coupon types found',
        description: `Unknown types: ${unknownTypes.join(', ')}. May require manual configuration.`,
        affectedItems: unknownTypes.reduce((sum, t) => sum + (byType[t] || 0), 0),
      });
    }

    // Warn about product/category restrictions needing ID mapping
    if (withProductRestrictions > 0) {
      issues.info.push({
        id: 'product-restrictions',
        severity: 'info',
        title: 'Coupons with product restrictions',
        description: `${withProductRestrictions} coupons have product restrictions. Product IDs will be mapped after product migration.`,
        affectedItems: withProductRestrictions,
      });
    }

    if (withCategoryRestrictions > 0) {
      issues.info.push({
        id: 'category-restrictions',
        severity: 'info',
        title: 'Coupons with category restrictions',
        description: `${withCategoryRestrictions} coupons have category restrictions. Category IDs will be mapped after category migration.`,
        affectedItems: withCategoryRestrictions,
      });
    }

    // Type mapping with counts
    const typeMapping = DISCOUNT_TYPE_MAPPING.map(m => ({
      ...m,
      count: byType[m.wcType] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allCoupons.length,
          byType,
          withExpiration,
          withUsageLimit,
          withProductRestrictions,
          withCategoryRestrictions,
          withFreeShipping,
          withMinimumAmount,
          expiredCount,
          activeCount: allCoupons.length - expiredCount,
        },
        issues,
        typeMapping,
        samples: allCoupons.slice(0, 5).map(c => ({
          id: c.id,
          code: c.code,
          type: c.discount_type,
          amount: c.amount,
          usageCount: c.usage_count,
          expires: c.date_expires,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
