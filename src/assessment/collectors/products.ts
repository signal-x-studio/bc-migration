import { WCClient } from '../wc-client.js';

// ============================================
// Types
// ============================================

export interface Issue {
  id: string;
  severity: 'blocker' | 'warning' | 'info';
  title: string;
  description: string;
  affectedItems?: number;
  recommendation?: string;
}

export interface ProductSample {
  id: number;
  name: string;
  type: string;
  sku?: string;
  variantCount?: number;
  issue?: string;
}

export interface ProductsAssessment {
  timestamp: Date;
  metrics: {
    total: number;
    byType: Record<string, number>;
    withVariants: number;
    totalVariants: number;
    withoutSKU: number;
    withoutImages: number;
    avgPrice: number;
    zeroPriceCount: number;
  };
  issues: {
    blockers: Issue[];
    warnings: Issue[];
    info: Issue[];
  };
  samples: {
    highVariantProducts: ProductSample[];
    problematicProducts: ProductSample[];
  };
}

// ============================================
// BigCommerce Limits
// ============================================

const BC_LIMITS = {
  MAX_VARIANTS_PER_PRODUCT: 600,
  MAX_NAME_LENGTH: 250,
  MAX_SKU_LENGTH: 250,
  VARIANT_WARNING_THRESHOLD: 100,
};

// ============================================
// Collector
// ============================================

export class ProductsCollector {
  constructor(private client: WCClient) {}

