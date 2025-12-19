import { NextRequest } from 'next/server';
import { createWCClient } from '@/lib/wc-client';
import type {
  WCOrder,
  WCOrderAddress,
  WCOrderLineItem,
  BCOrderCreate,
  BCOrderAddress,
  BCOrderProduct,
  OrderMigrationStats,
  ORDER_STATUS_MAPPING,
} from '@/lib/types';

/**
 * Migrate orders from WooCommerce to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 *
 * IMPORTANT: Orders API is V2 in BigCommerce, not V3
 * Prerequisites: Products and Customers must be migrated first for ID mapping
 */

interface MigrateOrdersRequest {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  migratedOrderIds?: number[];
  productIdMapping?: Record<number, number>; // WC product ID -> BC product ID
  customerIdMapping?: Record<number, number>; // WC customer ID -> BC customer ID
  statusFilter?: string[]; // Only migrate orders with these statuses
}

// WC Order status to BC status ID mapping
const STATUS_MAPPING: Record<string, { bcStatusId: number; bcStatusName: string }> = {
  'pending': { bcStatusId: 1, bcStatusName: 'Pending' },
  'processing': { bcStatusId: 11, bcStatusName: 'Awaiting Fulfillment' },
  'on-hold': { bcStatusId: 13, bcStatusName: 'Manual Verification Required' },
  'completed': { bcStatusId: 10, bcStatusName: 'Completed' },
  'cancelled': { bcStatusId: 5, bcStatusName: 'Cancelled' },
  'refunded': { bcStatusId: 4, bcStatusName: 'Refunded' },
  'failed': { bcStatusId: 6, bcStatusName: 'Declined' },
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body: MigrateOrdersRequest = await request.json();
        const {
          wcCredentials,
          bcCredentials,
          migratedOrderIds = [],
          productIdMapping = {},
          customerIdMapping = {},
          statusFilter,
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

        // Fetch all orders from WooCommerce
        const allOrders: WCOrder[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await wcClient.get('orders', {
            per_page: 100,
            page,
            ...(statusFilter && statusFilter.length > 0 ? { status: statusFilter.join(',') } : {}),
          });

          if (response.data.length === 0) {
            hasMore = false;
          } else {
            allOrders.push(...response.data);
            page++;
          }

          if (page > 100) break; // Safety limit (10000 orders)
        }

        // Filter out already migrated orders
        const ordersToMigrate = allOrders.filter(
          order => !migratedOrderIds.includes(order.id)
        );

        send({
          type: 'started',
          totalOrders: ordersToMigrate.length,
          totalInWC: allOrders.length,
          alreadyMigrated: allOrders.length - ordersToMigrate.length,
        });

        const stats: OrderMigrationStats = {
          total: ordersToMigrate.length,
          successful: 0,
          skipped: 0,
          failed: 0,
          warnings: [],
        };

        const newlyMigratedOrderIds: number[] = [];
        const orderIdMapping: Record<number, number> = {};

        // Process orders one by one
        for (const order of ordersToMigrate) {
          try {
            send({
              type: 'progress',
              completedOrders: stats.successful + stats.skipped + stats.failed,
              currentOrder: {
                id: order.id,
                wcNumber: `#${order.id}`,
                status: order.status,
                total: order.total,
              },
              stats,
            });

            // Check if order already exists in BC (by external_id)
            const existingOrder = await checkBCOrderExists(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              order.id
            );

            if (existingOrder) {
              stats.skipped++;
              newlyMigratedOrderIds.push(order.id);
              orderIdMapping[order.id] = existingOrder;
              await sleep(100);
              continue;
            }

            // Map customer ID - use 0 for guest if not found
            const bcCustomerId = order.customer_id > 0
              ? (customerIdMapping[order.customer_id] || 0)
              : 0;

            if (order.customer_id > 0 && !customerIdMapping[order.customer_id]) {
              stats.warnings.push(`Order #${order.id}: Customer ID ${order.customer_id} not found in mapping, using guest checkout`);
            }

            // Transform and create order in BC
            const bcOrder = transformWCOrderToBC(
              order,
              bcCustomerId,
              productIdMapping,
              stats.warnings
            );

            const createdOrder = await createBCOrder(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              bcOrder
            );

            stats.successful++;
            newlyMigratedOrderIds.push(order.id);
            orderIdMapping[order.id] = createdOrder.id;

            // Add refund note if order has refunds
            if (order.refunds && order.refunds.length > 0) {
              const refundTotal = order.refunds.reduce((sum, r) => sum + parseFloat(r.total), 0);
              await addOrderNote(
                bcCredentials.storeHash,
                bcCredentials.accessToken,
                createdOrder.id,
                `WC Refund History: ${order.refunds.length} refund(s) totaling $${Math.abs(refundTotal).toFixed(2)}. ${order.refunds.map(r => r.reason || 'No reason provided').join('; ')}`
              );
            }

            // Rate limiting - 200ms between creates
            await sleep(200);

          } catch (error) {
            stats.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stats.warnings.push(`Order #${order.id}: ${errorMessage}`);
            console.error(`Failed to migrate order ${order.id}:`, error);
          }
        }

        send({
          type: 'complete',
          stats,
          migratedOrderIds: newlyMigratedOrderIds,
          orderIdMapping,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Order migration failed',
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
 * Check if an order with this WC ID already exists in BC
 * Uses staff_notes or external_id field to check
 */
async function checkBCOrderExists(
  storeHash: string,
  accessToken: string,
  wcOrderId: number
): Promise<number | null> {
  // BC V2 Orders API - search by external_id
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/orders?external_id=WC-${wcOrderId}`,
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

  const orders = await response.json();
  if (Array.isArray(orders) && orders.length > 0) {
    return orders[0].id;
  }

  return null;
}

/**
 * Transform WC Order to BC Order format
 */
function transformWCOrderToBC(
  wcOrder: WCOrder,
  bcCustomerId: number,
  productIdMapping: Record<number, number>,
  warnings: string[]
): BCOrderCreate {
  // Map status
  const statusInfo = STATUS_MAPPING[wcOrder.status] || STATUS_MAPPING['pending'];

  // Transform billing address
  const billingAddress = transformAddress(wcOrder.billing);
  billingAddress.email = wcOrder.billing.email || '';

  // Transform shipping address (use billing if no shipping)
  const shippingAddress = wcOrder.shipping?.address_1
    ? transformAddress(wcOrder.shipping)
    : { ...billingAddress };

  // Transform line items to BC products
  const products: BCOrderProduct[] = [];
  for (const item of wcOrder.line_items) {
    const bcProductId = productIdMapping[item.product_id];

    if (!bcProductId) {
      // Product not found in mapping - create as custom product (omit product_id)
      warnings.push(`Order #${wcOrder.id}: Product ID ${item.product_id} (${item.name}) not found in BC, adding as custom item`);
      products.push({
        quantity: item.quantity,
        price_inc_tax: parseFloat(item.total) / item.quantity,
        price_ex_tax: (parseFloat(item.total) - parseFloat(item.total_tax)) / item.quantity,
        name: item.name,
        sku: item.sku || undefined,
      } as BCOrderProduct);
    } else {
      products.push({
        product_id: bcProductId,
        quantity: item.quantity,
        price_inc_tax: parseFloat(item.total) / item.quantity,
        price_ex_tax: (parseFloat(item.total) - parseFloat(item.total_tax)) / item.quantity,
        name: item.name,
        sku: item.sku || undefined,
      });
    }
  }

  // Calculate totals
  const subtotalExTax = parseFloat(wcOrder.total) - parseFloat(wcOrder.total_tax);
  const shippingCostExTax = parseFloat(wcOrder.shipping_total);
  const shippingCostIncTax = shippingCostExTax + parseFloat(wcOrder.shipping_tax);

  const bcOrder: BCOrderCreate = {
    customer_id: bcCustomerId,
    status_id: statusInfo.bcStatusId,
    billing_address: billingAddress,
    shipping_addresses: [shippingAddress],
    products,
    subtotal_ex_tax: subtotalExTax - shippingCostExTax,
    subtotal_inc_tax: parseFloat(wcOrder.total) - shippingCostIncTax,
    total_ex_tax: subtotalExTax,
    total_inc_tax: parseFloat(wcOrder.total),
    shipping_cost_ex_tax: shippingCostExTax,
    shipping_cost_inc_tax: shippingCostIncTax,
    discount_amount: parseFloat(wcOrder.discount_total) || 0,
    customer_message: wcOrder.customer_note || undefined,
    payment_method: wcOrder.payment_method_title || 'Other',
    external_source: 'WooCommerce Migration',
    external_id: `WC-${wcOrder.id}`,
    staff_notes: `Migrated from WooCommerce. Original Order ID: ${wcOrder.id}. Date: ${wcOrder.date_created}`,
  };

  return bcOrder;
}

/**
 * Transform WC address to BC V2 address format
 */
function transformAddress(wcAddress: WCOrderAddress): BCOrderAddress {
  // BC V2 Orders API requires valid country - default to US if empty
  const countryCode = wcAddress.country || 'US';
  const countryName = getCountryName(countryCode);

  return {
    first_name: wcAddress.first_name || 'Guest',
    last_name: wcAddress.last_name || 'Customer',
    company: wcAddress.company || '',
    street_1: wcAddress.address_1 || '123 Default Street',
    street_2: wcAddress.address_2 || '',
    city: wcAddress.city || 'Austin',
    state: wcAddress.state || 'TX',
    zip: wcAddress.postcode || '78701',
    country: countryName,
    country_iso2: countryCode,
    phone: wcAddress.phone || '',
  };
}

/**
 * Create order in BigCommerce (V2 API)
 */
async function createBCOrder(
  storeHash: string,
  accessToken: string,
  order: BCOrderCreate
): Promise<{ id: number }> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/orders`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(order),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to create order';
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

/**
 * Add a note to an order
 */
async function addOrderNote(
  storeHash: string,
  accessToken: string,
  orderId: number,
  note: string
): Promise<void> {
  // BC doesn't have a direct order notes API in V2
  // We'll update the staff_notes field instead
  await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`,
    {
      method: 'PUT',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        staff_notes: note,
      }),
    }
  );
}

/**
 * Get full country name from ISO code
 */
function getCountryName(isoCode: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'CH': 'Switzerland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    // Add more as needed
  };
  return countries[isoCode] || isoCode;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
