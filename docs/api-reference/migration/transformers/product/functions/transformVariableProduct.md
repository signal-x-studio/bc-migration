[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [migration/transformers/product](../README.md) / transformVariableProduct

# Function: transformVariableProduct()

> **transformVariableProduct**(`wcProduct`, `wcVariations`, `categoryMap`): [`ProductTransformResult`](../interfaces/ProductTransformResult.md)

Defined in: [src/migration/transformers/product.ts:177](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/product.ts#L177)

Transform a variable WC product (with variations) to BC format
This creates a product with options and variants

## Parameters

### wcProduct

[`WCProduct`](../../../../types/wc/interfaces/WCProduct.md)

### wcVariations

[`WCVariation`](../../../../types/wc/interfaces/WCVariation.md)[]

### categoryMap

[`CategoryMap`](../type-aliases/CategoryMap.md)

## Returns

[`ProductTransformResult`](../interfaces/ProductTransformResult.md)
