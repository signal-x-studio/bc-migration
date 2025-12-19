import { NextRequest } from 'next/server';
import { createWCClient } from '@/lib/wc-client';
import type { WCCoupon, CouponMigrationStats } from '@/lib/types';

/**
 * Migrate coupons from WooCommerce to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 *
 * Uses BC V2 Coupons API (legacy but simpler for basic coupons)
 */

interface MigrateCouponsRequest {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  migratedCouponCodes?: string[];
  productIdMapping?: Record<number, number>; // WC product ID -> BC product ID
  categoryIdMapping?: Record<number, number>; // WC category ID -> BC category ID
}

// WC to BC discount type mapping
const DISCOUNT_TYPE_MAP: Record<string, string> = {
  'percent': 'percentage_discount',
  'fixed_cart': 'per_total_discount',
  'fixed_product': 'per_item_discount',
};

interface BCCouponCreate {
  name: string;
  type: 'per_item_discount' | 'per_total_discount' | 'shipping_discount' | 'free_shipping' | 'percentage_discount';
  amount: string;
  min_purchase?: string;
  expires?: string;
  enabled: boolean;
  code: string;
  applies_to?: {
    entity: 'categories' | 'products';
    ids: number[];
  };
  max_uses?: number;
  max_uses_per_customer?: number;
  shipping_free_shipping?: boolean;
  restricted_to?: {
    countries?: string[];
  };
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body: MigrateCouponsRequest = await request.json();
        const {
          wcCredentials,
          bcCredentials,
          migratedCouponCodes = [],
          productIdMapping = {},
          categoryIdMapping = {},
        } = body;

        if (!wcCredentials || !bcCredentials) {
          send({ type: 'error', error: 'Missing required credentials' });
          controller.close();
          return;
        }

        // Initialize WC client
        const wcClient = await createWCClient(
          wcCredentials.url,
          wcCredentials.consumerKey,
          wcCredentials.consumerSecret
        );

        // Fetch all coupons from WooCommerce
        const allCoupons: WCCoupon[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await wcClient.get('coupons', {
            per_page: 100,
            page,
          });

          if (response.data.length === 0) {
            hasMore = false;
          } else {
            allCoupons.push(...response.data);
            page++;
          }

          if (page > 10) break; // Safety limit (1000 coupons)
        }

        // Filter out already migrated coupons by code (case-insensitive)
        const migratedCodesLower = migratedCouponCodes.map(c => c.toLowerCase());
        const couponsToMigrate = allCoupons.filter(
          coupon => !migratedCodesLower.includes(coupon.code.toLowerCase())
        );

        send({
          type: 'started',
          totalCoupons: couponsToMigrate.length,
          totalInWC: allCoupons.length,
          alreadyMigrated: allCoupons.length - couponsToMigrate.length,
        });

        const stats: CouponMigrationStats = {
          total: couponsToMigrate.length,
          successful: 0,
          skipped: 0,
          failed: 0,
          warnings: [],
        };

        const newlyMigratedCodes: string[] = [];
        const couponIdMapping: Record<number, number> = {};

