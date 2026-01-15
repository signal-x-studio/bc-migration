[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [migration/transformers/variant](../README.md) / transformVariation

# Function: transformVariation()

> **transformVariation**(`wcVariation`, `valueMap`, `parentSku`): `object`

Defined in: [src/migration/transformers/variant.ts:102](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/transformers/variant.ts#L102)

Transform a single WC variation into a BC variant
Uses the valueMap to link variant option values to the correct options

## Parameters

### wcVariation

[`WCVariation`](../../../../types/wc/interfaces/WCVariation.md)

### valueMap

`OptionValueMap`

### parentSku

`string`

## Returns

`object`

### variant

> **variant**: `Omit`\<[`BCVariant`](../../../../types/bc/interfaces/BCVariant.md), `"id"` \| `"product_id"`\>

### warnings

> **warnings**: `string`[]
