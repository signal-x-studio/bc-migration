[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [schemas/wc](../README.md) / wcCategorySchema

# Variable: wcCategorySchema

> `const` **wcCategorySchema**: `ZodObject`\<\{ `id`: `ZodNumber`; `name`: `ZodString`; `slug`: `ZodString`; `parent`: `ZodNumber`; `description`: `ZodString`; `display`: `ZodString`; `image`: `ZodNullable`\<`ZodObject`\<\{ `id`: `ZodNumber`; `src`: `ZodString`; `name`: `ZodString`; `alt`: `ZodString`; `position`: `ZodNumber`; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `number`; `src`: `string`; `name`: `string`; `alt`: `string`; `position`: `number`; \}, \{ `id`: `number`; `src`: `string`; `name`: `string`; `alt`: `string`; `position`: `number`; \}\>\>; `menu_order`: `ZodNumber`; `count`: `ZodNumber`; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `number`; `name`: `string`; `slug`: `string`; `parent`: `number`; `description`: `string`; `display`: `string`; `image`: \{ `id`: `number`; `src`: `string`; `name`: `string`; `alt`: `string`; `position`: `number`; \} \| `null`; `menu_order`: `number`; `count`: `number`; \}, \{ `id`: `number`; `name`: `string`; `slug`: `string`; `parent`: `number`; `description`: `string`; `display`: `string`; `image`: \{ `id`: `number`; `src`: `string`; `name`: `string`; `alt`: `string`; `position`: `number`; \} \| `null`; `menu_order`: `number`; `count`: `number`; \}\>

Defined in: [src/schemas/wc.ts:42](https://github.com/nino-chavez/bc-migration/blob/main/src/schemas/wc.ts#L42)
