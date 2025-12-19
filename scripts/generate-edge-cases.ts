#!/usr/bin/env npx tsx
/**
 * WooCommerce Edge Case Data Generator
 * Creates specific edge cases to test migration assessment tool
 *
 * Edge Cases Created:
 * 1. Duplicate SKUs (3 products with same SKU) - BC doesn't allow, WC does
 * 2. Deep category hierarchy (7 levels) - BC limit is 5
 * 3. Grouped product type - No direct BC equivalent
 * 4. External/affiliate product type - Needs URL custom field
 * 5. Long name/SKU (300+ chars) - BC limit is 250
 * 6. Zero-price product - Test is_price_hidden mapping
 * 7. Invalid customer email - Test skip with warning
 * 8. Duplicate customer emails - Test merge/skip strategy
 *
 * Usage: npx tsx scripts/generate-edge-cases.ts [--dry-run]
 */

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

// ============================================
// WooCommerce API Client
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
// Utilities
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message: string) {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

function success(message: string) {
  console.log(`[SUCCESS] ${message}`);
}

function error(message: string) {
  console.error(`[ERROR] ${message}`);
}

function getPlaceholderImage(width: number, height: number): string {
  const colors = ['3498db', 'e74c3c', '2ecc71', '9b59b6', 'f39c12', '1abc9c'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://placehold.co/${width}x${height}/${color}/ffffff.png`;
}

// ============================================
// Edge Case 1: Duplicate SKUs
// ============================================

async function createDuplicateSKUProducts(client: WCWriteClient, dryRun: boolean): Promise<number[]> {
  log('Creating duplicate SKU products (BC blocker test)...');

  const duplicateSKU = 'DUPLICATE-SKU-001';
  const productIds: number[] = [];

  const products = [
    {
      name: 'Duplicate SKU Product A - Red Widget',
      type: 'simple',
      regular_price: '29.99',
      sku: duplicateSKU,
      description: 'This product has a duplicate SKU. In WooCommerce, duplicate SKUs are allowed. BigCommerce requires unique SKUs, so this should trigger a migration blocker.',
      short_description: 'First product with duplicate SKU',
      images: [{ src: getPlaceholderImage(640, 480) }],
    },
    {
      name: 'Duplicate SKU Product B - Blue Widget',
      type: 'simple',
      regular_price: '34.99',
      sku: duplicateSKU,
      description: 'Second product sharing the same SKU as Product A. Migration should flag this as a conflict.',
      short_description: 'Second product with duplicate SKU',
      images: [{ src: getPlaceholderImage(640, 480) }],
    },
    {
      name: 'Duplicate SKU Product C - Green Widget',
      type: 'simple',
      regular_price: '24.99',
      sku: duplicateSKU,
      description: 'Third product sharing the same SKU. Demonstrates multiple duplicates.',
      short_description: 'Third product with duplicate SKU',
      images: [{ src: getPlaceholderImage(640, 480) }],
    },
  ];

  for (const product of products) {
    if (dryRun) {
      log(`[DRY RUN] Would create: ${product.name} with SKU: ${product.sku}`);
      productIds.push(0);
    } else {
      try {
        const response = await client.post('products', product);
        productIds.push(response.data.id);
        log(`Created: ${product.name} (ID: ${response.data.id}, SKU: ${duplicateSKU})`);
        await delay(300);
      } catch (err: any) {
        error(`Failed to create ${product.name}: ${err.message}`);
      }
    }
  }

  success(`Created ${productIds.filter(id => id > 0).length} duplicate SKU products`);
  return productIds;
}

// ============================================
// Edge Case 2: Deep Category Hierarchy (7 levels)
// ============================================

async function createDeepCategoryHierarchy(client: WCWriteClient, dryRun: boolean): Promise<number[]> {
  log('Creating deep category hierarchy (7 levels, BC limit is 5)...');

  const categoryNames = [
    'Level 1 - Electronics',
    'Level 2 - Computers',
    'Level 3 - Laptops',
    'Level 4 - Gaming Laptops',
    'Level 5 - High Performance',
    'Level 6 - RTX Series',           // Exceeds BC limit
    'Level 7 - RTX 4090 Models',      // Exceeds BC limit
  ];

  const categoryIds: number[] = [];
  let parentId = 0;

  for (let i = 0; i < categoryNames.length; i++) {
    const catData: any = {
      name: categoryNames[i],
      description: `Category at depth ${i + 1}. ${i >= 5 ? 'EXCEEDS BigCommerce 5-level limit!' : ''}`,
    };

    if (parentId > 0) {
      catData.parent = parentId;
    }

    if (dryRun) {
      log(`[DRY RUN] Would create: ${catData.name} (parent: ${parentId || 'none'})`);
      parentId = 1000 + i;
      categoryIds.push(parentId);
    } else {
      try {
        const response = await client.post('products/categories', catData);
        parentId = response.data.id;
        categoryIds.push(parentId);
        log(`Created: ${catData.name} (ID: ${parentId}, depth: ${i + 1})`);
        await delay(200);
      } catch (err: any) {
        error(`Failed to create ${catData.name}: ${err.message}`);
        break;
      }
    }
  }

  // Create a product in the deepest category
  if (!dryRun && categoryIds.length === 7) {
    try {
      const deepProduct = {
        name: 'Deep Category Test Product - RTX 4090 Gaming Laptop',
        type: 'simple',
        regular_price: '3499.99',
        sku: 'DEEP-CAT-7-LEVEL',
        description: 'Product in 7-level deep category. BC limit is 5 levels, so this category hierarchy needs flattening.',
        categories: [{ id: categoryIds[6] }],
        images: [{ src: getPlaceholderImage(640, 480) }],
      };
      const response = await client.post('products', deepProduct);
      log(`Created product in deep category: ${deepProduct.name} (ID: ${response.data.id})`);
    } catch (err: any) {
      error(`Failed to create deep category product: ${err.message}`);
    }
  }

  success(`Created ${categoryIds.length}-level category hierarchy`);
  return categoryIds;
}

// ============================================
// Edge Case 3: Grouped Product
// ============================================

async function createGroupedProduct(client: WCWriteClient, dryRun: boolean): Promise<number> {
  log('Creating grouped product (no BC equivalent)...');

  // First create child simple products
  const childProducts = [
    {
      name: 'Grouped Child - Small Coffee Mug',
      type: 'simple',
      regular_price: '12.99',
      sku: 'GROUPED-CHILD-SM',
      description: 'Small coffee mug - part of a grouped product set',
      images: [{ src: getPlaceholderImage(400, 400) }],
    },
    {
      name: 'Grouped Child - Medium Coffee Mug',
      type: 'simple',
      regular_price: '14.99',
      sku: 'GROUPED-CHILD-MD',
      description: 'Medium coffee mug - part of a grouped product set',
      images: [{ src: getPlaceholderImage(400, 400) }],
    },
    {
      name: 'Grouped Child - Large Coffee Mug',
      type: 'simple',
      regular_price: '16.99',
      sku: 'GROUPED-CHILD-LG',
      description: 'Large coffee mug - part of a grouped product set',
      images: [{ src: getPlaceholderImage(400, 400) }],
    },
  ];

  const childIds: number[] = [];

  if (!dryRun) {
    for (const child of childProducts) {
      try {
        const response = await client.post('products', child);
        childIds.push(response.data.id);
        log(`Created child product: ${child.name} (ID: ${response.data.id})`);
        await delay(200);
      } catch (err: any) {
        error(`Failed to create child product ${child.name}: ${err.message}`);
      }
    }
  }

  // Create the grouped product
  const groupedProduct = {
    name: 'Coffee Mug Collection (Grouped Product)',
    type: 'grouped',
    description: 'A grouped product containing multiple coffee mugs. BigCommerce has no direct equivalent for grouped products - migration must flatten or use product bundles.',
    short_description: 'Collection of 3 coffee mug sizes',
    sku: 'GROUPED-PARENT',
    grouped_products: childIds,
    images: [{ src: getPlaceholderImage(640, 480) }],
  };

  if (dryRun) {
    log(`[DRY RUN] Would create grouped product: ${groupedProduct.name}`);
    return 0;
  }

  try {
    const response = await client.post('products', groupedProduct);
    success(`Created grouped product: ${groupedProduct.name} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (err: any) {
    error(`Failed to create grouped product: ${err.message}`);
    return 0;
  }
}

// ============================================
// Edge Case 4: External/Affiliate Product
// ============================================

async function createExternalProduct(client: WCWriteClient, dryRun: boolean): Promise<number> {
  log('Creating external/affiliate product (needs URL custom field in BC)...');

  const externalProduct = {
    name: 'Amazon Affiliate - Premium Headphones',
    type: 'external',
    regular_price: '299.99',
    sku: 'EXTERNAL-AFFILIATE-001',
    external_url: 'https://www.amazon.com/dp/B09XS7JWHH',
    button_text: 'Buy on Amazon',
    description: 'External/affiliate product that links to Amazon. BigCommerce needs custom URL field to handle external product links.',
    short_description: 'Premium wireless headphones - Buy on Amazon',
    images: [{ src: getPlaceholderImage(640, 480) }],
  };

  if (dryRun) {
    log(`[DRY RUN] Would create external product: ${externalProduct.name}`);
    return 0;
  }

  try {
    const response = await client.post('products', externalProduct);
    success(`Created external product: ${externalProduct.name} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (err: any) {
    error(`Failed to create external product: ${err.message}`);
    return 0;
  }
}

// ============================================
// Edge Case 5: Long Name/SKU (300+ chars)
// ============================================

async function createLongNameSKUProduct(client: WCWriteClient, dryRun: boolean): Promise<number> {
  log('Creating product with 300+ char name and SKU (BC limit is 250)...');

  // Generate 300+ character name
  const longName = 'Ultra Premium Deluxe Professional Grade Commercial Industrial Heavy Duty Extra Large Extended Warranty Certified Authentic Limited Edition Collectors Series Anniversary Special Multi-Function All-In-One Swiss Army Style Titanium Reinforced Carbon Fiber Composite Advanced Technology Smart Connected IoT Enabled';

  // Generate 300+ character SKU
  const longSKU = 'SKU-ULTRA-PREMIUM-DELUXE-PROFESSIONAL-GRADE-COMMERCIAL-INDUSTRIAL-HEAVY-DUTY-EXTRA-LARGE-EXTENDED-WARRANTY-CERTIFIED-AUTHENTIC-LIMITED-EDITION-COLLECTORS-SERIES-ANNIVERSARY-SPECIAL-MULTI-FUNCTION-ALL-IN-ONE-SWISS-ARMY-TITANIUM-CARBON-FIBER-ADVANCED-TECH-SMART-IOT-2024-V1';

  const product = {
    name: longName,
    type: 'simple',
    regular_price: '999.99',
    sku: longSKU,
    description: `Product with ${longName.length}-character name and ${longSKU.length}-character SKU. BigCommerce limit is 250 characters for both. Migration should truncate or warn.`,
    short_description: 'Test product for BC character limits',
    images: [{ src: getPlaceholderImage(640, 480) }],
  };

  log(`Name length: ${longName.length} characters`);
  log(`SKU length: ${longSKU.length} characters`);

  if (dryRun) {
    log(`[DRY RUN] Would create: Long name/SKU product`);
    return 0;
  }

  try {
    const response = await client.post('products', product);
    success(`Created long name/SKU product (ID: ${response.data.id})`);
    return response.data.id;
  } catch (err: any) {
    error(`Failed to create long name/SKU product: ${err.message}`);
    return 0;
  }
}

// ============================================
// Edge Case 6: Zero-Price Product
// ============================================

async function createZeroPriceProduct(client: WCWriteClient, dryRun: boolean): Promise<number> {
  log('Creating zero-price product (test is_price_hidden mapping)...');

  const product = {
    name: 'Free Sample - Contact for Pricing',
    type: 'simple',
    regular_price: '0',
    sku: 'ZERO-PRICE-001',
    description: 'Product with zero price. In BigCommerce, this should map to is_price_hidden=true or price_hidden_label="Contact for pricing".',
    short_description: 'Free sample or call for quote product',
    images: [{ src: getPlaceholderImage(640, 480) }],
    catalog_visibility: 'visible',
  };

  if (dryRun) {
    log(`[DRY RUN] Would create: ${product.name}`);
    return 0;
  }

  try {
    const response = await client.post('products', product);
    success(`Created zero-price product: ${product.name} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (err: any) {
    error(`Failed to create zero-price product: ${err.message}`);
    return 0;
  }
}

// ============================================
// Edge Case 7: Invalid Customer Email
// ============================================

async function createInvalidEmailCustomer(client: WCWriteClient, dryRun: boolean): Promise<number> {
  log('Creating customer with invalid email format...');

  // WooCommerce may accept malformed emails in some cases
  // We'll try various invalid formats
  const invalidEmails = [
    'invalid-email-no-at-symbol.com',
    'spaces in@email.com',
    'missing-domain@',
    '@missing-local-part.com',
  ];

  let createdId = 0;

  for (const email of invalidEmails) {
    const customer = {
      email: email,
      first_name: 'Invalid',
      last_name: 'Email Test',
      username: `invalid_email_${Date.now()}`,
    };

    if (dryRun) {
      log(`[DRY RUN] Would attempt to create customer with email: ${email}`);
      continue;
    }

    try {
      const response = await client.post('customers', customer);
      createdId = response.data.id;
      success(`Created customer with invalid email: ${email} (ID: ${response.data.id})`);
      break;
    } catch (err: any) {
      log(`Expected rejection for email "${email}": ${err.message}`);
    }
    await delay(200);
  }

  if (createdId === 0 && !dryRun) {
    log('WooCommerce rejected all invalid emails (expected behavior)');
  }

  return createdId;
}

// ============================================
// Edge Case 8: Duplicate Customer Emails
// ============================================

async function createDuplicateEmailCustomers(client: WCWriteClient, dryRun: boolean): Promise<number[]> {
  log('Creating customers with duplicate emails (test merge/skip strategy)...');

  const duplicateEmail = 'duplicate-test@example.com';
  const customerIds: number[] = [];

  const customers = [
    {
      email: duplicateEmail,
      first_name: 'John',
      last_name: 'Duplicate',
      username: `john_dup_${Date.now()}`,
      billing: {
        first_name: 'John',
        last_name: 'Duplicate',
        address_1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US',
      },
    },
    {
      email: duplicateEmail,
      first_name: 'Jane',
      last_name: 'Duplicate',
      username: `jane_dup_${Date.now()}`,
      billing: {
        first_name: 'Jane',
        last_name: 'Duplicate',
        address_1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postcode: '90001',
        country: 'US',
      },
    },
  ];

  for (const customer of customers) {
    if (dryRun) {
      log(`[DRY RUN] Would create: ${customer.first_name} ${customer.last_name} (${customer.email})`);
      continue;
    }

    try {
      const response = await client.post('customers', customer);
      customerIds.push(response.data.id);
      success(`Created customer: ${customer.first_name} ${customer.last_name} (ID: ${response.data.id})`);
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        log(`Expected: Duplicate email rejected for ${customer.first_name}`);
      } else {
        error(`Failed to create ${customer.first_name}: ${err.message}`);
      }
    }
    await delay(200);
  }

  return customerIds;
}

// ============================================
// Edge Case 9: Serialized PHP Meta (simulate)
// ============================================

async function createSerializedMetaProduct(client: WCWriteClient, dryRun: boolean): Promise<number> {
  log('Creating product with complex meta data (serialized-like structure)...');

  // WooCommerce stores some meta as serialized PHP - we'll create a product with complex meta
  const product = {
    name: 'Complex Meta Product - Custom Fields Test',
    type: 'simple',
    regular_price: '49.99',
    sku: 'COMPLEX-META-001',
    description: 'Product with complex meta_data that simulates serialized PHP data structures common in WooCommerce plugins.',
    images: [{ src: getPlaceholderImage(640, 480) }],
    meta_data: [
      {
        key: '_custom_array_data',
        value: JSON.stringify({
          nested: { level1: { level2: { level3: 'deep value' } } },
          array: [1, 2, 3, 4, 5],
          boolean: true,
          null_val: null,
        }),
      },
      {
        key: '_serialized_like_data',
        value: 'a:3:{s:4:"name";s:4:"Test";s:5:"value";i:123;s:5:"array";a:2:{i:0;s:1:"a";i:1;s:1:"b";}}',
      },
      {
        key: '_plugin_settings',
        value: JSON.stringify({
          enabled: true,
          options: ['opt1', 'opt2'],
          config: { key: 'value', number: 42 },
        }),
      },
    ],
  };

  if (dryRun) {
    log(`[DRY RUN] Would create: ${product.name}`);
    return 0;
  }

  try {
    const response = await client.post('products', product);
    success(`Created complex meta product: ${product.name} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (err: any) {
    error(`Failed to create complex meta product: ${err.message}`);
    return 0;
  }
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('WooCommerce Edge Case Data Generator');
  console.log('='.repeat(60));
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Target: ${process.env.WC_URL}`);
  console.log('');
  console.log('Edge cases to create:');
  console.log('  1. Duplicate SKUs (BC blocker)');
  console.log('  2. 7-level category hierarchy (BC limit: 5)');
  console.log('  3. Grouped product (no BC equivalent)');
  console.log('  4. External/affiliate product');
  console.log('  5. 300+ char name/SKU (BC limit: 250)');
  console.log('  6. Zero-price product');
  console.log('  7. Invalid customer email');
  console.log('  8. Duplicate customer emails');
  console.log('  9. Complex/serialized meta data');
  console.log('='.repeat(60));
  console.log('');

  const client = new WCWriteClient();

  // Test connection
  log('Testing WooCommerce connection...');
  try {
    await client.testConnection();
    success('Connection successful!');
  } catch (err: any) {
    error(err.message);
    process.exit(1);
  }

  console.log('');

  // Create all edge cases
  const results: Record<string, any> = {};

  results.duplicateSKUs = await createDuplicateSKUProducts(client, dryRun);
  console.log('');

  results.deepCategories = await createDeepCategoryHierarchy(client, dryRun);
  console.log('');

  results.groupedProduct = await createGroupedProduct(client, dryRun);
  console.log('');

  results.externalProduct = await createExternalProduct(client, dryRun);
  console.log('');

  results.longNameSKU = await createLongNameSKUProduct(client, dryRun);
  console.log('');

  results.zeroPriceProduct = await createZeroPriceProduct(client, dryRun);
  console.log('');

  results.invalidEmailCustomer = await createInvalidEmailCustomer(client, dryRun);
  console.log('');

  results.duplicateEmailCustomers = await createDuplicateEmailCustomers(client, dryRun);
  console.log('');

  results.serializedMetaProduct = await createSerializedMetaProduct(client, dryRun);
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('Edge Case Generation Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log(`  Duplicate SKU products: ${Array.isArray(results.duplicateSKUs) ? results.duplicateSKUs.filter((id: number) => id > 0).length : 0}`);
  console.log(`  Deep category levels: ${Array.isArray(results.deepCategories) ? results.deepCategories.length : 0}`);
  console.log(`  Grouped product: ${results.groupedProduct > 0 ? 'Created' : 'Skipped'}`);
  console.log(`  External product: ${results.externalProduct > 0 ? 'Created' : 'Skipped'}`);
  console.log(`  Long name/SKU product: ${results.longNameSKU > 0 ? 'Created' : 'Skipped'}`);
  console.log(`  Zero-price product: ${results.zeroPriceProduct > 0 ? 'Created' : 'Skipped'}`);
  console.log(`  Invalid email customer: ${results.invalidEmailCustomer > 0 ? 'Created' : 'Rejected (expected)'}`);
  console.log(`  Duplicate email customers: ${Array.isArray(results.duplicateEmailCustomers) ? results.duplicateEmailCustomers.length : 0}`);
  console.log(`  Complex meta product: ${results.serializedMetaProduct > 0 ? 'Created' : 'Skipped'}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run "npm run assess" to verify edge case detection');
  console.log('  2. Check assessment output for warnings/blockers');
  console.log('='.repeat(60));
}

main().catch(console.error);
