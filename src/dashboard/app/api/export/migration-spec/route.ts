import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * Migration Spec Generator
 * Creates a comprehensive JSON specification of the migration
 * Can be used with third-party tools or as documentation
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      consumerKey,
      consumerSecret,
      assessmentData, // Optional - include assessment results
      targetBcStore,
    } = body;

    if (!url || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const wcClient = await createWCClient(url, consumerKey, consumerSecret);

    // Gather store info
    const [storeInfo, productStats, categoryStats, customerStats, orderStats] = await Promise.all([
      getStoreInfo(wcClient),
      getProductStats(wcClient),
      getCategoryStats(wcClient),
      getCustomerStats(wcClient),
      getOrderStats(wcClient),
    ]);

    // Build migration spec
    const migrationSpec = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      generator: 'bc-migration-dashboard',

      source: {
        platform: 'WooCommerce',
        url: url,
        version: storeInfo.wcVersion,
        siteName: storeInfo.siteName,
      },

      target: {
        platform: 'BigCommerce',
        storeUrl: targetBcStore || null,
      },

      inventory: {
        products: {
          total: productStats.total,
          byType: productStats.byType,
          withVariations: productStats.withVariations,
          totalVariations: productStats.totalVariations,
          withImages: productStats.withImages,
          withSku: productStats.withSku,
        },
        categories: {
          total: categoryStats.total,
          maxDepth: categoryStats.maxDepth,
          topLevel: categoryStats.topLevel,
        },
        customers: {
          total: customerStats.total,
          withAddresses: customerStats.withAddresses,
          withOrders: customerStats.withOrders,
        },
        orders: {
          total: orderStats.total,
          byStatus: orderStats.byStatus,
        },
      },

      blockers: assessmentData?.blockers || [],
      warnings: assessmentData?.warnings || [],

      recommendations: generateRecommendations(productStats, categoryStats),

      migrationSteps: [
        {
          step: 1,
          name: 'Pre-Migration Prep',
          tasks: [
            'Review and resolve all blockers',
            'Deduplicate SKUs if needed',
            'Flatten categories deeper than 5 levels',
            'Backup WooCommerce database',
          ],
        },
        {
          step: 2,
          name: 'Export Data',
          tasks: [
            'Export products CSV (BC format)',
            'Export customers CSV (BC format)',
            'Export redirect rules',
          ],
        },
        {
          step: 3,
          name: 'Create BigCommerce Store',
          tasks: [
            'Set up BC store with matching settings',
            'Create category structure',
            'Configure shipping zones',
            'Set up payment methods',
          ],
        },
        {
          step: 4,
          name: 'Import Data',
          tasks: [
            'Import categories (manually or via third-party tool)',
            'Import products CSV',
            'Import customers CSV',
            'Verify import counts match',
          ],
        },
        {
          step: 5,
          name: 'Post-Migration',
          tasks: [
            'Configure 301 redirects',
            'Send password reset emails to customers',
            'Test checkout flow',
            'Update DNS/domain',
          ],
        },
      ],

      thirdPartyTools: {
        recommended: [
          {
            name: 'LitExtension',
            url: 'https://litextension.com/bigcommerce-migration/woocommerce-to-bigcommerce-migration.html',
            priceRange: '$99-$299',
            bestFor: 'Automated migration with support',
          },
          {
            name: 'Cart2Cart',
            url: 'https://www.shopping-cart-migration.com/shopping-cart-migration-options/6710-woocommerce-to-bigcommerce-migration',
            priceRange: '$69+',
            bestFor: 'Simple migrations',
          },
        ],
        native: {
          name: 'BigCommerce CSV Import',
          limitations: [
            'Max ~500 products per batch recommended',
            'Cannot create categories via CSV',
            'Orders cannot be imported via CSV',
          ],
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: migrationSpec,
    });

  } catch (error) {
    console.error('Migration spec error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate spec' },
      { status: 500 }
    );
  }
}

