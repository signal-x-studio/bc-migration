import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { AssessmentOrchestrator } from './assessment/orchestrator.js';
import { ReportGenerator } from './assessment/report.js';
import { TargetValidator, DataValidator, ValidationReportGenerator } from './validation/index.js';
import { WCClient } from './assessment/wc-client.js';
import { BCClient } from './bigcommerce/bc-client.js';
import { CategoryMigrator } from './migration/category-migrator.js';
import { ProductMigrator } from './migration/product-migrator.js';
import { CustomerMigrator } from './migration/customer-migrator.js';
import { OrderMigrator } from './migration/order-migrator.js';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const program = new Command();

program
  .name('bc-migrate')
  .description(`${chalk.bold('WooCommerce to BigCommerce Migration Suite')}
A product-led tool for mid-market merchants migrating to BigCommerce on WPEngine.
  
${chalk.cyan('Note: This tool focuses on a WordPress-native experience and does not use Catalyst by default.')}
  
Docs: https://github.com/bigcommerce/bc-migration/docs/guides`)
  .version('0.1.0');

program
  .command('assess')
  .description('Analyze a WooCommerce store for migration suitability')
  .addHelpText('after', `
Example Usage:
  $ bc-migrate assess --url https://mystore.com --key ck_123 --secret cs_456
  
Output:
  Generates a Markdown/JSON readiness report in the ./reports directory.
  Check docs/guides/assessment/HOW_TO_ASSESS.md for more details.`)
  .option('-u, --url <url>', 'WooCommerce store URL')
  .option('-k, --key <key>', 'WooCommerce Consumer Key')
  .option('-s, --secret <secret>', 'WooCommerce Consumer Secret')
  .action(async (options) => {
    // ... existing assess action logic ...
    console.log(chalk.blue('Starting assessment...'));
    const url = options.url || process.env.WC_URL;
    const key = options.key || process.env.WC_CONSUMER_KEY;
    const secret = options.secret || process.env.WC_CONSUMER_SECRET;

    if (!url || !key || !secret) {
      console.error(chalk.red('Error: Missing WooCommerce credentials. Provide via options or .env file.'));
      process.exit(1);
    }

    try {
      const orchestrator = new AssessmentOrchestrator({ url, consumerKey: key, consumerSecret: secret });
      const result = await orchestrator.run();
      
      console.log(chalk.green('\nAssessment Complete!'));
      console.log(chalk.white('-------------------'));
      console.log(chalk.white(`Store: ${result.storeUrl}`));
      console.log(chalk.white(`WC Version: ${result.wcVersion}`));
      console.log(chalk.white(`Products: ${result.metrics.scale.productCount}`));
      console.log(chalk.white(`Orders: ${result.metrics.scale.orderCount}`));
      console.log(chalk.white(`Customers: ${result.metrics.scale.customerCount}`));
      console.log(chalk.white('-------------------'));

      console.log(chalk.blue('\nGenerating reports...'));
      const reportGen = new ReportGenerator(result);
      const paths = await reportGen.save();
      
      console.log(chalk.green(`\nReports saved to:`));
      console.log(chalk.white(`- Markdown: ${paths.markdown}`));
      console.log(chalk.white(`- JSON: ${paths.json}`));
    } catch (error: any) {
      console.error(chalk.red('Assessment failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('validate-target')
  .description('Verify BigCommerce API credentials and store accessibility')
  .addHelpText('after', `
Example Usage:
  $ bc-migrate validate-target --hash abc12345 --token vt_xyz789

Output:
  Verifies connection to the BigCommerce store and displays store information.
  Useful for checking if your API credentials are correct before migration.`)
  .option('--hash <hash>', 'BigCommerce Store Hash')
  .option('--token <token>', 'BigCommerce Access Token')
  .action(async (options) => {
    const hash = options.hash || process.env.BC_STORE_HASH;
    const token = options.token || process.env.BC_ACCESS_TOKEN;

    if (!hash || !token) {
      console.error(chalk.red('Error: Missing BigCommerce credentials. Provide via options or .env file (BC_STORE_HASH, BC_ACCESS_TOKEN).'));
      process.exit(1);
    }

    const validator = new TargetValidator({ storeHash: hash, accessToken: token });
    const success = await validator.validate();

    if (!success) {
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Phase 2: Perform the migration')
  .addHelpText('after', `
Pre-requisites:
  - You must run 'assess' first.
  - Requires BigCommerce API credentials.
  
Options:
  --type <type>   Migration type (categories, products, customers, all) [default: all]
  --delta         Only migrate items modified since the last successful run`)
  .option('--type <type>', 'Type of data to migrate', 'all')
  .option('--delta', 'Enable delta sync (incremental migration)', false)
  .option('--url <url>', 'WooCommerce store URL')
  .option('--key <key>', 'WooCommerce Consumer Key')
  .option('--secret <secret>', 'WooCommerce Consumer Secret')
  .option('--hash <hash>', 'BigCommerce Store Hash')
  .option('--token <token>', 'BigCommerce Access Token')
  .action(async (options) => {
    console.log(chalk.blue('Starting migration...'));
    
    // 1. Setup Clients
    const wcUrl = options.url || process.env.WC_URL;
    const wcKey = options.key || process.env.WC_CONSUMER_KEY;
    const wcSecret = options.secret || process.env.WC_CONSUMER_SECRET;
    
    const bcHash = options.hash || process.env.BC_STORE_HASH;
    const bcToken = options.token || process.env.BC_ACCESS_TOKEN;

    if (!wcUrl || !wcKey || !wcSecret || !bcHash || !bcToken) {
       console.error(chalk.red('Error: Missing credentials. Please provide all WC and BC credentials via flags or .env.'));
       process.exit(1);
    }

    const wcClient = new WCClient({ url: wcUrl, consumerKey: wcKey, consumerSecret: wcSecret });
    const bcClient = new BCClient({ storeHash: bcHash, accessToken: bcToken });

    // 2. Route by type
    if (options.type === 'categories' || options.type === 'all') {
        const migrator = new CategoryMigrator(wcClient, bcClient, { skipExisting: true });
        await migrator.run();
    }

    if (options.type === 'products' || options.type === 'all') {
        const migrator = new ProductMigrator(wcClient, bcClient, { isDelta: options.delta, skipExisting: true });
        await migrator.run();
    }

    if (options.type === 'customers' || options.type === 'all') {
        const customerMigrator = new CustomerMigrator(wcClient, bcClient, { skipExisting: true });
        await customerMigrator.run();
    }

    if (options.type === 'orders' || options.type === 'all') {
        const orderMigrator = new OrderMigrator(wcClient, bcClient, options.delta);
        await orderMigrator.run();
    }
  });

program
  .command('validate')
  .description('Phase 3: Verify the migration results and data integrity')
  .addHelpText('after', `
Pre-requisites:
  - You must run 'migrate' first.
  - Requires both WooCommerce and BigCommerce API credentials.

Options:
  --sample <n>   Number of items to sample for price/image checks [default: 10]

Output:
  Generates validation reports in ./reports directory (JSON and Markdown).`)
  .option('--url <url>', 'WooCommerce store URL')
  .option('--key <key>', 'WooCommerce Consumer Key')
  .option('--secret <secret>', 'WooCommerce Consumer Secret')
  .option('--hash <hash>', 'BigCommerce Store Hash')
  .option('--token <token>', 'BigCommerce Access Token')
  .option('--sample <n>', 'Sample size for spot checks', '10')
  .action(async (options) => {
    console.log(chalk.blue('Starting post-migration validation...\n'));

    // 1. Setup Clients
    const wcUrl = options.url || process.env.WC_URL;
    const wcKey = options.key || process.env.WC_CONSUMER_KEY;
    const wcSecret = options.secret || process.env.WC_CONSUMER_SECRET;

    const bcHash = options.hash || process.env.BC_STORE_HASH;
    const bcToken = options.token || process.env.BC_ACCESS_TOKEN;

    if (!wcUrl || !wcKey || !wcSecret || !bcHash || !bcToken) {
      console.error(chalk.red('Error: Missing credentials. Please provide all WC and BC credentials via flags or .env.'));
      process.exit(1);
    }

    const wcClient = new WCClient({ url: wcUrl, consumerKey: wcKey, consumerSecret: wcSecret });
    const bcClient = new BCClient({ storeHash: bcHash, accessToken: bcToken });

    // 2. Run Validation
    const sampleSize = parseInt(options.sample, 10) || 10;
    const validator = new DataValidator(wcClient, bcClient, { sampleSize });

    try {
      const result = await validator.runAllChecks();

      // 3. Generate Reports
      const reportGen = new ValidationReportGenerator({ outputDir: './reports' });
      reportGen.printSummary(result);

      const { json, markdown } = await reportGen.generateReports(result);

      console.log(chalk.green('Validation reports saved:'));
      console.log(chalk.white(`  - JSON: ${json}`));
      console.log(chalk.white(`  - Markdown: ${markdown}`));

      // Exit with error code if validation failed
      if (result.overallStatus === 'fail') {
        console.log(chalk.red('\nValidation FAILED. Review the report for details.'));
        process.exit(1);
      } else if (result.overallStatus === 'warning') {
        console.log(chalk.yellow('\nValidation completed with WARNINGS. Review the report for details.'));
      } else {
        console.log(chalk.green('\nValidation PASSED!'));
      }
    } catch (error: any) {
      console.error(chalk.red('Validation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('dashboard')
  .description('Launch the local assessment dashboard')
  .action(() => {
    const reportPath = path.resolve(process.cwd(), 'reports', 'assessment.json');
    const dashboardDir = path.resolve(__dirname, '../src/dashboard'); // Adjust based on dist structure vs src
    // Since we are running with tsx src/cli.ts, __dirname is src.
    // Dashboard is in src/dashboard.
    
    // Check if report exists
    if (!fs.existsSync(reportPath)) {
        console.error(chalk.red('Error: Assessment report not found. Run "bc-migrate assess" first.'));
        return;
    }

    // Copy report to dashboard/public
    const publicDir = path.join(dashboardDir, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.copyFileSync(reportPath, path.join(publicDir, 'report.json'));
    console.log(chalk.green('✓ Report loaded into dashboard.'));

    console.log(chalk.blue('Starting dashboard server on http://localhost:3000...'));
    
    const nextCmd = 'npm';
    const nextArgs = ['run', 'dev'];
    
    const child = spawn(nextCmd, nextArgs, {
        cwd: dashboardDir,
        stdio: 'inherit',
        shell: true
    });

    child.on('error', (err) => {
        console.error(chalk.red('Failed to start dashboard:'), err);
    });
  });

program.parse();
