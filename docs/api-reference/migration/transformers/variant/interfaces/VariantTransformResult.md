[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [migration/transformers/variant](../README.md) / VariantTransformResult

# Interface: VariantTransformResult

Defined in: [src/migration/transformers/variant.ts:12](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/variant.ts#L12)

Result of transforming WC variations to BC options and variants

## Properties

### options

> **options**: `Omit`\<[`BCOption`](../../../../types/bc/interfaces/BCOption.md), `"id"` \| `"product_id"`\>[]

Defined in: [src/migration/transformers/variant.ts:13](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/variant.ts#L13)

***

### variants

> **variants**: `Omit`\<[`BCVariant`](../../../../types/bc/interfaces/BCVariant.md), `"id"` \| `"product_id"`\>[]

Defined in: [src/migration/transformers/variant.ts:14](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/variant.ts#L14)

***

### warnings

> **warnings**: `string`[]

Defined in: [src/migration/transformers/variant.ts:15](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/variant.ts#L15)
