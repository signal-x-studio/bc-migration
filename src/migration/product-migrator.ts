import { WCClient } from '../assessment/wc-client.js';
import { BCClient } from '../bigcommerce/bc-client.js';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { StateTracker } from './state-tracker.js';
import {
  transformProduct,
  type CategoryMap,
  type ProductTransformResult,
} from './transformers/index.js';
import type { WCProduct, WCVariation } from '../types/wc.js';
import { logger } from '../lib/logger.js';
import { chunk } from '../lib/batch.js';

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  warnings: string[];
}

export class ProductMigrator {
  private wcClient: WCClient;
  private bcClient: BCClient;
  private categoryMap: CategoryMap = new Map();
  private stateTracker: StateTracker;
  private isDelta: boolean;
  private skipExisting: boolean;

  constructor(
    wcClient: WCClient,
    bcClient: BCClient,
    options: { isDelta?: boolean; skipExisting?: boolean } = {}
  ) {
    this.wcClient = wcClient;
    this.bcClient = bcClient;
    this.isDelta = options.isDelta ?? false;
    this.skipExisting = options.skipExisting ?? true;
    this.stateTracker = new StateTracker();
  }

  async run(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      warnings: [],
    };

    console.log(chalk.blue(`Starting Product Migration (${this.isDelta ? 'Delta' : 'Full'})...`));
    logger.info({ isDelta: this.isDelta }, 'Starting product migration');

    // 1. Build Category Map (Name -> ID)
    await this.buildCategoryMap();

    // 2. Fetch WC Products
    let modifiedAfter: string | null = null;
    if (this.isDelta) {
      modifiedAfter = this.stateTracker.getLastRun('products');
      if (modifiedAfter) {
        console.log(chalk.cyan(`Fetching products modified after: ${modifiedAfter}`));
      } else {
        console.log(chalk.yellow('No previous run found. Performing full migration.'));
      }
    }

    console.log(chalk.blue('Fetching WooCommerce products...'));
    const allProducts = await this.fetchAllWCProducts(modifiedAfter);
    stats.total = allProducts.length;
    console.log(chalk.white(`Found ${allProducts.length} products to migrate.`));

    if (allProducts.length === 0) {
      console.log(chalk.green('No new or updated products found.'));
      return stats;
    }

    // 3. Identify variable products and fetch their variations
    const variableProducts = allProducts.filter((p: WCProduct) => p.type === 'variable');
    console.log(chalk.blue(`Fetching variations for ${variableProducts.length} variable products...`));

    const variationsMap = new Map<number, WCVariation[]>();
    for (const product of variableProducts) {
      try {
        const variations = await this.wcClient.getAllProductVariations(product.id);
        variationsMap.set(product.id, variations);
        logger.debug({ productId: product.id, variationCount: variations.length }, 'Fetched variations');
      } catch (error) {
        logger.warn({ productId: product.id, error }, 'Failed to fetch variations');
        stats.warnings.push(`Failed to fetch variations for product ${product.id}: ${product.name}`);
      }
    }

    // 4. Migrate Products
    const bar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} | {status}',
    }, cliProgress.Presets.shades_classic);
    bar.start(allProducts.length, 0, { status: 'Starting...' });

    for (const wcProduct of allProducts) {
      try {
        bar.update({ status: `Migrating: ${wcProduct.name.substring(0, 30)}...` });

        // Check if product already exists (idempotency)
        if (this.skipExisting) {
          const sku = wcProduct.sku || `wc-${wcProduct.id}`;
          const exists = await this.bcClient.productExistsBySku(sku);
          if (exists) {
            logger.info({ sku, productName: wcProduct.name }, 'Product already exists, skipping');
            stats.skipped++;
            bar.increment();
            continue;
          }
        }

        // Transform WC product to BC format
        const variations = variationsMap.get(wcProduct.id) || null;
        const transformResult = await this.transformAndValidate(wcProduct, variations);

        if (transformResult.errors.length > 0) {
          logger.error({
            productId: wcProduct.id,
            errors: transformResult.errors
          }, 'Product transformation failed');
          stats.failed++;
          stats.warnings.push(...transformResult.errors.map(e => `${wcProduct.name}: ${e}`));
          bar.increment();
          continue;
        }

        // Log any warnings from transformation
        if (transformResult.warnings.length > 0) {
          stats.warnings.push(...transformResult.warnings.map(w => `${wcProduct.name}: ${w}`));
          transformResult.warnings.forEach(w => {
            logger.warn({ productId: wcProduct.id }, w);
          });
        }

        // Create product in BC
        await this.bcClient.createProduct(transformResult.product);
        stats.successful++;

        logger.info({
          productId: wcProduct.id,
          sku: transformResult.product.sku,
          hasVariants: (transformResult.product.variants?.length ?? 0) > 0,
        }, 'Product migrated successfully');

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ productId: wcProduct.id, error: message }, 'Failed to migrate product');
        stats.failed++;
        stats.warnings.push(`Failed to migrate "${wcProduct.name}": ${message}`);
      }

      bar.increment();
    }

    bar.stop();

    // 5. Report results
    this.reportResults(stats);

    // Update state tracker if any products were migrated
    if (stats.successful > 0) {
      this.stateTracker.setLastRun('products');
    }

    return stats;
  }

  private async buildCategoryMap(): Promise<void> {
    console.log('Building Category Map...');
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      const response = await this.bcClient.getCategories({ page, limit: 250 });
      if (response.data.data.length === 0) {
        keepFetching = false;
      } else {
        response.data.data.forEach((cat: { name: string; id?: number }) => {
          if (cat.id !== undefined) {
            this.categoryMap.set(cat.name, cat.id);
          }
        });
        page++;
      }
    }
    console.log(`Mapped ${this.categoryMap.size} BigCommerce categories.`);
    logger.info({ categoryCount: this.categoryMap.size }, 'Category map built');
  }

  private async fetchAllWCProducts(modifiedAfter: string | null = null): Promise<WCProduct[]> {
    let page = 1;
    let allProducts: WCProduct[] = [];
    let keepFetching = true;

    while (keepFetching) {
      const params: Record<string, unknown> = { page, per_page: 50 };
      if (modifiedAfter) {
        params.modified_after = modifiedAfter;
      }

      const response = await this.wcClient.getProducts(params);
      if (response.data.length === 0) {
        keepFetching = false;
      } else {
        allProducts = allProducts.concat(response.data);
        page++;
      }
    }
    return allProducts;
  }

  private async transformAndValidate(
    wcProduct: WCProduct,
    variations: WCVariation[] | null
  ): Promise<ProductTransformResult> {
    return transformProduct(wcProduct, variations, this.categoryMap);
  }

  private reportResults(stats: MigrationStats): void {
    console.log(chalk.green(`\nMigration Complete.`));
    console.log(chalk.white(`- Total:      ${stats.total}`));
    console.log(chalk.green(`- Successful: ${stats.successful}`));
    console.log(chalk.yellow(`- Skipped:    ${stats.skipped}`));
    console.log(chalk.red(`- Failed:     ${stats.failed}`));

    if (stats.warnings.length > 0) {
      console.log(chalk.yellow(`\nWarnings (${stats.warnings.length}):`));
      // Show first 10 warnings
      stats.warnings.slice(0, 10).forEach(w => {
        console.log(chalk.yellow(`  - ${w}`));
      });
      if (stats.warnings.length > 10) {
        console.log(chalk.yellow(`  ... and ${stats.warnings.length - 10} more (see log file)`));
      }
    }

    logger.info({
      total: stats.total,
      successful: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
      warningCount: stats.warnings.length,
    }, 'Product migration completed');
  }
}
