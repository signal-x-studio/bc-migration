import { WCClient } from '../assessment/wc-client.js';
import { BCClient } from '../bigcommerce/bc-client.js';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import type { WCCustomer } from '../types/wc.js';
import type { BCCustomer, BCAddress } from '../types/bc.js';
import { logger } from '../lib/logger.js';

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  warnings: string[];
}

export class CustomerMigrator {
  private wcClient: WCClient;
  private bcClient: BCClient;
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

  async run(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      warnings: [],
    };

    console.log(chalk.blue('Starting Customer Migration...'));
    logger.info('Starting customer migration');

    const allCustomers = await this.fetchAllWCCustomers();
    stats.total = allCustomers.length;
    console.log(chalk.white(`Found ${allCustomers.length} customers.`));

    if (allCustomers.length === 0) {
      console.log(chalk.green('No customers to migrate.'));
      return stats;
    }

    const bar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} | {status}',
    }, cliProgress.Presets.shades_classic);
    bar.start(allCustomers.length, 0, { status: 'Starting...' });

    for (const customer of allCustomers) {
      try {
        bar.update({ status: `Migrating: ${customer.email?.substring(0, 25) || 'unknown'}...` });

        // Validate customer has required email
        if (!customer.email) {
          logger.warn({ customerId: customer.id }, 'Customer has no email, skipping');
          stats.warnings.push(`Customer ID ${customer.id} has no email address`);
          stats.skipped++;
          bar.increment();
          continue;
        }

        // Check if customer already exists (idempotency)
        if (this.skipExisting) {
          const exists = await this.bcClient.customerExistsByEmail(customer.email);
          if (exists) {
            logger.info({ email: customer.email }, 'Customer already exists, skipping');
            stats.skipped++;
            bar.increment();
            continue;
          }
        }

        await this.migrateCustomer(customer);
        stats.successful++;

        logger.info({
          customerId: customer.id,
          email: customer.email,
        }, 'Customer migrated successfully');

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ customerId: customer.id, error: message }, 'Failed to migrate customer');
        stats.failed++;
        stats.warnings.push(`Failed to migrate customer "${customer.email}": ${message}`);
      }
      bar.increment();
    }

    bar.stop();
    this.reportResults(stats);
    return stats;
  }

  private async fetchAllWCCustomers(): Promise<WCCustomer[]> {
    let page = 1;
    let allCustomers: WCCustomer[] = [];
    let keepFetching = true;

    while (keepFetching) {
      const response = await this.wcClient.getCustomers({ page, per_page: 50 });
      if (response.data.length === 0) {
        keepFetching = false;
      } else {
        allCustomers = allCustomers.concat(response.data);
        page++;
      }
    }
    return allCustomers;
  }

  private async migrateCustomer(wcCustomer: WCCustomer): Promise<void> {
    // Build addresses array
    const addresses: BCAddress[] = [];

    // Add billing address if present
    if (wcCustomer.billing?.address_1) {
      addresses.push({
        first_name: wcCustomer.billing.first_name || wcCustomer.first_name,
        last_name: wcCustomer.billing.last_name || wcCustomer.last_name,
        address1: wcCustomer.billing.address_1,
        address2: wcCustomer.billing.address_2 || undefined,
        city: wcCustomer.billing.city,
        state_or_province: wcCustomer.billing.state,
        postal_code: wcCustomer.billing.postcode,
        country_code: wcCustomer.billing.country,
        phone: wcCustomer.billing.phone,
        address_type: 'residential',
      });
    }

    // Add shipping address if different from billing
    if (wcCustomer.shipping?.address_1 &&
        wcCustomer.shipping.address_1 !== wcCustomer.billing?.address_1) {
      addresses.push({
        first_name: wcCustomer.shipping.first_name || wcCustomer.first_name,
        last_name: wcCustomer.shipping.last_name || wcCustomer.last_name,
        address1: wcCustomer.shipping.address_1,
        address2: wcCustomer.shipping.address_2 || undefined,
        city: wcCustomer.shipping.city,
        state_or_province: wcCustomer.shipping.state,
        postal_code: wcCustomer.shipping.postcode,
        country_code: wcCustomer.shipping.country,
        address_type: 'residential',
      });
    }

    const payload: Omit<BCCustomer, 'id'> = {
      email: wcCustomer.email,
      first_name: wcCustomer.first_name,
      last_name: wcCustomer.last_name,
      phone: wcCustomer.billing?.phone || undefined,
      addresses: addresses.length > 0 ? addresses : undefined,
      authentication: {
        force_password_reset: true, // Critical for security - passwords cannot be migrated
      },
    };

    await this.bcClient.createCustomer(payload);
  }

  private reportResults(stats: MigrationStats): void {
    console.log(chalk.green(`\nCustomer Migration Complete.`));
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

    console.log(chalk.yellow('\nNote: Passwords cannot be migrated. Customers will need to reset their passwords.'));

    logger.info({
      total: stats.total,
      successful: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
      warningCount: stats.warnings.length,
    }, 'Customer migration completed');
  }
}
