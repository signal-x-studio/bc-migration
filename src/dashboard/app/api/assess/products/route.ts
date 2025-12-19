import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// BigCommerce limits
const BC_LIMITS = {
  MAX_VARIANTS_PER_PRODUCT: 600,
  MAX_NAME_LENGTH: 250,
  MAX_SKU_LENGTH: 250,
  VARIANT_WARNING_THRESHOLD: 100,
};

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Fetch all products (paginated)
    let page = 1;
    const perPage = 100;
    let allProducts: any[] = [];

    while (true) {
      const response = await api.get('products', { page, per_page: perPage });
      const products = response.data;
      if (!products || products.length === 0) break;
      allProducts = allProducts.concat(products);
      page++;
      if (page > 50) break; // Safety limit (5000 products)
    }

    // Initialize metrics
    const metrics = {
      total: allProducts.length,
      byType: {} as Record<string, number>,
      withVariants: 0,
      totalVariants: 0,
      withoutSKU: 0,
      withoutImages: 0,
      avgPrice: 0,
      zeroPriceCount: 0,
    };

    const issues = {
      blockers: [] as any[],
      warnings: [] as any[],
      info: [] as any[],
    };

    const samples = {
      highVariantProducts: [] as any[],
      problematicProducts: [] as any[],
    };

    // Track SKUs for duplicate detection
    const skuMap = new Map<string, number[]>();
    let totalPriceSum = 0;

    // Analyze each product
    for (const product of allProducts) {
      const productType = product.type || 'simple';
      metrics.byType[productType] = (metrics.byType[productType] || 0) + 1;

      // Missing SKU
      if (!product.sku || product.sku.trim() === '') {
        metrics.withoutSKU++;
      } else {
        const sku = product.sku.trim().toLowerCase();
        if (!skuMap.has(sku)) skuMap.set(sku, []);
        skuMap.get(sku)!.push(product.id);
      }

      // Missing images
      if (!product.images || product.images.length === 0) {
        metrics.withoutImages++;
      }

      // Price
      const price = parseFloat(product.regular_price || product.price || '0');
      totalPriceSum += price;
      if (price === 0) metrics.zeroPriceCount++;

      // Variable products
      if (productType === 'variable') {
        metrics.withVariants++;
        const variantCount = product.variations?.length || 0;
        metrics.totalVariants += variantCount;

        if (variantCount > BC_LIMITS.MAX_VARIANTS_PER_PRODUCT) {
          issues.blockers.push({
            id: `product-${product.id}-variant-limit`,
            severity: 'blocker',
            title: `Product exceeds 600 variant limit`,
            description: `"${product.name}" has ${variantCount} variants. BC max is ${BC_LIMITS.MAX_VARIANTS_PER_PRODUCT}.`,
            affectedItems: 1,
            recommendation: 'Split into multiple products or reduce variants.',
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
            description: `"${product.name}" has ${variantCount} variants.`,
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

      // Grouped products
      if (productType === 'grouped') {
        issues.warnings.push({
          id: `product-${product.id}-grouped`,
          severity: 'warning',
          title: 'Grouped product type',
          description: `"${product.name}" is grouped. BC has no direct equivalent.`,
          affectedItems: 1,
          recommendation: 'Consider using product bundles instead.',
        });
        samples.problematicProducts.push({
          id: product.id, name: product.name, type: productType, sku: product.sku, issue: 'Grouped type',
        });
      }

      // External products
      if (productType === 'external') {
        issues.warnings.push({
          id: `product-${product.id}-external`,
          severity: 'warning',
          title: 'External/affiliate product',
          description: `"${product.name}" is external. Requires custom URL field in BC.`,
          affectedItems: 1,
          recommendation: 'Use a custom field for external URL.',
        });
        samples.problematicProducts.push({
          id: product.id, name: product.name, type: productType, sku: product.sku, issue: 'External type',
        });
      }

      // Long names
      if (product.name?.length > BC_LIMITS.MAX_NAME_LENGTH) {
        issues.warnings.push({
          id: `product-${product.id}-long-name`,
          severity: 'warning',
          title: 'Product name too long',
          description: `"${product.name.substring(0, 50)}..." has ${product.name.length} chars. BC limit is ${BC_LIMITS.MAX_NAME_LENGTH}.`,
          affectedItems: 1,
          recommendation: 'Truncate to 250 characters.',
        });
        samples.problematicProducts.push({
          id: product.id, name: product.name.substring(0, 50) + '...', type: productType, sku: product.sku, issue: 'Name too long',
        });
      }

      // Long SKUs
      if (product.sku?.length > BC_LIMITS.MAX_SKU_LENGTH) {
        issues.warnings.push({
          id: `product-${product.id}-long-sku`,
          severity: 'warning',
          title: 'SKU too long',
          description: `SKU "${product.sku.substring(0, 30)}..." has ${product.sku.length} chars. BC limit is ${BC_LIMITS.MAX_SKU_LENGTH}.`,
          affectedItems: 1,
        });
      }
    }

    // Duplicate SKUs
    for (const [sku, productIds] of skuMap.entries()) {
      if (productIds.length > 1) {
        issues.blockers.push({
          id: `duplicate-sku-${sku}`,
          severity: 'blocker',
          title: 'Duplicate SKU',
          description: `SKU "${sku}" used by ${productIds.length} products. BC requires unique SKUs.`,
          affectedItems: productIds.length,
          recommendation: 'Assign unique SKUs.',
        });
      }
    }

    // Info issues
    if (metrics.withoutSKU > 0) {
      issues.info.push({
        id: 'products-without-sku',
        severity: 'info',
        title: 'Products without SKU',
        description: `${metrics.withoutSKU} products have no SKU. Will be auto-generated.`,
        affectedItems: metrics.withoutSKU,
      });
    }

    if (metrics.withoutImages > 0) {
      issues.info.push({
        id: 'products-without-images',
        severity: 'info',
        title: 'Products without images',
        description: `${metrics.withoutImages} products have no images.`,
        affectedItems: metrics.withoutImages,
      });
    }

    if (metrics.zeroPriceCount > 0) {
      issues.info.push({
        id: 'products-zero-price',
        severity: 'info',
        title: 'Zero price products',
        description: `${metrics.zeroPriceCount} products have zero price.`,
        affectedItems: metrics.zeroPriceCount,
      });
    }

    metrics.avgPrice = metrics.total > 0 ? totalPriceSum / metrics.total : 0;

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics,
        issues,
        samples,
      },
    });
  } catch (error: any) {
    console.error('Products assessment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Assessment failed' },
      { status: 500 }
    );
  }
}
