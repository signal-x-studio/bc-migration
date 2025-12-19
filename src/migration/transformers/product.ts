/**
 * Product Transformer
 * Transforms WooCommerce products into BigCommerce product format
 * Handles both simple and variable products
 */

import type { WCProduct, WCVariation, WCAttribute } from '../../types/wc.js';
import type { BCProduct, BCImage, BCProductType, BCInventoryTracking } from '../../types/bc.js';
import { transformVariations, isVariableProduct } from './variant.js';

/**
 * Result of product transformation
 */
export interface ProductTransformResult {
  product: Omit<BCProduct, 'id'>;
  warnings: string[];
  errors: string[];
}

/**
 * Category map type - maps WC category names to BC category IDs
 */
export type CategoryMap = Map<string, number>;

/**
 * Transform WC images to BC image format
 */
function transformImages(wcImages: WCProduct['images']): BCImage[] {
  return wcImages.map((img, index) => ({
    image_url: img.src,
    is_thumbnail: index === 0,
    sort_order: img.position,
    description: img.alt || img.name,
  }));
}

/**
 * Determine BC product type from WC product
 * BC only has physical/digital, so we map WC's virtual to digital
 */
function determineProductType(wcProduct: WCProduct): BCProductType {
  // Virtual products (non-shippable) become digital in BC
  if (wcProduct.virtual) {
    return 'digital';
  }
  // Downloadable-only products are also digital
  if (wcProduct.downloadable && !wcProduct.shipping_required) {
    return 'digital';
  }
  return 'physical';
}

/**
 * Determine inventory tracking mode
 */
function determineInventoryTracking(
  wcProduct: WCProduct,
  hasVariants: boolean
): BCInventoryTracking {
  if (!wcProduct.manage_stock) {
    return 'none';
  }
  // If product has variants, track at variant level
  if (hasVariants) {
    return 'variant';
  }
  return 'product';
}

/**
 * Map WC categories to BC category IDs using the provided map
 */
function mapCategories(
  wcCategories: WCProduct['categories'],
  categoryMap: CategoryMap
): number[] {
  const bcCategoryIds: number[] = [];

  for (const cat of wcCategories) {
    const bcId = categoryMap.get(cat.name);
    if (bcId !== undefined) {
      bcCategoryIds.push(bcId);
    }
  }

  return bcCategoryIds;
}

/**
 * Generate a unique SKU if missing
 */
function ensureSku(wcProduct: WCProduct): string {
  if (wcProduct.sku && wcProduct.sku.trim()) {
    return wcProduct.sku.trim();
  }
  // Generate from product ID
  return `wc-${wcProduct.id}`;
}

/**
 * Transform a simple (non-variable) WC product to BC format
 */
export function transformSimpleProduct(
  wcProduct: WCProduct,
  categoryMap: CategoryMap
): ProductTransformResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate required fields
  if (!wcProduct.name || !wcProduct.name.trim()) {
    errors.push('Product name is required');
  }

  const productType = determineProductType(wcProduct);
  const sku = ensureSku(wcProduct);
  const categories = mapCategories(wcProduct.categories, categoryMap);

  // Warn if no categories mapped
  if (wcProduct.categories.length > 0 && categories.length === 0) {
    warnings.push(
      `Product "${wcProduct.name}" has ${wcProduct.categories.length} categories ` +
      `but none mapped to BigCommerce`
    );
  }

  // Parse numeric values with defaults
  const price = parseFloat(wcProduct.price) || 0;
  const weight = parseFloat(wcProduct.weight) || 0;
  const salePrice = wcProduct.sale_price ? parseFloat(wcProduct.sale_price) : undefined;
  const regularPrice = wcProduct.regular_price ? parseFloat(wcProduct.regular_price) : undefined;

  // BC requires weight for physical products
  if (productType === 'physical' && weight === 0) {
    warnings.push(
      `Physical product "${wcProduct.name}" has no weight set. Using default of 1.`
    );
  }

  const product: Omit<BCProduct, 'id'> = {
    name: wcProduct.name,
    type: productType,
    sku,
    description: wcProduct.description || wcProduct.short_description || '',
    weight: productType === 'physical' ? (weight || 1) : 0,
    width: wcProduct.dimensions?.width ? parseFloat(wcProduct.dimensions.width) : undefined,
    height: wcProduct.dimensions?.height ? parseFloat(wcProduct.dimensions.height) : undefined,
    depth: wcProduct.dimensions?.length ? parseFloat(wcProduct.dimensions.length) : undefined,
    price,
    retail_price: regularPrice,
    sale_price: salePrice,
    categories,
    inventory_tracking: determineInventoryTracking(wcProduct, false),
    inventory_level: wcProduct.stock_quantity ?? 0,
    is_visible: wcProduct.status === 'publish' && wcProduct.catalog_visibility !== 'hidden',
    is_featured: wcProduct.featured,
    images: transformImages(wcProduct.images),
    search_keywords: wcProduct.tags.map(t => t.name).join(','),
    availability: wcProduct.stock_status === 'outofstock' ? 'disabled' : 'available',
    meta_description: wcProduct.short_description?.substring(0, 255),
  };

  // Handle related products if available
  if (wcProduct.upsell_ids.length > 0 || wcProduct.cross_sell_ids.length > 0) {
    warnings.push(
      `Product "${wcProduct.name}" has upsell/cross-sell IDs that need manual mapping`
    );
  }

  return { product, warnings, errors };
}

