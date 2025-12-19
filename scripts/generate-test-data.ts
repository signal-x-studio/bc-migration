#!/usr/bin/env npx tsx
/**
 * WooCommerce Test Data Generator
 * Generates realistic test data via WC REST API for migration testing
 *
 * Usage: npx tsx scripts/generate-test-data.ts [--dry-run] [--scale=small|medium|large]
 */

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import dotenv from 'dotenv';
import {
  generateSimpleProduct,
  generateVariableProduct,
  generateVirtualProduct,
  generateDownloadableProduct,
  generateVariation,
  generateCategoryHierarchy,
  generateCustomer,
  generateOrder,
  generateHighVariantProduct,
  generateUnicodeProduct,
  COLORS,
  SIZES,
  MATERIALS,
} from './faker-data.js';

dotenv.config();

// ============================================
// Configuration
// ============================================

interface ScaleConfig {
  categories: number;
  simpleProducts: number;
  variableProducts: number;
  virtualProducts: number;
  downloadableProducts: number;
  customers: number;
  orders: number;
}

const SCALES: Record<string, ScaleConfig> = {
  small: {
    categories: 10,
    simpleProducts: 50,
    variableProducts: 20,
    virtualProducts: 5,
    downloadableProducts: 5,
    customers: 30,
    orders: 20,
  },
  medium: {
    categories: 50,
    simpleProducts: 300,
    variableProducts: 150,
    virtualProducts: 30,
    downloadableProducts: 20,
    customers: 200,
    orders: 100,
  },
  large: {
    categories: 100,
    simpleProducts: 600,
    variableProducts: 300,
    virtualProducts: 60,
    downloadableProducts: 40,
    customers: 500,
    orders: 300,
  },
};

// ============================================
// WooCommerce API Client (with write support)
// ============================================

class WCWriteClient {
  private api: any;

  constructor() {
    const url = process.env.WC_URL;
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;

    if (!url || !consumerKey || !consumerSecret) {
      throw new Error('Missing WC credentials. Set WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET in .env');
    }

    this.api = new (WooCommerceRestApi as any).default({
      url,
      consumerKey,
      consumerSecret,
      version: 'wc/v3',
      queryStringAuth: true,
    });
  }

  async post(endpoint: string, data: any) {
    return this.api.post(endpoint, data);
  }

  async get(endpoint: string, params: any = {}) {
    return this.api.get(endpoint, params);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('products', { per_page: 1 });
      return true;
    } catch (error: any) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }
}

// ============================================
// Progress Logger
// ============================================

class ProgressLogger {
  private startTime: number;
  private currentStep = 0;
  private totalSteps = 0;

  constructor(totalSteps: number) {
    this.startTime = Date.now();
    this.totalSteps = totalSteps;
  }

