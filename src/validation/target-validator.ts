import { BCClient, BCConfig } from '../bigcommerce/bc-client.js';
import chalk from 'chalk';

export class TargetValidator {
  private client: BCClient;

  constructor(config: BCConfig) {
    this.client = new BCClient(config);
  }

  async validate(): Promise<boolean> {
    try {
      console.log(chalk.blue('Connecting to BigCommerce API...'));
      const storeInfo = await this.client.getStoreInfo();
      
      console.log(chalk.green('✓ BigCommerce API Connection Successful'));
      console.log(chalk.white('-----------------------------------'));
      console.log(chalk.white(`Store Name: ${chalk.bold(storeInfo.data.name)}`));
      console.log(chalk.white(`Domain:     ${storeInfo.data.domain}`));
      console.log(chalk.white(`Secure URL: ${storeInfo.data.secure_url}`));
      console.log(chalk.white(`Currency:   ${storeInfo.data.currency}`));

      // Check catalog summary to verify V3 access
      const catalogInfo = await this.client.getCatalogSummary();
      console.log(chalk.green('✓ V3 Catalog API Accessible'));
      console.log(chalk.gray(`  (Current Catalog: ${catalogInfo.data.data.inventory_count} inventory items)`));

      // Check Storefront Accessibility
      if (storeInfo.data.secure_url) {
        await this.checkStorefront(storeInfo.data.secure_url);
      }

      return true;
    } catch (error: any) {
      console.error(chalk.red('\n✗ Verification Failed'));
      if (error.response) {
        console.error(chalk.red(`API Error (${error.response.status}):`));
        console.error(chalk.red(JSON.stringify(error.response.data, null, 2)));
        
        if (error.response.status === 401 || error.response.status === 403) {
           console.log(chalk.yellow('\nTip: Check your Store Hash and Access Token. Ensure the token has "Read" scopes for Information & Settings and Products.'));
        }
      } else {
        console.error(chalk.red(error.message));
      }
      return false;
    }
  }

  private async checkStorefront(url: string) {
    try {
      // Intentionally using a separate axios instance or simple fetch to avoid auth headers being sent to storefront if not needed, 
      // though axios.get(url) works fine. Accessing storefront doesn't need API token usually unless it's private/maintenance.
      // We just want to see if it resolves.
      const response = await this.client['axios'].get(url, { headers: { 'X-Auth-Token': '' } }); // Clear auth token for public request if possible, but strict mode might block.
      // Actually, better to just use a fresh axios call.
      const publicAxios = (await import('axios')).default;
      const res = await publicAxios.get(url);
      
      console.log(chalk.green(`✓ Storefront is Reachable (${res.status})`));
    } catch (error: any) {
      console.log(chalk.yellow(`! Storefront might be down or in maintenance mode (${error.message})`));
    }
  }
}
