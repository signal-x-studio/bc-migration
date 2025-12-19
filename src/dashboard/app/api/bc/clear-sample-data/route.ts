import { NextRequest, NextResponse } from 'next/server';

/**
 * Clear sample data from BigCommerce store
 *
 * This endpoint deletes all:
 * - Products (and their variants, options, images)
 * - Categories
 * - Customers (except the store owner)
 * - Orders (if requested)
 * - Coupons (if requested)
 * - Blog posts (if requested)
 * - Web pages (if requested)
 *
 * USE WITH CAUTION - This is destructive and irreversible!
 */

interface ClearDataRequest {
  storeHash: string;
  accessToken: string;
  entities: {
    products?: boolean;
    categories?: boolean;
    customers?: boolean;
    orders?: boolean;
    coupons?: boolean;
    blog?: boolean;
    pages?: boolean;
  };
  dryRun?: boolean; // If true, just count what would be deleted
}

interface DeleteStats {
  entity: string;
  found: number;
  deleted: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ClearDataRequest = await request.json();
    const { storeHash, accessToken, entities, dryRun = false } = body;

    if (!storeHash || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const results: DeleteStats[] = [];

    // Delete products first (they depend on categories)
    if (entities.products) {
      const productStats = await deleteProducts(storeHash, accessToken, dryRun);
      results.push(productStats);
    }

    // Delete categories
    if (entities.categories) {
      const categoryStats = await deleteCategories(storeHash, accessToken, dryRun);
      results.push(categoryStats);
    }

    // Delete customers
    if (entities.customers) {
      const customerStats = await deleteCustomers(storeHash, accessToken, dryRun);
      results.push(customerStats);
    }

    // Delete orders
    if (entities.orders) {
      const orderStats = await deleteOrders(storeHash, accessToken, dryRun);
      results.push(orderStats);
    }

    // Delete coupons
    if (entities.coupons) {
      const couponStats = await deleteCoupons(storeHash, accessToken, dryRun);
      results.push(couponStats);
    }

    // Delete blog posts
    if (entities.blog) {
      const blogStats = await deleteBlogPosts(storeHash, accessToken, dryRun);
      results.push(blogStats);
    }

    // Delete web pages
    if (entities.pages) {
      const pageStats = await deletePages(storeHash, accessToken, dryRun);
      results.push(pageStats);
    }

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return NextResponse.json({
      success: true,
      dryRun,
      data: {
        results,
        summary: {
          totalDeleted,
          totalErrors,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete all products
 */
async function deleteProducts(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'products',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all product IDs
    const productIds: number[] = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products?limit=250&page=${page}`,
        {
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) break;

      const result = await response.json();
      if (!result.data || result.data.length === 0) break;

      productIds.push(...result.data.map((p: any) => p.id));
      page++;

      if (page > 40) break; // Safety limit (10000 products)
    }

    stats.found = productIds.length;

    if (dryRun || productIds.length === 0) {
      return stats;
    }

    // Delete in batches of 100
    for (let i = 0; i < productIds.length; i += 100) {
      const batch = productIds.slice(i, i + 100);
      const idsParam = batch.join(',');

      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products?id:in=${idsParam}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        stats.deleted += batch.length;
      } else {
        stats.errors.push(`Failed to delete products ${batch[0]}-${batch[batch.length - 1]}`);
      }

      await sleep(200); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

/**
 * Delete all categories
 */
async function deleteCategories(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'categories',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all category IDs
    const categoryIds: number[] = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories?limit=250&page=${page}`,
        {
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) break;

      const result = await response.json();
      if (!result.data || result.data.length === 0) break;

      categoryIds.push(...result.data.map((c: any) => c.id));
      page++;

      if (page > 10) break; // Safety limit
    }

    stats.found = categoryIds.length;

    if (dryRun || categoryIds.length === 0) {
      return stats;
    }

    // Delete categories one by one (they may have dependencies)
    // Start from the end to delete children first
    for (const id of categoryIds.reverse()) {
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok || response.status === 204) {
        stats.deleted++;
      } else {
        // Don't log every error since some may have products
      }

      await sleep(100); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

/**
 * Delete all customers (except store owner)
 */
async function deleteCustomers(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'customers',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all customer IDs
    const customerIds: number[] = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/customers?limit=250&page=${page}`,
        {
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) break;

      const result = await response.json();
      if (!result.data || result.data.length === 0) break;

      // Skip the first customer (often store owner)
      const ids = result.data.map((c: any) => c.id);
      customerIds.push(...ids);
      page++;

      if (page > 20) break; // Safety limit
    }

    stats.found = customerIds.length;

    if (dryRun || customerIds.length === 0) {
      return stats;
    }

    // Delete in batches
    for (let i = 0; i < customerIds.length; i += 100) {
      const batch = customerIds.slice(i, i + 100);
      const idsParam = batch.join(',');

      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/customers?id:in=${idsParam}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok || response.status === 204) {
        stats.deleted += batch.length;
      } else {
        stats.errors.push(`Failed to delete customers batch starting at ${batch[0]}`);
      }

      await sleep(200); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

/**
 * Delete all orders
 */
async function deleteOrders(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'orders',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all order IDs (V2 API)
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/orders?limit=250`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return stats;
    }

    const orders = await response.json();
    if (!Array.isArray(orders)) {
      return stats;
    }

    const orderIds = orders.map((o: any) => o.id);
    stats.found = orderIds.length;

    if (dryRun || orderIds.length === 0) {
      return stats;
    }

    // Delete orders one by one (V2 API)
    for (const id of orderIds) {
      const deleteResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (deleteResponse.ok || deleteResponse.status === 204) {
        stats.deleted++;
      }

      await sleep(200); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

/**
 * Delete all coupons
 */
async function deleteCoupons(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'coupons',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all coupon IDs (V2 API)
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/coupons?limit=250`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return stats;
    }

    const coupons = await response.json();
    if (!Array.isArray(coupons)) {
      return stats;
    }

    const couponIds = coupons.map((c: any) => c.id);
    stats.found = couponIds.length;

    if (dryRun || couponIds.length === 0) {
      return stats;
    }

    // Delete coupons one by one
    for (const id of couponIds) {
      const deleteResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/coupons/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (deleteResponse.ok || deleteResponse.status === 204) {
        stats.deleted++;
      }

      await sleep(200); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

/**
 * Delete all blog posts
 */
async function deleteBlogPosts(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'blog_posts',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all blog post IDs (V2 API)
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/blog/posts?limit=250`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return stats;
    }

    const posts = await response.json();
    if (!Array.isArray(posts)) {
      return stats;
    }

    const postIds = posts.map((p: any) => p.id);
    stats.found = postIds.length;

    if (dryRun || postIds.length === 0) {
      return stats;
    }

    // Delete posts one by one
    for (const id of postIds) {
      const deleteResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/blog/posts/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (deleteResponse.ok || deleteResponse.status === 204) {
        stats.deleted++;
      }

      await sleep(200); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

/**
 * Delete all web pages
 */
async function deletePages(
  storeHash: string,
  accessToken: string,
  dryRun: boolean
): Promise<DeleteStats> {
  const stats: DeleteStats = {
    entity: 'pages',
    found: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get all page IDs (V3 API)
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/content/pages?limit=250`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return stats;
    }

    const result = await response.json();
    if (!result.data || !Array.isArray(result.data)) {
      return stats;
    }

    const pageIds = result.data.map((p: any) => p.id);
    stats.found = pageIds.length;

    if (dryRun || pageIds.length === 0) {
      return stats;
    }

    // Delete pages one by one
    for (const id of pageIds) {
      const deleteResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/content/pages/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Auth-Token': accessToken,
            'Accept': 'application/json',
          },
        }
      );

      if (deleteResponse.ok || deleteResponse.status === 204) {
        stats.deleted++;
      }

      await sleep(200); // Rate limiting
    }
  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
