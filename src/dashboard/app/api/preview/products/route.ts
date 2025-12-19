import { NextRequest, NextResponse } from 'next/server';
import type { BCProductPreview, PreviewValidation, PreviewValidationIssue } from '@/lib/types';

const BC_NAME_LIMIT = 250;
const BC_DESCRIPTION_LIMIT = 65535;
const BC_VARIANT_LIMIT = 600;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeHash, accessToken, limit = 24, page = 1 } = body;

    if (!storeHash || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing BigCommerce credentials' },
        { status: 400 }
      );
    }

    // Fetch products from BigCommerce with images and variants
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products?include=images,variants&limit=${limit}&page=${page}&is_visible=true`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BC API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products from BigCommerce' },
        { status: response.status }
      );
    }

    const result = await response.json();
    const products = result.data || [];
    const pagination = result.meta?.pagination || {};

    // Transform products with validation metadata
    const previewProducts: BCProductPreview[] = products.map((product: Record<string, unknown>) => {
      const validation = validateProduct(product);
      const productImages = product.images as Record<string, unknown>[] | undefined;
      const productVariants = product.variants as Record<string, unknown>[] | undefined;

      return {
        id: product.id as number,
        name: product.name as string,
        sku: (product.sku as string) || '',
        price: (product.price as number) || 0,
        sale_price: product.sale_price as number | undefined,
        description: (product.description as string) || '',
        images: productImages?.map((img) => ({
          id: img.id as number,
          url_standard: img.url_standard as string,
          url_thumbnail: img.url_thumbnail as string,
          url_tiny: img.url_tiny as string,
          is_thumbnail: img.is_thumbnail as boolean,
          sort_order: img.sort_order as number,
          description: (img.description as string) || '',
        })) || [],
        variants: productVariants?.map((v) => ({
          id: v.id as number,
          product_id: v.product_id as number,
          sku: (v.sku as string) || '',
          price: v.price as number,
          sale_price: v.sale_price as number | undefined,
          option_values: (v.option_values as { option_display_name: string; label: string }[]) || [],
          inventory_level: (v.inventory_level as number) || 0,
          image_url: v.image_url as string | undefined,
        })) || [],
        categories: (product.categories as number[]) || [],
        inventory_level: (product.inventory_level as number) || 0,
        is_visible: product.is_visible as boolean,
        custom_url: (product.custom_url as { url: string }) || { url: '' },
        type: (product.type as 'physical' | 'digital') || 'physical',
        weight: (product.weight as number) || 0,
        _validation: validation,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: previewProducts,
        pagination: {
          total: pagination.total || 0,
          count: pagination.count || products.length,
          per_page: pagination.per_page || limit,
          current_page: pagination.current_page || page,
          total_pages: pagination.total_pages || 1,
        },
        summary: {
          total: pagination.total || products.length,
          withIssues: previewProducts.filter(p => p._validation.issues.length > 0).length,
          errors: previewProducts.reduce((sum, p) => sum + p._validation.issues.filter(i => i.severity === 'error').length, 0),
          warnings: previewProducts.reduce((sum, p) => sum + p._validation.issues.filter(i => i.severity === 'warning').length, 0),
        },
      },
    });

  } catch (error) {
    console.error('Preview products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch preview products',
      },
      { status: 500 }
    );
  }
}

function validateProduct(product: Record<string, unknown>): PreviewValidation {
  const issues: PreviewValidationIssue[] = [];
  const name = (product.name as string) || '';
  const description = (product.description as string) || '';
  const images = (product.images as unknown[]) || [];
  const variants = (product.variants as unknown[]) || [];
  const price = (product.price as number) || 0;
  const sku = (product.sku as string) || '';

  // Check for main image
  const hasMainImage = images.length > 0;
  if (!hasMainImage) {
    issues.push({
      type: 'missing_image',
      severity: 'warning',
      message: 'Product has no images',
      field: 'images',
    });
  }

  // Check name length
  const nameTruncated = name.length > BC_NAME_LIMIT;
  if (nameTruncated) {
    issues.push({
      type: 'truncated_name',
      severity: 'warning',
      message: `Name is ${name.length} chars (limit: ${BC_NAME_LIMIT})`,
      field: 'name',
      originalValue: name,
      displayedValue: name.substring(0, BC_NAME_LIMIT),
    });
  }

  // Check description length
  const descriptionTruncated = description.length > BC_DESCRIPTION_LIMIT;
  if (descriptionTruncated) {
    issues.push({
      type: 'truncated_description',
      severity: 'info',
      message: `Description is ${description.length} chars (limit: ${BC_DESCRIPTION_LIMIT})`,
      field: 'description',
    });
  }

  // Check variant count
  const variantCount = variants.length;
  if (variantCount > BC_VARIANT_LIMIT) {
    issues.push({
      type: 'variant_limit',
      severity: 'error',
      message: `Product has ${variantCount} variants (limit: ${BC_VARIANT_LIMIT})`,
      field: 'variants',
    });
  }

  // Check price
  const hasPrice = price > 0;
  if (!hasPrice) {
    issues.push({
      type: 'missing_price',
      severity: 'warning',
      message: 'Product has no price or zero price',
      field: 'price',
    });
  }

  // Check SKU
  const hasSku = sku.length > 0;
  if (!hasSku) {
    issues.push({
      type: 'missing_sku',
      severity: 'info',
      message: 'Product has no SKU',
      field: 'sku',
    });
  }

  return {
    hasMainImage,
    nameTruncated,
    originalNameLength: name.length,
    descriptionTruncated,
    originalDescriptionLength: description.length,
    variantCount,
    hasPrice,
    hasSku,
    issues,
  };
}
