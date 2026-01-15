[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/wc](../README.md) / WCCustomer

# Interface: WCCustomer

Defined in: [src/types/wc.ts:177](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L177)

## Properties

### id

> **id**: `number`

Defined in: [src/types/wc.ts:178](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L178)

***

### date\_created

> **date\_created**: `string`

Defined in: [src/types/wc.ts:179](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L179)

***

### date\_modified

> **date\_modified**: `string`

Defined in: [src/types/wc.ts:180](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L180)

***

### email

> **email**: `string`

Defined in: [src/types/wc.ts:181](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L181)

***

### first\_name

> **first\_name**: `string`

Defined in: [src/types/wc.ts:182](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L182)

***

### last\_name

> **last\_name**: `string`

Defined in: [src/types/wc.ts:183](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L183)

***

### role

> **role**: `string`

Defined in: [src/types/wc.ts:184](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L184)

***

### username

> **username**: `string`

Defined in: [src/types/wc.ts:185](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L185)

***

### billing

> **billing**: [`WCAddress`](WCAddress.md)

Defined in: [src/types/wc.ts:186](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L186)

***

### shipping

> **shipping**: `Omit`\<[`WCAddress`](WCAddress.md), `"email"` \| `"phone"`\>

Defined in: [src/types/wc.ts:187](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L187)

***

### is\_paying\_customer

> **is\_paying\_customer**: `boolean`

Defined in: [src/types/wc.ts:188](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L188)

***

### avatar\_url

> **avatar\_url**: `string`

Defined in: [src/types/wc.ts:189](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L189)

***

### meta\_data

> **meta\_data**: [`WCMetaData`](WCMetaData.md)[]

Defined in: [src/types/wc.ts:190](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L190)
