/**
 * BigCommerce API Client
 *
 * Features:
 * - Rate limiting (150 req/30s)
 * - Automatic retry with exponential backoff
 * - Batch operations for products/customers
 * - Proper TypeScript typing
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  BCProduct,
  BCCategory,
  BCCustomer,
  BCOrder,
  BCDataResponse,
  BCBatchResponse,
} from '../types/bc.js';
import { bcRateLimiter, updateRateLimitFromHeaders, withRateLimit } from '../lib/rate-limiter.js';
import { withRetry } from '../lib/retry.js';
import { ApiError, wrapError } from '../lib/errors.js';
import { logger, logApiCall } from '../lib/logger.js';
import { chunk } from '../lib/batch.js';

export interface BCConfig {
  storeHash: string;
  accessToken: string;
}

export interface BCClientOptions {
  /** Enable rate limiting (default: true) */
  rateLimit?: boolean;
  /** Enable automatic retry (default: true) */
  retry?: boolean;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
}

const DEFAULT_OPTIONS: BCClientOptions = {
  rateLimit: true,
  retry: true,
  timeout: 30000,
};

export class BCClient {
  private axios: AxiosInstance;
  private options: BCClientOptions;
  private storeHash: string;

  constructor(config: BCConfig, options: BCClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.storeHash = config.storeHash;

    this.axios = axios.create({
      baseURL: `https://api.bigcommerce.com/stores/${config.storeHash}`,
      headers: {
        'X-Auth-Token': config.accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: this.options.timeout,
    });

    // Response interceptor for rate limit tracking
    this.axios.interceptors.response.use(
      (response) => {
        updateRateLimitFromHeaders(response.headers as Record<string, string>);
        return response;
      },
      (error) => {
        if (error.response?.headers) {
          updateRateLimitFromHeaders(error.response.headers as Record<string, string>);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Execute an API request with rate limiting and retry
   */
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    const startTime = Date.now();

    const makeRequest = async () => {
      try {
        const response = await this.axios.request<T>({
          method,
          url,
          data,
          params,
        });
        logApiCall(method.toUpperCase(), url, response.status, Date.now() - startTime);
        return response;
      } catch (error) {
        logApiCall(method.toUpperCase(), url, undefined, Date.now() - startTime, error);
        throw error;
      }
    };

    let fn = makeRequest;

    // Wrap with retry if enabled
    if (this.options.retry) {
      fn = () => withRetry(makeRequest, {}, `BC ${method.toUpperCase()} ${url}`);
    }

    // Wrap with rate limiting if enabled
    if (this.options.rateLimit) {
      return bcRateLimiter.schedule(() => fn());
    }

    return fn();
  }

  // ============================================
  // Store Information (V2)
  // ============================================

  async getStoreInfo(): Promise<AxiosResponse<any>> {
    return this.request('get', '/v2/store');
  }

  // ============================================
  // Catalog Summary (V3)
  // ============================================

  async getCatalogSummary(): Promise<AxiosResponse<BCDataResponse<{
    inventory_count: number;
    inventory_value: number;
    primary_category_id: number;
    primary_category_name: string;
  }>>> {
    return this.request('get', '/v3/catalog/summary');
  }

  // ============================================
  // Categories (V3)
  // ============================================

  async getCategories(params: {
    page?: number;
    limit?: number;
    parent_id?: number;
    name?: string;
    'name:like'?: string;
  } = {}): Promise<AxiosResponse<BCBatchResponse<BCCategory>>> {
    return this.request('get', '/v3/catalog/categories', undefined, params);
  }

  async getCategoryById(id: number): Promise<AxiosResponse<BCDataResponse<BCCategory>>> {
    return this.request('get', `/v3/catalog/categories/${id}`);
  }

  async createCategory(categoryData: Omit<BCCategory, 'id'>): Promise<AxiosResponse<BCDataResponse<BCCategory>>> {
    return this.request('post', '/v3/catalog/categories', categoryData);
  }

  async updateCategory(id: number, categoryData: Partial<BCCategory>): Promise<AxiosResponse<BCDataResponse<BCCategory>>> {
    return this.request('put', `/v3/catalog/categories/${id}`, categoryData);
  }

  async categoryExistsByName(name: string, parentId?: number): Promise<number | null> {
    try {
      const params: Record<string, unknown> = { 'name:like': name };
      if (parentId !== undefined) {
        params.parent_id = parentId;
      }
      const response = await this.getCategories(params);
      const match = response.data.data.find(c => c.name.toLowerCase() === name.toLowerCase());
      return match?.id ?? null;
    } catch {
      return null;
    }
  }

  // ============================================
  // Products (V3)
  // ============================================

  async getProducts(params: {
    page?: number;
    limit?: number;
    sku?: string;
    name?: string;
    'sku:in'?: string;
    include?: string;
    include_fields?: string;
  } = {}): Promise<AxiosResponse<BCBatchResponse<BCProduct>>> {
    return this.request('get', '/v3/catalog/products', undefined, params);
  }

  async getProductById(id: number, include?: string): Promise<AxiosResponse<BCDataResponse<BCProduct>>> {
    const params = include ? { include } : {};
    return this.request('get', `/v3/catalog/products/${id}`, undefined, params);
  }

  async createProduct(productData: Omit<BCProduct, 'id'>): Promise<AxiosResponse<BCDataResponse<BCProduct>>> {
    return this.request('post', '/v3/catalog/products', productData);
  }

  async updateProduct(id: number, productData: Partial<BCProduct>): Promise<AxiosResponse<BCDataResponse<BCProduct>>> {
    return this.request('put', `/v3/catalog/products/${id}`, productData);
  }

  /**
   * Create multiple products in a single batch request
   * BC supports up to 10 products per batch
   */
  async createProductsBatch(products: Omit<BCProduct, 'id'>[]): Promise<BCProduct[]> {
    const batches = chunk(products, 10);
    const results: BCProduct[] = [];

    for (const batch of batches) {
      const response = await this.request<BCBatchResponse<BCProduct>>(
        'post',
        '/v3/catalog/products',
        batch
      );
      results.push(...response.data.data);
    }

    return results;
  }

  /**
   * Update multiple products in a single batch request
   */
  async updateProductsBatch(products: (Partial<BCProduct> & { id: number })[]): Promise<BCProduct[]> {
    const batches = chunk(products, 10);
    const results: BCProduct[] = [];

    for (const batch of batches) {
      const response = await this.request<BCBatchResponse<BCProduct>>(
        'put',
        '/v3/catalog/products',
        batch
      );
      results.push(...response.data.data);
    }

    return results;
  }

  async getProductIdBySku(sku: string): Promise<number | null> {
    try {
      const response = await this.getProducts({ sku, include_fields: 'id' });
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].id!;
      }
      return null;
    } catch {
      return null;
    }
  }

  async productExistsBySku(sku: string): Promise<boolean> {
    return (await this.getProductIdBySku(sku)) !== null;
  }

  // ============================================
  // Customers (V3)
  // ============================================

  async getCustomers(params: {
    page?: number;
    limit?: number;
    'email:in'?: string;
    'id:in'?: string;
    include?: string;
  } = {}): Promise<AxiosResponse<BCBatchResponse<BCCustomer>>> {
    return this.request('get', '/v3/customers', undefined, params);
  }

  async getCustomerById(id: number): Promise<AxiosResponse<BCDataResponse<BCCustomer>>> {
    return this.request('get', `/v3/customers/${id}`);
  }

  async createCustomer(customerData: Omit<BCCustomer, 'id'>): Promise<AxiosResponse<BCBatchResponse<BCCustomer>>> {
    // BC customers API expects an array even for single create
    return this.request('post', '/v3/customers', [customerData]);
  }

  /**
   * Create multiple customers in a single batch request
   * BC supports up to 10 customers per batch
   */
  async createCustomersBatch(customers: Omit<BCCustomer, 'id'>[]): Promise<BCCustomer[]> {
    const batches = chunk(customers, 10);
    const results: BCCustomer[] = [];

    for (const batch of batches) {
      const response = await this.request<BCBatchResponse<BCCustomer>>(
        'post',
        '/v3/customers',
        batch
      );
      results.push(...response.data.data);
    }

    return results;
  }

  async getCustomerIdByEmail(email: string): Promise<number | null> {
    try {
      const response = await this.getCustomers({ 'email:in': email });
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].id!;
      }
      return null;
    } catch {
      return null;
    }
  }

  async customerExistsByEmail(email: string): Promise<boolean> {
    return (await this.getCustomerIdByEmail(email)) !== null;
  }

  // ============================================
  // Orders (V2)
  // ============================================

  async createOrder(orderData: Omit<BCOrder, 'id'>): Promise<AxiosResponse<BCOrder>> {
    return this.request('post', '/v2/orders', orderData);
  }

  async getOrders(params: {
    page?: number;
    limit?: number;
    min_date_created?: string;
    max_date_created?: string;
    status_id?: number;
    customer_id?: number;
  } = {}): Promise<AxiosResponse<BCOrder[]>> {
    return this.request('get', '/v2/orders', undefined, params);
  }

  async getOrderById(id: number): Promise<AxiosResponse<BCOrder>> {
    return this.request('get', `/v2/orders/${id}`);
  }

  // ============================================
  // Health Check
  // ============================================

  async testConnection(): Promise<{ success: boolean; storeName?: string; error?: string }> {
    try {
      const response = await this.getStoreInfo();
      return {
        success: true,
        storeName: response.data.name,
      };
    } catch (error) {
      const wrapped = wrapError(error);
      return {
        success: false,
        error: wrapped.message,
      };
    }
  }
}
