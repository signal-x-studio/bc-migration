import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * BigCommerce Product CSV Export
 * Transforms WooCommerce products to BC-ready CSV format
 *
 * BC CSV Format Reference:
 * - Product Name (required)
 * - Product Type (physical/digital)
 * - Category (semicolon separated, slash for subcategories)
 * - SKU
 * - Price (no currency symbol)
 * - Sale Price
 * - Description
 * - Product Image File - 1, 2, 3...
 * - Brand
 * - Inventory Level
 * - Weight
 */

interface WCProduct {
  id: number;
  name: string;
  type: string;
  status: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; alt: string }>;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  stock_quantity: number | null;
  manage_stock: boolean;
  stock_status: string;
  attributes: Array<{ id: number; name: string; options: string[] }>;
  variations: number[];
  meta_data: Array<{ key: string; value: unknown }>;
}

interface WCVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  attributes: Array<{ id: number; name: string; option: string }>;
  image: { src: string } | null;
}

// BC CSV columns for product import
const BC_PRODUCT_COLUMNS = [
  'Product ID', // Leave blank for new products
  'Product Name',
  'Product Type',
  'Product SKU',
  'Brand Name',
  'Product Description',
  'Price',
  'Sale Price',
  'Retail Price',
  'Cost Price',
  'Category',
  'Product Weight',
  'Product Width',
  'Product Height',
  'Product Depth',
  'Allow Purchases?',
  'Product Visible?',
  'Track Inventory',
  'Current Stock Level',
  'Low Stock Level',
  'Product Image File - 1',
  'Product Image File - 2',
  'Product Image File - 3',
  'Product Image File - 4',
  'Product Image File - 5',
  'Search Keywords',
  'Meta Keywords',
  'Meta Description',
  'Product Condition',
  'Product URL',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, consumerKey, consumerSecret, includeVariations = true } = body;

    if (!url || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const wcClient = await createWCClient(url, consumerKey, consumerSecret);

    // Fetch all products
    const products: WCProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await wcClient.get('products', {
        per_page: 100,
        page,
        status: 'publish', // Only published products
      });

      if (response.data.length === 0) {
        hasMore = false;
      } else {
        products.push(...response.data);
        page++;
      }

      // Safety limit
      if (page > 100) break;
    }

    // Build category hierarchy map
    const categoryResponse = await wcClient.get('products/categories', { per_page: 100 });
    const categories = categoryResponse.data;
    const categoryMap = buildCategoryMap(categories);

    // Transform to BC CSV rows
    const csvRows: string[][] = [];
    csvRows.push(BC_PRODUCT_COLUMNS); // Header row

    for (const product of products) {
      // Skip variable products if we're including variations (they become separate rows)
      if (product.type === 'variable' && includeVariations && product.variations.length > 0) {
        // Fetch variations for this product
        try {
          const variationsResponse = await wcClient.get(`products/${product.id}/variations`, {
            per_page: 100,
          });
          const variations: WCVariation[] = variationsResponse.data;

          for (const variation of variations) {
            const row = transformVariationToBC(product, variation, categoryMap);
            csvRows.push(row);
          }
        } catch (e) {
          // If variations fetch fails, add parent product
          const row = transformProductToBC(product, categoryMap);
          csvRows.push(row);
        }
      } else {
        // Simple or other product types
        const row = transformProductToBC(product, categoryMap);
        csvRows.push(row);
      }
    }

    // Convert to CSV string
    const csv = csvRows.map(row =>
      row.map(cell => escapeCSVCell(cell)).join(',')
    ).join('\n');

    return NextResponse.json({
      success: true,
      data: {
        csv,
        rowCount: csvRows.length - 1, // Exclude header
        productCount: products.length,
        format: 'bigcommerce-product-import',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}

function buildCategoryMap(categories: Array<{ id: number; name: string; parent: number }>): Map<number, string> {
  const map = new Map<number, string>();
  const categoryById = new Map(categories.map(c => [c.id, c]));

  function getFullPath(categoryId: number): string {
    const category = categoryById.get(categoryId);
    if (!category) return '';

    if (category.parent === 0) {
      return category.name;
    }

    const parentPath = getFullPath(category.parent);
    return parentPath ? `${parentPath}/${category.name}` : category.name;
  }

  for (const category of categories) {
    map.set(category.id, getFullPath(category.id));
  }

  return map;
}

function transformProductToBC(product: WCProduct, categoryMap: Map<number, string>): string[] {
  // Build category string (semicolon separated for multiple categories)
  const categoryPaths = product.categories
    .map(c => categoryMap.get(c.id) || c.name)
    .join(';');

  // Get image URLs
  const imageUrls = product.images.slice(0, 5).map(img => img.src);

  return [
    '', // Product ID - leave blank for new products
    product.name,
    product.type === 'virtual' ? 'D' : 'P', // P=Physical, D=Digital
    product.sku || `WC-${product.id}`,
    '', // Brand Name
    stripHtml(product.description || product.short_description || ''),
    product.regular_price || product.price || '0',
    product.sale_price || '',
    '', // Retail Price
    '', // Cost Price
    categoryPaths,
    product.weight || '',
    product.dimensions?.width || '',
    product.dimensions?.height || '',
    product.dimensions?.length || '',
    'Y', // Allow Purchases
    'Y', // Product Visible
    product.manage_stock ? 'Y' : 'N',
    product.stock_quantity?.toString() || '',
    '5', // Low Stock Level default
    imageUrls[0] || '',
    imageUrls[1] || '',
    imageUrls[2] || '',
    imageUrls[3] || '',
    imageUrls[4] || '',
    '', // Search Keywords
    '', // Meta Keywords
    stripHtml(product.short_description || '').substring(0, 255),
    'New', // Product Condition
    '', // Product URL - BC will generate
  ];
}

function transformVariationToBC(
  parent: WCProduct,
  variation: WCVariation,
  categoryMap: Map<number, string>
): string[] {
  // Build variation name from attributes
  const attributeString = variation.attributes
    .map(a => a.option)
    .join(' - ');
  const fullName = `${parent.name} - ${attributeString}`;

  // Build category string
  const categoryPaths = parent.categories
    .map(c => categoryMap.get(c.id) || c.name)
    .join(';');

  // Get image (variation image or first parent image)
  const imageUrl = variation.image?.src || parent.images[0]?.src || '';

  return [
    '', // Product ID
    fullName,
    'P', // Physical
    variation.sku || `WC-${parent.id}-${variation.id}`,
    '', // Brand
    stripHtml(parent.description || parent.short_description || ''),
    variation.regular_price || variation.price || '0',
    variation.sale_price || '',
    '', // Retail Price
    '', // Cost Price
    categoryPaths,
    variation.weight || parent.weight || '',
    variation.dimensions?.width || parent.dimensions?.width || '',
    variation.dimensions?.height || parent.dimensions?.height || '',
    variation.dimensions?.length || parent.dimensions?.length || '',
    'Y', // Allow Purchases
    'Y', // Product Visible
    variation.stock_quantity !== null ? 'Y' : 'N',
    variation.stock_quantity?.toString() || '',
    '5', // Low Stock Level
    imageUrl,
    '', '', '', '', // Additional images
    '', // Search Keywords
    '', // Meta Keywords
    '',
    'New',
    '',
  ];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeCSVCell(cell: string): string {
  if (!cell) return '';

  // If cell contains comma, newline, or quote, wrap in quotes and escape quotes
  if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
}