  log(message: string) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[${elapsed}s] ${message}`);
  }

  step(message: string) {
    this.currentStep++;
    const percent = ((this.currentStep / this.totalSteps) * 100).toFixed(0);
    this.log(`[${percent}%] ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] ${message}`);
  }

  success(message: string) {
    console.log(`[SUCCESS] ${message}`);
  }
}

// ============================================
// Data Generators
// ============================================

async function createCategories(
  client: WCWriteClient,
  count: number,
  logger: ProgressLogger,
  dryRun: boolean
): Promise<number[]> {
  logger.log(`Creating ${count} categories...`);

  const categoryHierarchy = generateCategoryHierarchy(count);
  const categoryIds: number[] = [];
  const levelMap: Record<number, number[]> = { 0: [], 1: [], 2: [] };

  // Group by level
  for (const cat of categoryHierarchy) {
    levelMap[cat.level].push(categoryIds.length);
    categoryIds.push(0); // Placeholder
  }

  // Create level 0 (root) categories first
  for (let i = 0; i < categoryHierarchy.length; i++) {
    const cat = categoryHierarchy[i];
    if (cat.level !== 0) continue;

    if (dryRun) {
      categoryIds[i] = 1000 + i;
      logger.step(`[DRY RUN] Would create category: ${cat.name}`);
    } else {
      try {
        const response = await client.post('products/categories', {
          name: cat.name,
          description: cat.description,
        });
        categoryIds[i] = response.data.id;
        logger.step(`Created category: ${cat.name} (ID: ${response.data.id})`);
        await delay(100);
      } catch (error: any) {
        logger.error(`Failed to create category ${cat.name}: ${error.message}`);
      }
    }
  }

  // Create level 1 categories (children of level 0)
  const level0Ids = categoryIds.filter((_, i) => categoryHierarchy[i]?.level === 0);
  for (let i = 0; i < categoryHierarchy.length; i++) {
    const cat = categoryHierarchy[i];
    if (cat.level !== 1) continue;

    const parentId = level0Ids[i % level0Ids.length];

    if (dryRun) {
      categoryIds[i] = 1000 + i;
      logger.step(`[DRY RUN] Would create category: ${cat.name} (parent: ${parentId})`);
    } else {
      try {
        const response = await client.post('products/categories', {
          name: cat.name,
          description: cat.description,
          parent: parentId,
        });
        categoryIds[i] = response.data.id;
        logger.step(`Created category: ${cat.name} (ID: ${response.data.id}, parent: ${parentId})`);
        await delay(100);
      } catch (error: any) {
        logger.error(`Failed to create category ${cat.name}: ${error.message}`);
      }
    }
  }

  // Create level 2 categories (children of level 1)
  const level1Ids = categoryIds.filter((id, i) => categoryHierarchy[i]?.level === 1 && id > 0);
  for (let i = 0; i < categoryHierarchy.length; i++) {
    const cat = categoryHierarchy[i];
    if (cat.level !== 2) continue;

    const parentId = level1Ids.length > 0 ? level1Ids[i % level1Ids.length] : 0;

    if (dryRun) {
      categoryIds[i] = 1000 + i;
      logger.step(`[DRY RUN] Would create category: ${cat.name} (parent: ${parentId})`);
    } else {
      try {
        const response = await client.post('products/categories', {
          name: cat.name,
          description: cat.description,
          ...(parentId > 0 && { parent: parentId }),
        });
        categoryIds[i] = response.data.id;
        logger.step(`Created category: ${cat.name} (ID: ${response.data.id})`);
        await delay(100);
      } catch (error: any) {
        logger.error(`Failed to create category ${cat.name}: ${error.message}`);
      }
    }
  }

  const validIds = categoryIds.filter(id => id > 0);
  logger.success(`Created ${validIds.length} categories`);
  return validIds;
}

async function createSimpleProducts(
  client: WCWriteClient,
  count: number,
  categoryIds: number[],
  logger: ProgressLogger,
  dryRun: boolean
): Promise<number[]> {
  logger.log(`Creating ${count} simple products...`);
  const productIds: number[] = [];

  for (let i = 0; i < count; i++) {
    // Add edge cases
    const withSKU = i >= 20; // First 20 products without SKUs
    const withImages = i >= 30; // First 30 without images
    const withUnicode = i % 10 === 0; // 10% with unicode
    const longDescription = i % 20 === 0; // 5% with long descriptions
    const isOrphan = i >= count - 10; // Last 10 without categories

    const product = generateSimpleProduct(
      isOrphan ? [] : categoryIds,
      { withSKU, withImages, withUnicode, longDescription }
    );

    if (dryRun) {
      productIds.push(1000 + i);
      logger.step(`[DRY RUN] Would create product: ${product.name}`);
    } else {
      try {
        const response = await client.post('products', product);
        productIds.push(response.data.id);
        logger.step(`Created simple product: ${product.name} (ID: ${response.data.id})`);
        await delay(200);
      } catch (error: any) {
        logger.error(`Failed to create product ${product.name}: ${error.message}`);
      }
    }
  }

  logger.success(`Created ${productIds.length} simple products`);
  return productIds;
}

async function createVariableProducts(
  client: WCWriteClient,
  count: number,
  categoryIds: number[],
  logger: ProgressLogger,
  dryRun: boolean
): Promise<number[]> {
  logger.log(`Creating ${count} variable products...`);
  const productIds: number[] = [];

  // Create 2 high-variant products (600+ variations) for edge case testing
  const highVariantCount = 2;

  for (let i = 0; i < count; i++) {
    const isHighVariant = i < highVariantCount;
    const attributeCount = isHighVariant ? 3 : (i % 3 === 0 ? 1 : 2) as 1 | 2 | 3;

    const product = isHighVariant
      ? generateHighVariantProduct(categoryIds)
      : generateVariableProduct(categoryIds, attributeCount);

    if (dryRun) {
      productIds.push(1000 + i);
      logger.step(`[DRY RUN] Would create variable product: ${product.name} (${isHighVariant ? '600+ variants' : 'normal'})`);
      continue;
    }

    try {
      // Create the variable product first
      const response = await client.post('products', product);
      const productId = response.data.id;
      productIds.push(productId);
      logger.step(`Created variable product: ${product.name} (ID: ${productId})`);

      // Generate all variation combinations
      const variationCombinations = generateVariationCombinations(product.attributes);

      // Limit variations for non-high-variant products
      const maxVariations = isHighVariant ? variationCombinations.length : Math.min(variationCombinations.length, 20);

      // Create variations
      for (let v = 0; v < maxVariations; v++) {
        const variation = generateVariation(variationCombinations[v]);

        try {
          await client.post(`products/${productId}/variations`, variation);
          await delay(100);
        } catch (error: any) {
          logger.error(`Failed to create variation for product ${productId}: ${error.message}`);
        }
      }

      logger.log(`  Added ${maxVariations} variations to product ${productId}`);
      await delay(200);
    } catch (error: any) {
      logger.error(`Failed to create variable product ${product.name}: ${error.message}`);
    }
  }

  logger.success(`Created ${productIds.length} variable products`);
  return productIds;
}

function generateVariationCombinations(
  attributes: { name: string; options: string[] }[]
): { name: string; option: string }[][] {
  if (attributes.length === 0) return [];

  const combinations: { name: string; option: string }[][] = [];

  function recurse(index: number, current: { name: string; option: string }[]) {
    if (index === attributes.length) {
      combinations.push([...current]);
      return;
    }

    const attr = attributes[index];
    for (const option of attr.options) {
      current.push({ name: attr.name, option });
      recurse(index + 1, current);
      current.pop();
    }
  }

  recurse(0, []);
  return combinations;
}

async function createVirtualProducts(
  client: WCWriteClient,
  count: number,
  categoryIds: number[],
  logger: ProgressLogger,
  dryRun: boolean
): Promise<number[]> {
  logger.log(`Creating ${count} virtual products...`);
  const productIds: number[] = [];

  for (let i = 0; i < count; i++) {
    const product = generateVirtualProduct(categoryIds);

    if (dryRun) {
      productIds.push(1000 + i);
      logger.step(`[DRY RUN] Would create virtual product: ${product.name}`);
    } else {
      try {
        const response = await client.post('products', product);
        productIds.push(response.data.id);
        logger.step(`Created virtual product: ${product.name} (ID: ${response.data.id})`);
        await delay(200);
      } catch (error: any) {
        logger.error(`Failed to create virtual product ${product.name}: ${error.message}`);
      }
    }
  }

  logger.success(`Created ${productIds.length} virtual products`);
  return productIds;
}

async function createDownloadableProducts(
  client: WCWriteClient,
  count: number,
  categoryIds: number[],
  logger: ProgressLogger,
  dryRun: boolean
): Promise<number[]> {
  logger.log(`Creating ${count} downloadable products...`);
  const productIds: number[] = [];

  for (let i = 0; i < count; i++) {
    const product = generateDownloadableProduct(categoryIds);

    if (dryRun) {
      productIds.push(1000 + i);
      logger.step(`[DRY RUN] Would create downloadable product: ${product.name}`);
    } else {
      try {
        const response = await client.post('products', product);
        productIds.push(response.data.id);
        logger.step(`Created downloadable product: ${product.name} (ID: ${response.data.id})`);
        await delay(200);
      } catch (error: any) {
        logger.error(`Failed to create downloadable product ${product.name}: ${error.message}`);
      }
    }
  }

  logger.success(`Created ${productIds.length} downloadable products`);
  return productIds;
}

async function createCustomers(
  client: WCWriteClient,
  count: number,
  logger: ProgressLogger,
  dryRun: boolean
): Promise<{ id: number; billing: any }[]> {
  logger.log(`Creating ${count} customers...`);
  const customers: { id: number; billing: any }[] = [];

  for (let i = 0; i < count; i++) {
    // Some customers without addresses
    const withAddresses = i >= 20; // First 20 without addresses
    const customer = generateCustomer({ withAddresses });

    if (dryRun) {
      customers.push({ id: 1000 + i, billing: customer.billing });
      logger.step(`[DRY RUN] Would create customer: ${customer.email}`);
    } else {
      try {
        const response = await client.post('customers', customer);
        customers.push({ id: response.data.id, billing: customer.billing });
        logger.step(`Created customer: ${customer.email} (ID: ${response.data.id})`);
        await delay(100);
      } catch (error: any) {
        // Email uniqueness might cause issues
        if (error.message.includes('already registered')) {
          logger.log(`Skipped duplicate customer: ${customer.email}`);
        } else {
          logger.error(`Failed to create customer ${customer.email}: ${error.message}`);
        }
      }
    }
  }

  logger.success(`Created ${customers.length} customers`);
  return customers;
}

async function createOrders(
  client: WCWriteClient,
  count: number,
  customers: { id: number; billing: any }[],
  productIds: number[],
  logger: ProgressLogger,
  dryRun: boolean
): Promise<number[]> {
  logger.log(`Creating ${count} orders...`);
  const orderIds: number[] = [];

  if (customers.length === 0 || productIds.length === 0) {
    logger.error('Cannot create orders without customers or products');
    return orderIds;
  }

  for (let i = 0; i < count; i++) {
    const customer = customers[i % customers.length];
    const order = generateOrder(customer.id, productIds, customer.billing);

    if (dryRun) {
      orderIds.push(1000 + i);
      logger.step(`[DRY RUN] Would create order for customer ${customer.id}: status=${order.status}`);
    } else {
      try {
        const response = await client.post('orders', order);
        orderIds.push(response.data.id);
        logger.step(`Created order #${response.data.id} (status: ${order.status})`);
        await delay(200);
      } catch (error: any) {
        logger.error(`Failed to create order: ${error.message}`);
      }
    }
  }

  logger.success(`Created ${orderIds.length} orders`);
  return orderIds;
}

