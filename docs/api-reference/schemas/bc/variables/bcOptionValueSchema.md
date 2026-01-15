[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [schemas/bc](../README.md) / bcOptionValueSchema

# Variable: bcOptionValueSchema

> `const` **bcOptionValueSchema**: `ZodObject`\<\{ `label`: `ZodString`; `sort_order`: `ZodOptional`\<`ZodNumber`\>; `value_data`: `ZodOptional`\<`ZodNullable`\<`ZodObject`\<\{ `colors`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `image_url`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `colors?`: `string`[]; `image_url?`: `string`; \}, \{ `colors?`: `string`[]; `image_url?`: `string`; \}\>\>\>; `is_default`: `ZodOptional`\<`ZodBoolean`\>; \}, `"strip"`, `ZodTypeAny`, \{ `label`: `string`; `sort_order?`: `number`; `value_data?`: \{ `colors?`: `string`[]; `image_url?`: `string`; \} \| `null`; `is_default?`: `boolean`; \}, \{ `label`: `string`; `sort_order?`: `number`; `value_data?`: \{ `colors?`: `string`[]; `image_url?`: `string`; \} \| `null`; `is_default?`: `boolean`; \}\>

Defined in: [src/schemas/bc.ts:60](https://github.com/nino-chavez/bc-migration/blob/main/src/schemas/bc.ts#L60)
