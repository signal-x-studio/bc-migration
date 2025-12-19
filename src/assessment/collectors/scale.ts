import { WCClient } from '../wc-client.js';

export interface ScaleMetrics {
  productCount: number;
  variationCount: number;
  orderCount: number;
  customerCount: number;
  categoryCount: number;
}

export class ScaleCollector {
  constructor(private client: WCClient) {}

  async collect(): Promise<ScaleMetrics> {
    // Get basic counts first (these endpoints exist)
    const [
      productCount,
      orderCount,
      customerCount,
      categoryCount
    ] = await Promise.all([
      this.client.getCounts('products'),
      this.client.getCounts('orders'),
      this.client.getCounts('customers'),
      this.client.getCounts('products/categories')
    ]);

    // Count variations by summing from variable products
    // WC API doesn't have a global variations endpoint
    const variationCount = await this.countAllVariations();

    return {
      productCount,
      variationCount,
      orderCount,
      customerCount,
      categoryCount
    };
  }

  /**
   * Count all variations by fetching variable products and summing their variation counts
   * This is needed because WC REST API doesn't have a global /products/variations endpoint
   */
  private async countAllVariations(): Promise<number> {
    let totalVariations = 0;
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        const response = await this.client.getProducts({
          type: 'variable',
          page,
          per_page: perPage,
        });

        const products = response.data;
        if (!products || products.length === 0) {
          break;
        }

        // Sum variations from each variable product
        for (const product of products) {
          // Get variation count for this product
          try {
            const variationsResponse = await this.client.getProductVariations(product.id, { per_page: 1 });
            const count = parseInt(variationsResponse.headers['x-wp-total'] || '0', 10);
            totalVariations += count;
          } catch {
            // If variations endpoint fails for a product, use the variations array length if available
            if (Array.isArray(product.variations)) {
              totalVariations += product.variations.length;
            }
          }
        }

        page++;
      }
    } catch (error: any) {
      console.warn(`Warning: Could not count all variations: ${error.message}`);
    }

    return totalVariations;
  }
}
