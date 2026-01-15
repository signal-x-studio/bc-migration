[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [migration/transformers/product](../README.md) / BatchTransformResult

# Interface: BatchTransformResult

Defined in: [src/migration/transformers/product.ts:256](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/product.ts#L256)

Transform multiple products in batch
Returns results with products grouped by success/failure

## Properties

### successful

> **successful**: [`ProductTransformResult`](ProductTransformResult.md)[]

Defined in: [src/migration/transformers/product.ts:257](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/product.ts#L257)

***

### failed

> **failed**: `object`[]

Defined in: [src/migration/transformers/product.ts:258](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/product.ts#L258)

#### wcProduct

> **wcProduct**: [`WCProduct`](../../../../types/wc/interfaces/WCProduct.md)

#### errors

> **errors**: `string`[]

***

### totalWarnings

> **totalWarnings**: `string`[]

Defined in: [src/migration/transformers/product.ts:259](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/product.ts#L259)
