/**
 * Data Validator
 * Validates migration results by comparing WooCommerce and BigCommerce data
 */

import { WCClient } from '../assessment/wc-client.js';
import { BCClient } from '../bigcommerce/bc-client.js';
import { logger } from '../lib/logger.js';
import axios from 'axios';

export type ValidationStatus = 'pass' | 'fail' | 'warning' | 'skipped';

export interface ValidationCheck {
  name: string;
  description: string;
  status: ValidationStatus;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  timestamp: string;
  duration: number;
  overallStatus: ValidationStatus;
  checks: ValidationCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
}

export interface DataValidatorOptions {
  sampleSize?: number;
  imageCheckTimeout?: number;
}

const DEFAULT_OPTIONS: DataValidatorOptions = {
  sampleSize: 10,
  imageCheckTimeout: 5000,
};

export class DataValidator {
  private wcClient: WCClient;
  private bcClient: BCClient;
  private options: DataValidatorOptions;

  constructor(
    wcClient: WCClient,
    bcClient: BCClient,
    options: DataValidatorOptions = {}
  ) {
    this.wcClient = wcClient;
    this.bcClient = bcClient;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Run all validation checks
   */
  async runAllChecks(): Promise<ValidationResult> {
    const startTime = Date.now();
    const checks: ValidationCheck[] = [];

    logger.info('Starting validation checks');

    // Run all checks
    checks.push(await this.validateProductCounts());
    checks.push(await this.validateCategoryCounts());
    checks.push(await this.validateCustomerCounts());
    checks.push(await this.validateSamplePrices(this.options.sampleSize!));
    checks.push(await this.validateSampleImages(this.options.sampleSize!));

    // Calculate summary
    const summary = {
      total: checks.length,
      passed: checks.filter(c => c.status === 'pass').length,
      failed: checks.filter(c => c.status === 'fail').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      skipped: checks.filter(c => c.status === 'skipped').length,
    };

    // Determine overall status
    let overallStatus: ValidationStatus = 'pass';
    if (summary.failed > 0) {
      overallStatus = 'fail';
    } else if (summary.warnings > 0) {
      overallStatus = 'warning';
    }

    const result: ValidationResult = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      overallStatus,
      checks,
      summary,
    };

    logger.info({
      duration: result.duration,
      overallStatus,
      summary,
    }, 'Validation complete');

    return result;
  }

  /**
   * Compare product counts between WC and BC
   */
  async validateProductCounts(): Promise<ValidationCheck> {
    const name = 'Product Count';
    const description = 'Compare total product counts between WooCommerce and BigCommerce';

    try {
      // Get WC product count
      const wcCount = await this.wcClient.getCounts('products');

      // Get BC product count
      const bcResponse = await this.bcClient.getCatalogSummary();
      const bcSummary = bcResponse.data.data;

      // Also get actual product count from products endpoint for more accuracy
      const bcProductsResponse = await this.bcClient.getProducts({ limit: 1 });
      const bcCount = bcProductsResponse.data.meta?.pagination?.total ?? 0;

      const diff = wcCount - bcCount;
      const percentMigrated = wcCount > 0 ? ((bcCount / wcCount) * 100).toFixed(1) : '0';

      if (diff === 0) {
        return {
          name,
          description,
          status: 'pass',
          message: `Product counts match: ${wcCount} products`,
          details: { wcCount, bcCount, diff, percentMigrated: '100%' },
        };
      } else if (diff > 0 && bcCount > 0) {
        // Some products migrated but not all
        return {
          name,
          description,
          status: 'warning',
          message: `${bcCount} of ${wcCount} products migrated (${percentMigrated}%). ${diff} products missing.`,
          details: { wcCount, bcCount, diff, percentMigrated: `${percentMigrated}%` },
        };
      } else {
        return {
          name,
          description,
          status: 'fail',
          message: `Product count mismatch. WC: ${wcCount}, BC: ${bcCount}`,
          details: { wcCount, bcCount, diff, percentMigrated: `${percentMigrated}%` },
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: message }, 'Product count validation failed');
      return {
        name,
        description,
        status: 'fail',
        message: `Failed to validate product counts: ${message}`,
      };
    }
  }

