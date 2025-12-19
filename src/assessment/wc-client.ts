import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import dotenv from 'dotenv';

dotenv.config();

export interface WCConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export class WCClient {
  private api: any;

  constructor(config: WCConfig) {
    this.api = new (WooCommerceRestApi as any).default({
      url: config.url,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      version: 'wc/v3',
      queryStringAuth: true // Force Basic Authentication as query string for some environments
    });
  }

  async getCounts(endpoint: string): Promise<number> {
    try {
      const response = await this.api.get(endpoint, {
        per_page: 1
      });
      return parseInt(response.headers['x-wp-total'] || '0', 10);
    } catch (error: any) {
      throw new Error(`Failed to get counts for ${endpoint}: ${error.message}`);
    }
  }

  async getProducts(params: any = {}) {
    return this.api.get('products', params);
  }

  async getSystemStatus() {
    return this.api.get('system_status');
  }

  async getCategories(params: any = {}) {
    return this.api.get('products/categories', params);
  }

  async getCustomers(params: any = {}) {
    return this.api.get('customers', params);
  }

  async getOrders(params: any = {}) {
    // Ensure modified_after is handled if passed
    return this.api.get('orders', params);
  }

  /**
   * Get variations for a specific product
   * @param productId - The WC product ID
   * @param params - Optional query parameters (per_page, page, etc.)
   * @returns Promise with variations data
   */
  async getProductVariations(productId: number, params: any = {}) {
    return this.api.get(`products/${productId}/variations`, params);
  }

  /**
   * Fetch all variations for a product (handles pagination)
   * @param productId - The WC product ID
   * @returns Promise with all variations
   */
  async getAllProductVariations(productId: number) {
    let page = 1;
    let allVariations: any[] = [];
    let keepFetching = true;

    while (keepFetching) {
      const response = await this.api.get(`products/${productId}/variations`, {
        page,
        per_page: 100,
      });

      if (response.data.length === 0) {
        keepFetching = false;
      } else {
        allVariations = allVariations.concat(response.data);
        page++;
      }
    }

    return allVariations;
  }

  async testConnection() {
    try {
      await this.api.get('products', { per_page: 1 });
      return true;
    } catch (error: any) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }
}
