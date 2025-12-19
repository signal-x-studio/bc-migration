import { WCClient } from '../assessment/wc-client.js';
import { BCClient } from '../bigcommerce/bc-client.js';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import type { WCCategory } from '../types/wc.js';
import type { BCCategory } from '../types/bc.js';
import { logger } from '../lib/logger.js';

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  warnings: string[];
}

export class CategoryMigrator {
  private wcClient: WCClient;
  private bcClient: BCClient;
  private idMapping: Map<number, number> = new Map(); // WC ID -> BC ID
  private skipExisting: boolean;

  constructor(
    wcClient: WCClient,
    bcClient: BCClient,
    options: { skipExisting?: boolean } = {}
  ) {
    this.wcClient = wcClient;
    this.bcClient = bcClient;
    this.skipExisting = options.skipExisting ?? true;
  }

  /**
   * Get the ID mapping (WC ID -> BC ID) after migration
   * Useful for other migrators that need to map category references
   */
  getIdMapping(): Map<number, number> {
    return new Map(this.idMapping);
  }

  async run(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      warnings: [],
    };

    console.log(chalk.blue('Starting Category Migration...'));
    logger.info('Starting category migration');

    // 1. Fetch all WC Categories
    const allCategories = await this.fetchAllWCCategories();
    stats.total = allCategories.length;
    console.log(chalk.white(`Found ${allCategories.length} categories in WooCommerce.`));

    if (allCategories.length === 0) {
      console.log(chalk.green('No categories to migrate.'));
      return stats;
    }

    // 2. Sort by hierarchy (parents first)
    const rootCategories = allCategories.filter((c: WCCategory) => c.parent === 0);

    const bar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} | {status}',
    }, cliProgress.Presets.shades_classic);
    bar.start(allCategories.length, 0, { status: 'Starting...' });

    await this.processBatch(rootCategories, allCategories, stats, bar);

    bar.stop();
    this.reportResults(stats);
    return stats;
  }

  private async fetchAllWCCategories(): Promise<WCCategory[]> {
    let page = 1;
    let allCategories: WCCategory[] = [];
    let keepFetching = true;

    while (keepFetching) {
      const response = await this.wcClient.getCategories({ page, per_page: 100 });
      if (response.data.length === 0) {
        keepFetching = false;
      } else {
        allCategories = allCategories.concat(response.data);
        page++;
      }
    }
    return allCategories;
  }

  private async processBatch(
    categoriesToMigrate: WCCategory[],
    allCategories: WCCategory[],
    stats: MigrationStats,
    bar: cliProgress.SingleBar
  ): Promise<void> {
    for (const wcCategory of categoriesToMigrate) {
      try {
        bar.update({ status: `Migrating: ${wcCategory.name.substring(0, 30)}...` });

        // Determine BC parent ID
        const bcParentId = wcCategory.parent === 0
          ? 0
          : this.idMapping.get(wcCategory.parent) || 0;

        // Check if category already exists (idempotency)
        if (this.skipExisting) {
          const existingId = await this.bcClient.categoryExistsByName(wcCategory.name, bcParentId || undefined);
          if (existingId !== null) {
            logger.info({
              wcId: wcCategory.id,
              bcId: existingId,
              name: wcCategory.name
            }, 'Category already exists, skipping');
            this.idMapping.set(wcCategory.id, existingId);
            stats.skipped++;
            bar.increment();

            // Still process children
            const children = allCategories.filter((c: WCCategory) => c.parent === wcCategory.id);
            if (children.length > 0) {
              await this.processBatch(children, allCategories, stats, bar);
            }
            continue;
          }
        }

        const bcId = await this.migrateCategory(wcCategory, bcParentId);
        if (bcId) {
          this.idMapping.set(wcCategory.id, bcId);
          stats.successful++;

          logger.info({
            wcId: wcCategory.id,
            bcId,
            name: wcCategory.name,
          }, 'Category migrated successfully');

          bar.increment();

          // Find and process children of this category
          const children = allCategories.filter((c: WCCategory) => c.parent === wcCategory.id);
          if (children.length > 0) {
            await this.processBatch(children, allCategories, stats, bar);
          }
        } else {
          stats.failed++;
          bar.increment();
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error({
          wcId: wcCategory.id,
          name: wcCategory.name,
          error: message
        }, 'Failed to migrate category');
        stats.failed++;
        stats.warnings.push(`Failed to migrate category "${wcCategory.name}": ${message}`);
        bar.increment();
      }
    }
  }

  private async migrateCategory(wcCategory: WCCategory, bcParentId: number): Promise<number | null> {
    const payload: Omit<BCCategory, 'id'> = {
      name: wcCategory.name,
      description: wcCategory.description || undefined,
      parent_id: bcParentId,
      is_visible: true,
      sort_order: wcCategory.menu_order,
      // BC auto-generates URL from name
    };

    // Add image if present
    if (wcCategory.image?.src) {
      payload.image_url = wcCategory.image.src;
    }

    try {
      const response = await this.bcClient.createCategory(payload);
      return response.data.data.id ?? null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        categoryName: wcCategory.name,
        error: message
      }, 'Error creating category');
      return null;
    }
  }

  private reportResults(stats: MigrationStats): void {
    console.log(chalk.green(`\nCategory Migration Complete.`));
    console.log(chalk.white(`- Total:      ${stats.total}`));
    console.log(chalk.green(`- Successful: ${stats.successful}`));
    console.log(chalk.yellow(`- Skipped:    ${stats.skipped}`));
    console.log(chalk.red(`- Failed:     ${stats.failed}`));

    if (stats.warnings.length > 0) {
      console.log(chalk.yellow(`\nWarnings (${stats.warnings.length}):`));
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
      mappedCategories: this.idMapping.size,
      warningCount: stats.warnings.length,
    }, 'Category migration completed');
  }
}