  /**
   * Compare category counts between WC and BC
   */
  async validateCategoryCounts(): Promise<ValidationCheck> {
    const name = 'Category Count';
    const description = 'Compare total category counts between WooCommerce and BigCommerce';

    try {
      // Get WC category count
      const wcCount = await this.wcClient.getCounts('products/categories');

      // Get BC category count
      let bcCount = 0;
      let page = 1;
      let keepFetching = true;

      while (keepFetching) {
        const response = await this.bcClient.getCategories({ page, limit: 250 });
        const categories = response.data.data;
        if (categories.length === 0) {
          keepFetching = false;
        } else {
          bcCount += categories.length;
          page++;
        }
      }

      const diff = wcCount - bcCount;

      if (diff === 0) {
        return {
          name,
          description,
          status: 'pass',
          message: `Category counts match: ${wcCount} categories`,
          details: { wcCount, bcCount, diff },
        };
      } else if (Math.abs(diff) <= 2) {
        // Small difference might be due to default categories
        return {
          name,
          description,
          status: 'warning',
          message: `Minor category count difference. WC: ${wcCount}, BC: ${bcCount}`,
          details: { wcCount, bcCount, diff },
        };
      } else {
        return {
          name,
          description,
          status: 'fail',
          message: `Category count mismatch. WC: ${wcCount}, BC: ${bcCount}`,
          details: { wcCount, bcCount, diff },
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: message }, 'Category count validation failed');
      return {
        name,
        description,
        status: 'fail',
        message: `Failed to validate category counts: ${message}`,
      };
    }
  }

  /**
   * Compare customer counts between WC and BC
   */
  async validateCustomerCounts(): Promise<ValidationCheck> {
    const name = 'Customer Count';
    const description = 'Compare total customer counts between WooCommerce and BigCommerce';

    try {
      // Get WC customer count
      const wcCount = await this.wcClient.getCounts('customers');

      // Get BC customer count
      let bcCount = 0;
      let page = 1;
      let keepFetching = true;

      while (keepFetching) {
        const response = await this.bcClient.getCustomers({ page, limit: 250 });
        const customers = response.data.data;
        if (customers.length === 0) {
          keepFetching = false;
        } else {
          bcCount += customers.length;
          page++;
        }
      }

      const diff = wcCount - bcCount;
      const percentMigrated = wcCount > 0 ? ((bcCount / wcCount) * 100).toFixed(1) : '0';

      if (diff === 0) {
        return {
          name,
          description,
          status: 'pass',
          message: `Customer counts match: ${wcCount} customers`,
          details: { wcCount, bcCount, diff, percentMigrated: '100%' },
        };
      } else if (diff > 0 && bcCount > 0) {
        return {
          name,
          description,
          status: 'warning',
          message: `${bcCount} of ${wcCount} customers migrated (${percentMigrated}%).`,
          details: { wcCount, bcCount, diff, percentMigrated: `${percentMigrated}%` },
        };
      } else {
        return {
          name,
          description,
          status: 'fail',
          message: `Customer count mismatch. WC: ${wcCount}, BC: ${bcCount}`,
          details: { wcCount, bcCount, diff, percentMigrated: `${percentMigrated}%` },
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: message }, 'Customer count validation failed');
      return {
        name,
        description,
        status: 'fail',
        message: `Failed to validate customer counts: ${message}`,
      };
    }
  }

