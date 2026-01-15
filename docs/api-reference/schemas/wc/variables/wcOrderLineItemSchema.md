[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [schemas/wc](../README.md) / wcOrderLineItemSchema

# Variable: wcOrderLineItemSchema

> `const` **wcOrderLineItemSchema**: `ZodObject`\<\{ `id`: `ZodNumber`; `name`: `ZodString`; `product_id`: `ZodNumber`; `variation_id`: `ZodNumber`; `quantity`: `ZodNumber`; `tax_class`: `ZodString`; `subtotal`: `ZodString`; `subtotal_tax`: `ZodString`; `total`: `ZodString`; `total_tax`: `ZodString`; `taxes`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodNumber`; `total`: `ZodString`; `subtotal`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `number`; `total`: `string`; `subtotal`: `string`; \}, \{ `id`: `number`; `total`: `string`; `subtotal`: `string`; \}\>, `"many"`\>; `meta_data`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodNumber`; `key`: `ZodString`; `value`: `ZodUnknown`; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `number`; `key`: `string`; `value?`: `unknown`; \}, \{ `id`: `number`; `key`: `string`; `value?`: `unknown`; \}\>, `"many"`\>; `sku`: `ZodString`; `price`: `ZodNumber`; `parent_name`: `ZodNullable`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `number`; `name`: `string`; `product_id`: `number`; `variation_id`: `number`; `quantity`: `number`; `tax_class`: `string`; `subtotal`: `string`; `subtotal_tax`: `string`; `total`: `string`; `total_tax`: `string`; `taxes`: `object`[]; `meta_data`: `object`[]; `sku`: `string`; `price`: `number`; `parent_name`: `string` \| `null`; \}, \{ `id`: `number`; `name`: `string`; `product_id`: `number`; `variation_id`: `number`; `quantity`: `number`; `tax_class`: `string`; `subtotal`: `string`; `subtotal_tax`: `string`; `total`: `string`; `total_tax`: `string`; `taxes`: `object`[]; `meta_data`: `object`[]; `sku`: `string`; `price`: `number`; `parent_name`: `string` \| `null`; \}\>

Defined in: [src/schemas/wc.ts:263](https://github.com/nino-chavez/bc-migration/blob/main/src/schemas/wc.ts#L263)
