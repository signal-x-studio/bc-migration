import { BCClient } from '../bigcommerce/bc-client.js';
import { WCClient } from '../assessment/wc-client.js';
import type { BCOrderStatusId } from '../types/bc.js';
import cliProgress from 'cli-progress';
import { StateTracker } from './state-tracker.js';
import chalk from 'chalk';

interface WCOrder {
  id: number;
  status: string;
  total: string;
  modified_gmt: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    subtotal: string;
    sku: string;
  }>;
}

export class OrderMigrator {
  private wc: WCClient;
  private bc: BCClient;
  private stateTracker: StateTracker;
  private isDelta: boolean;

  constructor(wc: WCClient, bc: BCClient, isDelta: boolean = false) {
    this.wc = wc;
    this.bc = bc;
    this.isDelta = isDelta;
    this.stateTracker = new StateTracker();
  }

  // Helper to map WC order status to BC order status ID
  private mapStatus(status: string): BCOrderStatusId {
    const statusMap: Record<string, BCOrderStatusId> = {
      'pending': 1, // Pending
      'processing': 11, // Awaiting Fulfillment / Picking
      'on-hold': 7, // Awaiting Payment
      'completed': 10, // Completed
      'cancelled': 5, // Cancelled
      'refunded': 4, // Refunded
      'failed': 6, // Declined
      'trash': 5, // Cancelled
    };
    return statusMap[status] ?? 1; // Default to Pending
  }

  async run() {
    console.log(chalk.blue(`Starting Order Migration (${this.isDelta ? 'Delta' : 'Full'})...`));
    
    // Fetch all orders from WC (handling pagination would go here, simplified for demo)
    
    let modifiedAfter = null;
    if (this.isDelta) {
        modifiedAfter = this.stateTracker.getLastRun('orders');
        if (modifiedAfter) {
            console.log(chalk.cyan(`Fetching orders modified after: ${modifiedAfter}`));
        } else {
            console.log(chalk.yellow('No previous run found. Performing full migration.'));
        }
    }

    console.log(chalk.blue('Fetching WooCommerce orders...'));
    const params: any = { per_page: 20 };
    if (modifiedAfter) {
        params.modified_after = modifiedAfter;
    }

    const response = await this.wc.getOrders(params);
    const orders: WCOrder[] = response.data;

    console.log(`Found ${orders.length} orders to migrate.`);
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(orders.length, 0);

    let successes = 0;
    let failures = 0;

    for (const order of orders) {
      try {
        // 1. Resolve Customer ID
        let customerId = 0; // 0 = Guest
        if (order.billing.email) {
            const foundId = await this.bc.getCustomerIdByEmail(order.billing.email);
            if (foundId) customerId = foundId;
        }

        // 2. Resolve Products
        const products: Array<{ product_id: number; quantity: number; price_inc_tax?: number } | { name: string; quantity: number; price_inc_tax: number; price_ex_tax: number }> = [];
        for (const item of order.line_items) {
           let productId = 0;
           if (item.sku) {
               const foundPid = await this.bc.getProductIdBySku(item.sku);
               if (foundPid) productId = foundPid;
           }

           const itemPrice = parseFloat(item.subtotal) / item.quantity;

           // If we found a product, add it link, otherwise add as custom item (manual order style)
           if (productId > 0) {
               products.push({
                   product_id: productId,
                   quantity: item.quantity,
                   price_inc_tax: itemPrice // approximation
               });
           } else {
               // Fallback: Custom product for unmapped items
               products.push({
                   name: item.name,
                   quantity: item.quantity,
                   price_inc_tax: itemPrice,
                   price_ex_tax: itemPrice // Assuming tax-inclusive pricing for simplicity
               });
           }
        }

        // 3. Construct BC Order Payload (V2)
        const orderPayload = {
            customer_id: customerId,
            status_id: this.mapStatus(order.status),
            products: products,
            billing_address: {
                first_name: order.billing.first_name,
                last_name: order.billing.last_name,
                address1: order.billing.address_1,
                city: order.billing.city,
                state_or_province: order.billing.state,
                postal_code: order.billing.postcode,
                country_code: order.billing.country,
                email: order.billing.email,
                phone: order.billing.phone
            },
            shipping_addresses: [{
                first_name: order.shipping.first_name,
                last_name: order.shipping.last_name,
                address1: order.shipping.address_1,
                city: order.shipping.city,
                state_or_province: order.shipping.state,
                postal_code: order.shipping.postcode,
                country_code: order.shipping.country,
            }]
        };

        await this.bc.createOrder(orderPayload);
        successes++;
      } catch (error: any) {
        // console.error(`Failed to migrate order ${order.id}:`, error.response?.data || error.message);
        failures++;
      }
      bar.increment();
    }

    bar.stop();
    console.log(chalk.green(`Migration Complete.`));
    console.log(chalk.white(`- Success: ${successes}`));
    console.log(chalk.white(`- Failed: ${failures}`));

    if (successes > 0) {
        this.stateTracker.setLastRun('orders');
    }
  }
}