async function getStoreInfo(wcClient: Awaited<ReturnType<typeof createWCClient>>) {
  try {
    const response = await wcClient.get('system_status');
    return {
      wcVersion: response.data.environment?.version || 'Unknown',
      siteName: response.data.environment?.site_url || '',
    };
  } catch {
    return { wcVersion: 'Unknown', siteName: '' };
  }
}

async function getProductStats(wcClient: Awaited<ReturnType<typeof createWCClient>>) {
  const stats = {
    total: 0,
    byType: {} as Record<string, number>,
    withVariations: 0,
    totalVariations: 0,
    withImages: 0,
    withSku: 0,
  };

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await wcClient.get('products', { per_page: 100, page });
    const products = response.data;

    if (products.length === 0) {
      hasMore = false;
    } else {
      for (const product of products) {
        stats.total++;
        stats.byType[product.type] = (stats.byType[product.type] || 0) + 1;

        if (product.type === 'variable') {
          stats.withVariations++;
          stats.totalVariations += product.variations?.length || 0;
        }

        if (product.images?.length > 0) stats.withImages++;
        if (product.sku) stats.withSku++;
      }
      page++;
    }

    if (page > 20) break; // Safety limit for stats gathering
  }

  return stats;
}

async function getCategoryStats(wcClient: Awaited<ReturnType<typeof createWCClient>>) {
  const response = await wcClient.get('products/categories', { per_page: 100 });
  const categories = response.data;

  // Calculate max depth
  const categoryById = new Map(categories.map((c: { id: number }) => [c.id, c]));

  function getDepth(categoryId: number): number {
    const category = categoryById.get(categoryId) as { parent: number } | undefined;
    if (!category || category.parent === 0) return 1;
    return 1 + getDepth(category.parent);
  }

  let maxDepth = 0;
  let topLevel = 0;

  for (const category of categories) {
    const depth = getDepth(category.id);
    if (depth > maxDepth) maxDepth = depth;
    if (category.parent === 0) topLevel++;
  }

  return {
    total: categories.length,
    maxDepth,
    topLevel,
  };
}

async function getCustomerStats(wcClient: Awaited<ReturnType<typeof createWCClient>>) {
  let total = 0;
  let withAddresses = 0;
  let withOrders = 0;

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await wcClient.get('customers', { per_page: 100, page });
    const customers = response.data;

    if (customers.length === 0) {
      hasMore = false;
    } else {
      for (const customer of customers) {
        total++;
        if (customer.billing?.address_1 || customer.shipping?.address_1) {
          withAddresses++;
        }
        if (customer.orders_count > 0) withOrders++;
      }
      page++;
    }

    if (page > 20) break;
  }

  return { total, withAddresses, withOrders };
}

async function getOrderStats(wcClient: Awaited<ReturnType<typeof createWCClient>>) {
  const byStatus: Record<string, number> = {};
  let total = 0;

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await wcClient.get('orders', { per_page: 100, page });
    const orders = response.data;

    if (orders.length === 0) {
      hasMore = false;
    } else {
      for (const order of orders) {
        total++;
        byStatus[order.status] = (byStatus[order.status] || 0) + 1;
      }
      page++;
    }

    if (page > 10) break;
  }

  return { total, byStatus };
}

function generateRecommendations(
  productStats: Awaited<ReturnType<typeof getProductStats>>,
  categoryStats: Awaited<ReturnType<typeof getCategoryStats>>
): string[] {
  const recommendations: string[] = [];

  if (productStats.total > 500) {
    recommendations.push('Consider using a third-party migration tool for large catalogs');
  }

  if (categoryStats.maxDepth > 5) {
    recommendations.push(`Category depth (${categoryStats.maxDepth}) exceeds BC limit of 5. Flatten hierarchy before migration.`);
  }

  if (productStats.byType['variable'] && productStats.totalVariations > 600) {
    recommendations.push('Review products with many variations. BC limit is 600 variants per product.');
  }

  if (productStats.total - productStats.withSku > 0) {
    recommendations.push(`${productStats.total - productStats.withSku} products missing SKUs. BC requires unique SKUs.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Store looks ready for migration!');
  }

  return recommendations;
}
