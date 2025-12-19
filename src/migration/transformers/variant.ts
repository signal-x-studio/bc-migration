/**
 * Variant Transformer
 * Transforms WooCommerce product variations and attributes into BigCommerce options and variants
 */

import type { WCAttribute, WCVariation } from '../../types/wc.js';
import type { BCOption, BCOptionValue, BCVariant } from '../../types/bc.js';

/**
 * Result of transforming WC variations to BC options and variants
 */
export interface VariantTransformResult {
  options: Omit<BCOption, 'id' | 'product_id'>[];
  variants: Omit<BCVariant, 'id' | 'product_id'>[];
  warnings: string[];
}

/**
 * Maps WC attribute type to BC option display type
 * WC uses simple attribute with options array
 * BC has multiple display types
 */
function mapAttributeToOptionType(attributeName: string): BCOption['type'] {
  const name = attributeName.toLowerCase();

  // Color/colour attributes work best as swatches
  if (name.includes('color') || name.includes('colour')) {
    return 'swatch';
  }

  // Size attributes work well as rectangles
  if (name.includes('size')) {
    return 'rectangles';
  }

  // Default to dropdown for other attributes
  return 'dropdown';
}

/**
 * Build a mapping from attribute name+option to BC option value ID
 * This is needed to construct the variant option_values array
 */
interface OptionValueMap {
  [attributeName: string]: {
    optionIndex: number;
    values: {
      [optionValue: string]: number; // value -> index in option_values array
    };
  };
}

/**
 * Transform WC attributes into BC options
 * Only includes attributes marked as `variation: true`
 */
export function transformAttributesToOptions(
  wcAttributes: WCAttribute[]
): { options: Omit<BCOption, 'id' | 'product_id'>[]; valueMap: OptionValueMap } {
  const options: Omit<BCOption, 'id' | 'product_id'>[] = [];
  const valueMap: OptionValueMap = {};

  // Filter to only variation attributes
  const variationAttributes = wcAttributes.filter(attr => attr.variation);

  for (let attrIndex = 0; attrIndex < variationAttributes.length; attrIndex++) {
    const attr = variationAttributes[attrIndex];

    // Create option values from attribute options
    const optionValues: BCOptionValue[] = attr.options.map((optionText, valueIndex) => ({
      label: optionText,
      sort_order: valueIndex,
      is_default: valueIndex === 0,
    }));

    // Build value map for this attribute
    valueMap[attr.name.toLowerCase()] = {
      optionIndex: attrIndex,
      values: {},
    };
    attr.options.forEach((optionText, valueIndex) => {
      valueMap[attr.name.toLowerCase()].values[optionText.toLowerCase()] = valueIndex;
    });

    const option: Omit<BCOption, 'id' | 'product_id'> = {
      display_name: attr.name,
      type: mapAttributeToOptionType(attr.name),
      sort_order: attr.position,
      option_values: optionValues,
    };

    options.push(option);
  }

  return { options, valueMap };
}

/**
 * Transform a single WC variation into a BC variant
 * Uses the valueMap to link variant option values to the correct options
 */
export function transformVariation(
  wcVariation: WCVariation,
  valueMap: OptionValueMap,
  parentSku: string
): { variant: Omit<BCVariant, 'id' | 'product_id'>; warnings: string[] } {
  const warnings: string[] = [];

  // Build option_values array from variation attributes
  const optionValues: BCVariant['option_values'] = [];

  for (const attr of wcVariation.attributes) {
    const attrKey = attr.name.toLowerCase();
    const mapping = valueMap[attrKey];

    if (!mapping) {
      warnings.push(
        `Variation ${wcVariation.id}: Attribute "${attr.name}" not found in parent product options`
      );
      continue;
    }

    const valueKey = attr.option.toLowerCase();
    const valueIndex = mapping.values[valueKey];

    if (valueIndex === undefined) {
      warnings.push(
        `Variation ${wcVariation.id}: Option value "${attr.option}" not found for attribute "${attr.name}"`
      );
      continue;
    }

    // In BC, we need to reference the option by its index/id
    // Since we don't have real IDs yet (they come after creation), we use placeholder
    // The actual linking happens when BC creates the product with options + variants together
    optionValues.push({
      option_display_name: attr.name,
      label: attr.option,
      option_id: mapping.optionIndex, // Placeholder - BC will assign real IDs
    });
  }

  // Generate SKU if missing
  const sku = wcVariation.sku || `${parentSku}-var-${wcVariation.id}`;

  const variant: Omit<BCVariant, 'id' | 'product_id'> = {
    sku,
    price: wcVariation.price ? parseFloat(wcVariation.price) : null,
    sale_price: wcVariation.sale_price ? parseFloat(wcVariation.sale_price) : null,
    weight: wcVariation.weight ? parseFloat(wcVariation.weight) : null,
    width: wcVariation.dimensions?.width ? parseFloat(wcVariation.dimensions.width) : null,
    height: wcVariation.dimensions?.height ? parseFloat(wcVariation.dimensions.height) : null,
    depth: wcVariation.dimensions?.length ? parseFloat(wcVariation.dimensions.length) : null,
    inventory_level: wcVariation.stock_quantity ?? 0,
    purchasing_disabled: !wcVariation.purchasable || wcVariation.stock_status === 'outofstock',
    purchasing_disabled_message: wcVariation.stock_status === 'outofstock'
      ? 'This variant is currently out of stock'
      : undefined,
    image_url: wcVariation.image?.src,
    option_values: optionValues,
  };

  return { variant, warnings };
}

/**
 * Transform all WC variations into BC variants
 * Main entry point for variant transformation
 */
export function transformVariations(
  wcVariations: WCVariation[],
  wcAttributes: WCAttribute[],
  parentSku: string
): VariantTransformResult {
  const warnings: string[] = [];

  // BC has a limit of 600 variants per product
  const BC_VARIANT_LIMIT = 600;
  if (wcVariations.length > BC_VARIANT_LIMIT) {
    warnings.push(
      `Product has ${wcVariations.length} variations but BigCommerce limit is ${BC_VARIANT_LIMIT}. ` +
      `Only the first ${BC_VARIANT_LIMIT} will be migrated.`
    );
  }

  const variationsToProcess = wcVariations.slice(0, BC_VARIANT_LIMIT);

  // Transform attributes to options
  const { options, valueMap } = transformAttributesToOptions(wcAttributes);

  if (options.length === 0) {
    warnings.push('No variation attributes found on parent product');
  }

  // Transform each variation
  const variants: Omit<BCVariant, 'id' | 'product_id'>[] = [];

  for (const wcVariation of variationsToProcess) {
    const result = transformVariation(wcVariation, valueMap, parentSku);
    variants.push(result.variant);
    warnings.push(...result.warnings);
  }

  return {
    options,
    variants,
    warnings,
  };
}

/**
 * Check if a product needs variant handling based on WC product type
 */
export function isVariableProduct(type: string): boolean {
  return type === 'variable';
}
