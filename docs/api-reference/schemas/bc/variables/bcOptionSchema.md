[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [schemas/bc](../README.md) / bcOptionSchema

# Variable: bcOptionSchema

> `const` **bcOptionSchema**: `ZodObject`\<\{ `display_name`: `ZodString`; `type`: `ZodEnum`\<\[`"radio_buttons"`, `"rectangles"`, `"dropdown"`, `"product_list"`, `"product_list_with_images"`, `"swatch"`\]\>; `sort_order`: `ZodOptional`\<`ZodNumber`\>; `option_values`: `ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `sort_order`: `ZodOptional`\<`ZodNumber`\>; `value_data`: `ZodOptional`\<`ZodNullable`\<`ZodObject`\<\{ `colors`: `ZodOptional`\<`ZodArray`\<..., ...\>\>; `image_url`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `colors?`: ...[]; `image_url?`: `string`; \}, \{ `colors?`: ...[]; `image_url?`: `string`; \}\>\>\>; `is_default`: `ZodOptional`\<`ZodBoolean`\>; \}, `"strip"`, `ZodTypeAny`, \{ `label`: `string`; `sort_order?`: `number`; `value_data?`: \{ `colors?`: `string`[]; `image_url?`: `string`; \} \| `null`; `is_default?`: `boolean`; \}, \{ `label`: `string`; `sort_order?`: `number`; `value_data?`: \{ `colors?`: `string`[]; `image_url?`: `string`; \} \| `null`; `is_default?`: `boolean`; \}\>, `"many"`\>; \}, `"strip"`, `ZodTypeAny`, \{ `display_name`: `string`; `type`: `"radio_buttons"` \| `"rectangles"` \| `"dropdown"` \| `"product_list"` \| `"product_list_with_images"` \| `"swatch"`; `sort_order?`: `number`; `option_values`: `object`[]; \}, \{ `display_name`: `string`; `type`: `"radio_buttons"` \| `"rectangles"` \| `"dropdown"` \| `"product_list"` \| `"product_list_with_images"` \| `"swatch"`; `sort_order?`: `number`; `option_values`: `object`[]; \}\>

Defined in: [src/schemas/bc.ts:70](https://github.com/nino-chavez/bc-migration/blob/main/src/schemas/bc.ts#L70)