  /**
   * Spot check prices on a sample of products
   */
  async validateSamplePrices(sampleSize: number): Promise<ValidationCheck> {
    const name = 'Price Validation';
    const description = `Spot check prices on ${sampleSize} random products`;

    try {
      // Get sample of BC products with SKUs
      const bcResponse = await this.bcClient.getProducts({ limit: sampleSize });
      const bcProducts = bcResponse.data.data;

      if (bcProducts.length === 0) {
        return {
          name,
          description,
          status: 'skipped',
          message: 'No products found in BigCommerce to validate',
        };
      }

      const mismatches: { sku: string; wcPrice: number; bcPrice: number }[] = [];
      const matches: string[] = [];

      for (const bcProduct of bcProducts) {
        if (!bcProduct.sku) continue;

        // Try to find the same product in WC by SKU
        const wcResponse = await this.wcClient.getProducts({ sku: bcProduct.sku });
        const wcProducts = wcResponse.data;

        if (wcProducts.length > 0) {
          const wcPrice = parseFloat(wcProducts[0].price) || 0;
          const bcPrice = bcProduct.price;

          if (Math.abs(wcPrice - bcPrice) > 0.01) {
            mismatches.push({
              sku: bcProduct.sku,
              wcPrice,
              bcPrice,
            });
          } else {
            matches.push(bcProduct.sku);
          }
        }
      }

      if (mismatches.length === 0 && matches.length > 0) {
        return {
          name,
          description,
          status: 'pass',
          message: `All ${matches.length} sampled prices match`,
          details: { sampledCount: matches.length, matchedSkus: matches },
        };
      } else if (mismatches.length > 0) {
        return {
          name,
          description,
          status: 'fail',
          message: `${mismatches.length} price mismatch(es) found in ${matches.length + mismatches.length} samples`,
          details: { mismatches, matchCount: matches.length },
        };
      } else {
        return {
          name,
          description,
          status: 'skipped',
          message: 'Could not find matching products to compare prices',
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: message }, 'Price validation failed');
      return {
        name,
        description,
        status: 'fail',
        message: `Failed to validate prices: ${message}`,
      };
    }
  }

  /**
   * Check if product images are accessible
   */
  async validateSampleImages(sampleSize: number): Promise<ValidationCheck> {
    const name = 'Image Accessibility';
    const description = `Check if ${sampleSize} product images are accessible`;

    try {
      // Get sample of BC products with images
      const bcResponse = await this.bcClient.getProducts({
        limit: sampleSize,
        include: 'images',
      });
      const bcProducts = bcResponse.data.data;

      if (bcProducts.length === 0) {
        return {
          name,
          description,
          status: 'skipped',
          message: 'No products found to validate images',
        };
      }

      const imageUrls: string[] = [];
      for (const product of bcProducts) {
        if (product.images && product.images.length > 0) {
          // Get first image URL
          const url = product.images[0].url_standard || product.images[0].image_url;
          if (url) {
            imageUrls.push(url);
          }
        }
      }

      if (imageUrls.length === 0) {
        return {
          name,
          description,
          status: 'warning',
          message: 'No images found on sampled products',
        };
      }

      const accessible: string[] = [];
      const inaccessible: { url: string; error: string }[] = [];

      for (const url of imageUrls.slice(0, sampleSize)) {
        try {
          const response = await axios.head(url, {
            timeout: this.options.imageCheckTimeout,
            validateStatus: (status) => status < 400,
          });
          accessible.push(url);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          inaccessible.push({ url, error: message });
        }
      }

      if (inaccessible.length === 0) {
        return {
          name,
          description,
          status: 'pass',
          message: `All ${accessible.length} sampled images are accessible`,
          details: { checkedCount: accessible.length },
        };
      } else if (inaccessible.length < accessible.length) {
        return {
          name,
          description,
          status: 'warning',
          message: `${inaccessible.length} of ${accessible.length + inaccessible.length} images are inaccessible`,
          details: { accessible: accessible.length, inaccessible: inaccessible.length, failedUrls: inaccessible },
        };
      } else {
        return {
          name,
          description,
          status: 'fail',
          message: `All ${inaccessible.length} sampled images are inaccessible`,
          details: { failedUrls: inaccessible },
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: message }, 'Image validation failed');
      return {
        name,
        description,
        status: 'fail',
        message: `Failed to validate images: ${message}`,
      };
    }
  }
}
