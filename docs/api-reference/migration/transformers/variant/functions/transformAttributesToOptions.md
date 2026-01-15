[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [migration/transformers/variant](../README.md) / transformAttributesToOptions

# Function: transformAttributesToOptions()

> **transformAttributesToOptions**(`wcAttributes`): `object`

Defined in: [src/migration/transformers/variant.ts:57](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/variant.ts#L57)

Transform WC attributes into BC options
Only includes attributes marked as `variation: true`

## Parameters

### wcAttributes

[`WCAttribute`](../../../../types/wc/interfaces/WCAttribute.md)[]

## Returns

`object`

### options

> **options**: `Omit`\<[`BCOption`](../../../../types/bc/interfaces/BCOption.md), `"id"` \| `"product_id"`\>[]

### valueMap

> **valueMap**: `OptionValueMap`