// ============================================
// Utilities
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseArgs(): { scale: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let scale = 'medium';
  let dryRun = false;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--scale=')) {
      scale = arg.split('=')[1];
      if (!SCALES[scale]) {
        console.error(`Invalid scale: ${scale}. Use small, medium, or large`);
        process.exit(1);
      }
    }
  }

  return { scale, dryRun };
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  const { scale, dryRun } = parseArgs();
  const config = SCALES[scale];

  console.log('='.repeat(60));
  console.log('WooCommerce Test Data Generator');
  console.log('='.repeat(60));
  console.log(`Scale: ${scale}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Target: ${process.env.WC_URL}`);
  console.log('');
  console.log('Data to generate:');
  console.log(`  Categories: ${config.categories}`);
  console.log(`  Simple Products: ${config.simpleProducts}`);
  console.log(`  Variable Products: ${config.variableProducts}`);
  console.log(`  Virtual Products: ${config.virtualProducts}`);
  console.log(`  Downloadable Products: ${config.downloadableProducts}`);
  console.log(`  Customers: ${config.customers}`);
  console.log(`  Orders: ${config.orders}`);
  console.log('='.repeat(60));
  console.log('');

  const totalSteps =
    config.categories +
    config.simpleProducts +
    config.variableProducts +
    config.virtualProducts +
    config.downloadableProducts +
    config.customers +
    config.orders;

  const logger = new ProgressLogger(totalSteps);
  const client = new WCWriteClient();

  // Test connection
  logger.log('Testing WooCommerce connection...');
  try {
    await client.testConnection();
    logger.success('Connection successful!');
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }

  // Generate data in order
  const categoryIds = await createCategories(client, config.categories, logger, dryRun);

  const simpleProductIds = await createSimpleProducts(
    client, config.simpleProducts, categoryIds, logger, dryRun
  );

  const variableProductIds = await createVariableProducts(
    client, config.variableProducts, categoryIds, logger, dryRun
  );

  const virtualProductIds = await createVirtualProducts(
    client, config.virtualProducts, categoryIds, logger, dryRun
  );

  const downloadableProductIds = await createDownloadableProducts(
    client, config.downloadableProducts, categoryIds, logger, dryRun
  );

  const allProductIds = [
    ...simpleProductIds,
    ...variableProductIds,
    ...virtualProductIds,
    ...downloadableProductIds,
  ];

  const customers = await createCustomers(client, config.customers, logger, dryRun);

  const orderIds = await createOrders(
    client, config.orders, customers, allProductIds, logger, dryRun
  );

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Generation Complete!');
  console.log('='.repeat(60));
  console.log(`Categories created: ${categoryIds.length}`);
  console.log(`Products created: ${allProductIds.length}`);
  console.log(`  - Simple: ${simpleProductIds.length}`);
  console.log(`  - Variable: ${variableProductIds.length}`);
  console.log(`  - Virtual: ${virtualProductIds.length}`);
  console.log(`  - Downloadable: ${downloadableProductIds.length}`);
  console.log(`Customers created: ${customers.length}`);
  console.log(`Orders created: ${orderIds.length}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run "npm run assess" to verify the data');
  console.log('  2. Run "npm run dashboard" to view the assessment');
  console.log('='.repeat(60));
}

main().catch(console.error);
