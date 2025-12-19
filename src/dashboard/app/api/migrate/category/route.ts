import { NextRequest } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * Migrate products from a WooCommerce category to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 */

interface WCProduct {
  id: number;
  name: string;
  type: string;
  sku: string;
  price: string;
  regular_price: string;
  description: string;
  short_description: string;
  categories: Array<{ id: number; name: string }>;
  images: Array<{ src: string }>;
  weight: string;
  stock_quantity: number | null;
  manage_stock: boolean;
}

interface BCProductCreate {
  name: string;
  type: 'physical' | 'digital';
  sku: string;
  price: number;
  weight: number;
  description: string;
  categories: number[];
  images?: Array<{ image_url: string; is_thumbnail: boolean }>;
  inventory_level?: number;
  inventory_tracking?: 'none' | 'product';
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = await request.json();
        const { wcCredentials, bcCredentials, categoryId, migratedProductIds = [] } = body;

        if (!wcCredentials || !bcCredentials || !categoryId) {
          send({ type: 'error', error: 'Missing required parameters' });
          controller.close();
          return;
        }

        // Initialize WC client
        const wcClient = await createWCClient(
          wcCredentials.url,
          wcCredentials.consumerKey,
          wcCredentials.consumerSecret
        );

        // Fetch products in this category
        const products: WCProduct[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await wcClient.get('products', {
            per_page: 100,
            page,
            category: categoryId,
            status: 'publish',
          });

          if (response.data.length === 0) {
            hasMore = false;
          } else {
            products.push(...response.data);
            page++;
          }

          if (page > 10) break; // Safety limit
        }

        // Filter out already migrated products
        const productsToMigrate = products.filter(p => !migratedProductIds.includes(p.id));

        send({
          type: 'started',
          totalProducts: productsToMigrate.length,
          categoryId,
        });

        // First, ensure the category exists in BC
        const bcCategoryId = await ensureBCCategory(
          bcCredentials.storeHash,
          bcCredentials.accessToken,
          categoryId,
          wcClient
        );

        const migratedIds: number[] = [];
        let completedCount = 0;

        // Migrate each product
        for (const product of productsToMigrate) {
          try {
            send({
              type: 'progress',
              completedProducts: completedCount,
              currentProduct: { id: product.id, name: product.name },
            });

            // Check if product already exists in BC by SKU
            const sku = product.sku || `WC-${product.id}`;
            const existingProduct = await checkBCProductExists(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              sku
            );

            if (!existingProduct) {
              // Create product in BC
              await createBCProduct(
                bcCredentials.storeHash,
                bcCredentials.accessToken,
                product,
                bcCategoryId
              );
            }

            migratedIds.push(product.id);
            completedCount++;

            // Small delay to respect rate limits
            await sleep(200);

          } catch (error) {
            console.error(`Failed to migrate product ${product.id}:`, error);
            // Continue with next product
          }
        }

        send({
          type: 'complete',
          totalMigrated: completedCount,
          migratedProductIds: migratedIds,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Migration failed',
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

async function ensureBCCategory(
  storeHash: string,
  accessToken: string,
  wcCategoryId: number,
  wcClient: Awaited<ReturnType<typeof createWCClient>>
): Promise<number> {
  // Fetch WC category info
  const wcCategoryResponse = await wcClient.get(`products/categories/${wcCategoryId}`);
  const wcCategory = wcCategoryResponse.data;

  // Check if category exists in BC by name
  const searchResponse = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories?name=${encodeURIComponent(wcCategory.name)}`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );

  const searchResult = await searchResponse.json();

  if (searchResult.data && searchResult.data.length > 0) {
    return searchResult.data[0].id;
  }

  // Create category in BC
  const createResponse = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: wcCategory.name,
        parent_id: 0, // Root level for now
        is_visible: true,
      }),
    }
  );

  const createResult = await createResponse.json();
  return createResult.data.id;
}

async function checkBCProductExists(
  storeHash: string,
  accessToken: string,
  sku: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products?sku=${encodeURIComponent(sku)}`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();
  return result.data && result.data.length > 0;
}

async function createBCProduct(
  storeHash: string,
  accessToken: string,
  wcProduct: WCProduct,
  bcCategoryId: number
): Promise<void> {
  const bcProduct: BCProductCreate = {
    name: wcProduct.name.substring(0, 250), // BC limit
    type: 'physical',
    sku: (wcProduct.sku || `WC-${wcProduct.id}`).substring(0, 250),
    price: parseFloat(wcProduct.price) || parseFloat(wcProduct.regular_price) || 0,
    weight: parseFloat(wcProduct.weight) || 0,
    description: wcProduct.description || wcProduct.short_description || '',
    categories: [bcCategoryId],
  };

  // Add images if available
  if (wcProduct.images && wcProduct.images.length > 0) {
    bcProduct.images = wcProduct.images.slice(0, 5).map((img, index) => ({
      image_url: img.src,
      is_thumbnail: index === 0,
    }));
  }

  // Add inventory tracking if managed
  if (wcProduct.manage_stock && wcProduct.stock_quantity !== null) {
    bcProduct.inventory_tracking = 'product';
    bcProduct.inventory_level = wcProduct.stock_quantity;
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bcProduct),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.title || 'Failed to create product');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
