import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';
import type { ValidationResult, CountComparison, ComparisonStatus } from '@/lib/types';

/**
 * Compare WC source counts with BC destination counts
 * Returns validation result with status and recommendations
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wcCredentials, bcCredentials } = body;

    if (!wcCredentials || !bcCredentials) {
      return NextResponse.json(
        { success: false, error: 'Missing required credentials' },
        { status: 400 }
      );
    }

    // Initialize WC client
    const wcClient = await createWCClient(
      wcCredentials.url,
      wcCredentials.consumerKey,
      wcCredentials.consumerSecret
    );

    // Fetch counts from WooCommerce (using headers for efficiency)
    const [wcProductsCount, wcCategoriesCount, wcCustomersCount] = await Promise.all([
      getWCCount(wcClient, 'products'),
      getWCCount(wcClient, 'products/categories'),
      getWCCount(wcClient, 'customers'),
    ]);

    // Fetch counts from BigCommerce
    const [bcProductsCount, bcCategoriesCount, bcCustomersCount] = await Promise.all([
      getBCProductCount(bcCredentials.storeHash, bcCredentials.accessToken),
      getBCCategoryCount(bcCredentials.storeHash, bcCredentials.accessToken),
      getBCCustomerCount(bcCredentials.storeHash, bcCredentials.accessToken),
    ]);

    // Build comparisons
    const products = buildComparison(wcProductsCount, bcProductsCount, 'products');
    const categories = buildComparison(wcCategoriesCount, bcCategoriesCount, 'categories');
    const customers = buildComparison(wcCustomersCount, bcCustomersCount, 'customers');

    // Determine overall status
    const overallStatus = determineOverallStatus([products, categories, customers]);

    // Generate recommendations
    const recommendations = generateRecommendations(products, categories, customers);

    const result: ValidationResult = {
      timestamp: new Date().toISOString(),
      products,
      categories,
      customers,
      overallStatus,
      recommendations,
    };

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      },
      { status: 500 }
    );
  }
}

async function getWCCount(
  wcClient: Awaited<ReturnType<typeof createWCClient>>,
  endpoint: string
): Promise<number> {
  try {
    // WC returns total count in response headers
    const response = await wcClient.get(endpoint, { per_page: 1 });

    // Try to get total from headers
    const headers = response.headers;
    if (headers && headers['x-wp-total']) {
      return parseInt(headers['x-wp-total'], 10);
    }

    // Fallback: fetch all and count
    let total = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageResponse = await wcClient.get(endpoint, { per_page: 100, page });
      if (pageResponse.data.length === 0) {
        hasMore = false;
      } else {
        total += pageResponse.data.length;
        page++;
      }
      if (page > 100) break; // Safety limit
    }

    return total;
  } catch (error) {
    console.error(`Failed to get WC count for ${endpoint}:`, error);
    return 0;
  }
}

async function getBCProductCount(storeHash: string, accessToken: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/summary`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch BC catalog summary');
    }

    const result = await response.json();
    return result.data?.inventory_count || result.data?.variant_count || 0;
  } catch (error) {
    console.error('Failed to get BC product count:', error);
    return 0;
  }
}

async function getBCCategoryCount(storeHash: string, accessToken: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories?limit=1`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch BC categories');
    }

    const result = await response.json();
    return result.meta?.pagination?.total || 0;
  } catch (error) {
    console.error('Failed to get BC category count:', error);
    return 0;
  }
}

async function getBCCustomerCount(storeHash: string, accessToken: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/customers?limit=1`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch BC customers');
    }

    const result = await response.json();
    return result.meta?.pagination?.total || 0;
  } catch (error) {
    console.error('Failed to get BC customer count:', error);
    return 0;
  }
}

function buildComparison(wcCount: number, bcCount: number, type: string): CountComparison {
  const difference = bcCount - wcCount;
  let status: ComparisonStatus;
  let notes: string | undefined;

  if (difference === 0) {
    status = 'matched';
  } else if (difference < 0) {
    status = 'under';
    notes = `${Math.abs(difference)} ${type} not yet migrated`;
  } else {
    status = 'over';
    notes = `BC has ${difference} more ${type} than WC (possibly pre-existing)`;
  }

  return {
    wcCount,
    bcCount,
    difference,
    status,
    notes,
  };
}

function determineOverallStatus(
  comparisons: CountComparison[]
): 'matched' | 'partial' | 'mismatch' {
  const allMatched = comparisons.every(c => c.status === 'matched');
  if (allMatched) return 'matched';

  const anyUnder = comparisons.some(c => c.status === 'under');
  if (anyUnder) return 'mismatch';

  return 'partial';
}

function generateRecommendations(
  products: CountComparison,
  categories: CountComparison,
  customers: CountComparison
): string[] {
  const recommendations: string[] = [];

  // Product recommendations
  if (products.status === 'under') {
    if (products.difference < -10) {
      recommendations.push(
        `${Math.abs(products.difference)} products still need to be migrated. Continue with category-based migration.`
      );
    } else {
      recommendations.push(
        `${Math.abs(products.difference)} products pending. These may be in non-migrated categories or have issues.`
      );
    }
  } else if (products.status === 'matched') {
    recommendations.push('All products have been migrated successfully.');
  }

  // Category recommendations
  if (categories.status === 'under') {
    recommendations.push(
      `${Math.abs(categories.difference)} categories not in BC. Run "Setup Categories" on the migrate page.`
    );
  } else if (categories.status === 'over') {
    recommendations.push(
      'BC has more categories than WC. Some may be pre-existing or auto-created.'
    );
  }

  // Customer recommendations
  if (customers.status === 'under') {
    recommendations.push(
      `${Math.abs(customers.difference)} customers not yet migrated. Run customer migration.`
    );
  } else if (customers.status === 'matched') {
    recommendations.push('All customers have been migrated. Remember to send password reset emails.');
  }

  // Overall status
  if (products.status === 'matched' && categories.status !== 'under' && customers.status === 'matched') {
    recommendations.push('Migration looks complete! Review the go-live checklist before launch.');
  }

  return recommendations;
}