/**
 * Transform a variable WC product (with variations) to BC format
 * This creates a product with options and variants
 */
export function transformVariableProduct(
  wcProduct: WCProduct,
  wcVariations: WCVariation[],
  categoryMap: CategoryMap
): ProductTransformResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Start with base product transform
  const baseResult = transformSimpleProduct(wcProduct, categoryMap);
  warnings.push(...baseResult.warnings);
  errors.push(...baseResult.errors);

  const product = baseResult.product;

  // Get variation attributes from parent product
  const variationAttributes = wcProduct.attributes.filter(attr => attr.variation);

  if (variationAttributes.length === 0) {
    warnings.push(
      `Variable product "${wcProduct.name}" has no variation attributes defined`
    );
    return { product, warnings, errors };
  }

  if (wcVariations.length === 0) {
    warnings.push(
      `Variable product "${wcProduct.name}" has no variations to transform`
    );
    return { product, warnings, errors };
  }

  // Transform variations to BC options + variants
  const variantResult = transformVariations(
    wcVariations,
    variationAttributes,
    product.sku
  );

  warnings.push(...variantResult.warnings);

  // Set inventory tracking to variant level
  product.inventory_tracking = 'variant';

  // Attach options and variants to product
  product.options = variantResult.options;
  product.variants = variantResult.variants;

  // For variable products, the base price should reflect the lowest variant price
  const variantPrices = variantResult.variants
    .map(v => v.price)
    .filter((p): p is number => p !== null && p !== undefined);

  if (variantPrices.length > 0) {
    product.price = Math.min(...variantPrices);
  }

  return { product, warnings, errors };
}

/**
 * Main transformer function - routes to appropriate handler based on product type
 */
export function transformProduct(
  wcProduct: WCProduct,
  wcVariations: WCVariation[] | null,
  categoryMap: CategoryMap
): ProductTransformResult {
  if (isVariableProduct(wcProduct.type) && wcVariations && wcVariations.length > 0) {
    return transformVariableProduct(wcProduct, wcVariations, categoryMap);
  }

  return transformSimpleProduct(wcProduct, categoryMap);
}

/**
 * Transform multiple products in batch
 * Returns results with products grouped by success/failure
 */
export interface BatchTransformResult {
  successful: ProductTransformResult[];
  failed: { wcProduct: WCProduct; errors: string[] }[];
  totalWarnings: string[];
}

export function transformProductBatch(
  wcProducts: WCProduct[],
  variationsMap: Map<number, WCVariation[]>,
  categoryMap: CategoryMap
): BatchTransformResult {
  const successful: ProductTransformResult[] = [];
  const failed: { wcProduct: WCProduct; errors: string[] }[] = [];
  const totalWarnings: string[] = [];

  for (const wcProduct of wcProducts) {
    try {
      const variations = variationsMap.get(wcProduct.id) || null;
      const result = transformProduct(wcProduct, variations, categoryMap);

      totalWarnings.push(...result.warnings);

      if (result.errors.length > 0) {
        failed.push({ wcProduct, errors: result.errors });
      } else {
        successful.push(result);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      failed.push({
        wcProduct,
        errors: [`Unexpected error during transformation: ${message}`],
      });
    }
  }

  return { successful, failed, totalWarnings };
}
