[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [migration/transformers/product](../README.md) / transformProduct

# Function: transformProduct()

> **transformProduct**(`wcProduct`, `wcVariations`, `categoryMap`): [`ProductTransformResult`](../interfaces/ProductTransformResult.md)

Defined in: [src/migration/transformers/product.ts:240](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/product.ts#L240)

Main transformer function - routes to appropriate handler based on product type

## Parameters

### wcProduct

[`WCProduct`](../../../../types/wc/interfaces/WCProduct.md)

### wcVariations

[`WCVariation`](../../../../types/wc/interfaces/WCVariation.md)[] | `null`

### categoryMap

[`CategoryMap`](../type-aliases/CategoryMap.md)

## Returns

[`ProductTransformResult`](../interfaces/ProductTransformResult.md)