        // Process coupons one by one
        for (const coupon of couponsToMigrate) {
          try {
            send({
              type: 'progress',
              completedCoupons: stats.successful + stats.skipped + stats.failed,
              currentCoupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.discount_type,
              },
              stats,
            });

            // Check if coupon already exists in BC
            const existingCoupon = await checkBCCouponExists(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              coupon.code
            );

            if (existingCoupon) {
              stats.skipped++;
              newlyMigratedCodes.push(coupon.code);
              couponIdMapping[coupon.id] = existingCoupon;
              await sleep(100);
              continue;
            }

            // Transform and create coupon in BC
            const bcCoupon = transformWCCouponToBC(
              coupon,
              productIdMapping,
              categoryIdMapping,
              stats.warnings
            );

            const createdCoupon = await createBCCoupon(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              bcCoupon
            );

            stats.successful++;
            newlyMigratedCodes.push(coupon.code);
            couponIdMapping[coupon.id] = createdCoupon.id;

            // Rate limiting - 200ms between creates
            await sleep(200);

          } catch (error) {
            stats.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stats.warnings.push(`Coupon "${coupon.code}": ${errorMessage}`);
            console.error(`Failed to migrate coupon ${coupon.code}:`, error);
          }
        }

        send({
          type: 'complete',
          stats,
          migratedCodes: newlyMigratedCodes,
          couponIdMapping,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Coupon migration failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Check if a coupon with this code already exists in BC
 */
async function checkBCCouponExists(
  storeHash: string,
  accessToken: string,
  code: string
): Promise<number | null> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/coupons?code=${encodeURIComponent(code)}`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const coupons = await response.json();
  if (Array.isArray(coupons) && coupons.length > 0) {
    return coupons[0].id;
  }

  return null;
}

/**
 * Transform WC Coupon to BC Coupon format
 */
function transformWCCouponToBC(
  wcCoupon: WCCoupon,
  productIdMapping: Record<number, number>,
  categoryIdMapping: Record<number, number>,
  warnings: string[]
): BCCouponCreate {
  // Map discount type
  const bcType = DISCOUNT_TYPE_MAP[wcCoupon.discount_type] || 'percentage_discount';

  // Handle free shipping type
  const isFreeShipping = wcCoupon.free_shipping;
  const finalType = isFreeShipping && wcCoupon.discount_type !== 'percent'
    ? 'free_shipping'
    : bcType as BCCouponCreate['type'];

  // Build applies_to based on product/category restrictions
  let appliesTo: BCCouponCreate['applies_to'] | undefined;

  // Prefer category restrictions over product restrictions if both exist
  if (wcCoupon.product_categories && wcCoupon.product_categories.length > 0) {
    const bcCategoryIds = wcCoupon.product_categories
      .map(wcId => categoryIdMapping[wcId])
      .filter(id => id !== undefined);

    if (bcCategoryIds.length > 0) {
      appliesTo = {
        entity: 'categories',
        ids: bcCategoryIds,
      };
    } else {
      warnings.push(`Coupon "${wcCoupon.code}": Category restrictions couldn't be mapped, applying to all`);
    }
  } else if (wcCoupon.product_ids && wcCoupon.product_ids.length > 0) {
    const bcProductIds = wcCoupon.product_ids
      .map(wcId => productIdMapping[wcId])
      .filter(id => id !== undefined);

    if (bcProductIds.length > 0) {
      appliesTo = {
        entity: 'products',
        ids: bcProductIds,
      };
    } else {
      warnings.push(`Coupon "${wcCoupon.code}": Product restrictions couldn't be mapped, applying to all`);
    }
  }

  // Format expiration date for BC (MM/DD/YYYY format)
  let expires: string | undefined;
  if (wcCoupon.date_expires) {
    const expiryDate = new Date(wcCoupon.date_expires);
    expires = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getDate().toString().padStart(2, '0')}/${expiryDate.getFullYear()}`;
  }

  // Build description from WC description + individual_use note
  let name = wcCoupon.description || `Coupon: ${wcCoupon.code}`;
  if (wcCoupon.individual_use) {
    name += ' (Cannot be combined with other coupons)';
  }

  const bcCoupon: BCCouponCreate = {
    name: name.substring(0, 100), // BC has 100 char limit
    type: finalType,
    amount: wcCoupon.amount,
    code: wcCoupon.code.toUpperCase(), // BC typically uses uppercase
    enabled: true,
    ...(wcCoupon.minimum_amount && parseFloat(wcCoupon.minimum_amount) > 0
      ? { min_purchase: wcCoupon.minimum_amount }
      : {}),
    ...(expires ? { expires } : {}),
    ...(appliesTo ? { applies_to: appliesTo } : {}),
    ...(wcCoupon.usage_limit ? { max_uses: wcCoupon.usage_limit } : {}),
    ...(wcCoupon.usage_limit_per_user ? { max_uses_per_customer: wcCoupon.usage_limit_per_user } : {}),
    ...(wcCoupon.free_shipping ? { shipping_free_shipping: true } : {}),
  };

  return bcCoupon;
}

/**
 * Create coupon in BigCommerce (V2 API)
 */
async function createBCCoupon(
  storeHash: string,
  accessToken: string,
  coupon: BCCouponCreate
): Promise<{ id: number }> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/coupons`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(coupon),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to create coupon';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.title || errorJson.message || errorJson[0]?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