  async collect(): Promise<ProductsAssessment> {
    const issues: ProductsAssessment['issues'] = {
      blockers: [],
      warnings: [],
      info: [],
    };

    const samples: ProductsAssessment['samples'] = {
      highVariantProducts: [],
      problematicProducts: [],
    };

    // Initialize metrics
    const metrics: ProductsAssessment['metrics'] = {
      total: 0,
      byType: {},
      withVariants: 0,
      totalVariants: 0,
      withoutSKU: 0,
      withoutImages: 0,
      avgPrice: 0,
      zeroPriceCount: 0,
    };

    // Fetch all products (paginated)
    let page = 1;
    const perPage = 100;
    let allProducts: any[] = [];
    let totalPriceSum = 0;

    while (true) {
      const response = await this.client.getProducts({ page, per_page: perPage });
      const products = response.data;

      if (!products || products.length === 0) break;

      allProducts = allProducts.concat(products);
      page++;

      // Safety limit
      if (page > 100) break;
    }

    metrics.total = allProducts.length;

    // Track SKUs for duplicate detection
    const skuMap = new Map<string, number[]>();

    // Analyze each product
    for (const product of allProducts) {
      // Count by type
      const productType = product.type || 'simple';
      metrics.byType[productType] = (metrics.byType[productType] || 0) + 1;

      // Check for missing SKU
      if (!product.sku || product.sku.trim() === '') {
        metrics.withoutSKU++;
      } else {
        // Track SKU for duplicates
        const sku = product.sku.trim().toLowerCase();
        if (!skuMap.has(sku)) {
          skuMap.set(sku, []);
        }
        skuMap.get(sku)!.push(product.id);
      }

      // Check for missing images
      if (!product.images || product.images.length === 0) {
        metrics.withoutImages++;
      }

      // Price analysis
      const price = parseFloat(product.regular_price || product.price || '0');
      totalPriceSum += price;
      if (price === 0) {
        metrics.zeroPriceCount++;
      }

      // Check for variable products
      if (productType === 'variable') {
        metrics.withVariants++;

        // Get variation count
        const variationIds = product.variations || [];
        const variantCount = variationIds.length;
        metrics.totalVariants += variantCount;

        // Check against BC limits
        if (variantCount > BC_LIMITS.MAX_VARIANTS_PER_PRODUCT) {
          issues.blockers.push({
            id: `product-${product.id}-variant-limit`,
            severity: 'blocker',
            title: `Product exceeds 600 variant limit`,
            description: `"${product.name}" has ${variantCount} variants. BigCommerce maximum is ${BC_LIMITS.MAX_VARIANTS_PER_PRODUCT}.`,
            affectedItems: 1,
            recommendation: 'Split this product into multiple products or reduce variant options.',
          });
          samples.highVariantProducts.push({
            id: product.id,
            name: product.name,
            type: productType,
            sku: product.sku,
            variantCount,
            issue: 'Exceeds 600 variant limit',
          });
        } else if (variantCount > BC_LIMITS.VARIANT_WARNING_THRESHOLD) {
          issues.warnings.push({
            id: `product-${product.id}-high-variants`,
            severity: 'warning',
            title: `Product has high variant count`,
            description: `"${product.name}" has ${variantCount} variants. Consider if all variants are necessary.`,
            affectedItems: 1,
          });
          samples.highVariantProducts.push({
            id: product.id,
            name: product.name,
            type: productType,
            sku: product.sku,
            variantCount,
            issue: 'High variant count',
          });
        }
      }

      // Check for grouped products (no BC equivalent)
      if (productType === 'grouped') {
        issues.warnings.push({
          id: `product-${product.id}-grouped`,
          severity: 'warning',
          title: 'Grouped product type',
          description: `"${product.name}" is a grouped product. BigCommerce has no direct equivalent.`,
          affectedItems: 1,
          recommendation: 'Consider using product bundles or related products instead.',
        });
        samples.problematicProducts.push({
          id: product.id,
          name: product.name,
          type: productType,
          sku: product.sku,
          issue: 'Grouped product type',
        });
      }

      // Check for external products
      if (productType === 'external') {
        issues.warnings.push({
          id: `product-${product.id}-external`,
          severity: 'warning',
          title: 'External/affiliate product',
          description: `"${product.name}" is an external product. Requires custom URL field in BigCommerce.`,
          affectedItems: 1,
          recommendation: 'Use a custom field to store the external URL.',
        });
        samples.problematicProducts.push({
          id: product.id,
          name: product.name,
          type: productType,
          sku: product.sku,
          issue: 'External product type',
        });
      }

      // Check for long names
      if (product.name && product.name.length > BC_LIMITS.MAX_NAME_LENGTH) {
        issues.warnings.push({
          id: `product-${product.id}-long-name`,
          severity: 'warning',
          title: 'Product name exceeds BC limit',
          description: `"${product.name.substring(0, 50)}..." has ${product.name.length} characters. BC limit is ${BC_LIMITS.MAX_NAME_LENGTH}.`,
          affectedItems: 1,
          recommendation: 'Truncate product name to 250 characters.',
        });
        samples.problematicProducts.push({
          id: product.id,
          name: product.name.substring(0, 50) + '...',
          type: productType,
          sku: product.sku,
          issue: 'Name too long',
        });
      }

      // Check for long SKUs
      if (product.sku && product.sku.length > BC_LIMITS.MAX_SKU_LENGTH) {
        issues.warnings.push({
          id: `product-${product.id}-long-sku`,
          severity: 'warning',
          title: 'SKU exceeds BC limit',
          description: `SKU "${product.sku.substring(0, 30)}..." has ${product.sku.length} characters. BC limit is ${BC_LIMITS.MAX_SKU_LENGTH}.`,
          affectedItems: 1,
          recommendation: 'Truncate SKU to 250 characters.',
        });
      }
    }

    // Check for duplicate SKUs
    let duplicateSKUCount = 0;
    for (const [sku, productIds] of skuMap.entries()) {
      if (productIds.length > 1) {
        duplicateSKUCount += productIds.length;
        issues.blockers.push({
          id: `duplicate-sku-${sku}`,
          severity: 'blocker',
          title: 'Duplicate SKU detected',
          description: `SKU "${sku}" is used by ${productIds.length} products. BigCommerce requires unique SKUs.`,
          affectedItems: productIds.length,
          recommendation: 'Assign unique SKUs to each product.',
        });
      }
    }

    // Add info issues
    if (metrics.withoutSKU > 0) {
      issues.info.push({
        id: 'products-without-sku',
        severity: 'info',
        title: 'Products without SKU',
        description: `${metrics.withoutSKU} products have no SKU assigned. SKUs will be auto-generated during migration.`,
        affectedItems: metrics.withoutSKU,
      });
    }

    if (metrics.withoutImages > 0) {
      issues.info.push({
        id: 'products-without-images',
        severity: 'info',
        title: 'Products without images',
        description: `${metrics.withoutImages} products have no images. Consider adding images before migration.`,
        affectedItems: metrics.withoutImages,
      });
    }

    if (metrics.zeroPriceCount > 0) {
      issues.info.push({
        id: 'products-zero-price',
        severity: 'info',
        title: 'Products with zero price',
        description: `${metrics.zeroPriceCount} products have a zero or empty price. These will show "Contact for price" in BigCommerce.`,
        affectedItems: metrics.zeroPriceCount,
      });
    }

    // Calculate average price
    metrics.avgPrice = metrics.total > 0 ? totalPriceSum / metrics.total : 0;

    return {
      timestamp: new Date(),
      metrics,
      issues,
      samples,
    };
  }
}
