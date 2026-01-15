[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [schemas/bc](../README.md) / bcAddressSchema

# Variable: bcAddressSchema

> `const` **bcAddressSchema**: `ZodObject`\<\{ `first_name`: `ZodString`; `last_name`: `ZodString`; `company`: `ZodOptional`\<`ZodString`\>; `address1`: `ZodString`; `address2`: `ZodOptional`\<`ZodString`\>; `city`: `ZodString`; `state_or_province`: `ZodString`; `postal_code`: `ZodString`; `country_code`: `ZodString`; `phone`: `ZodOptional`\<`ZodString`\>; `address_type`: `ZodOptional`\<`ZodEnum`\<\[`"residential"`, `"commercial"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `first_name`: `string`; `last_name`: `string`; `company?`: `string`; `address1`: `string`; `address2?`: `string`; `city`: `string`; `state_or_province`: `string`; `postal_code`: `string`; `country_code`: `string`; `phone?`: `string`; `address_type?`: `"residential"` \| `"commercial"`; \}, \{ `first_name`: `string`; `last_name`: `string`; `company?`: `string`; `address1`: `string`; `address2?`: `string`; `city`: `string`; `state_or_province`: `string`; `postal_code`: `string`; `country_code`: `string`; `phone?`: `string`; `address_type?`: `"residential"` \| `"commercial"`; \}\>

Defined in: [src/schemas/bc.ts:152](https://github.com/nino-chavez/bc-migration/blob/main/src/schemas/bc.ts#L152)
