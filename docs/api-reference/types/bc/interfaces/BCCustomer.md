[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/bc](../README.md) / BCCustomer

# Interface: BCCustomer

Defined in: [src/types/bc.ts:232](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L232)

## Properties

### id?

> `optional` **id**: `number`

Defined in: [src/types/bc.ts:233](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L233)

***

### email

> **email**: `string`

Defined in: [src/types/bc.ts:234](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L234)

***

### first\_name

> **first\_name**: `string`

Defined in: [src/types/bc.ts:235](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L235)

***

### last\_name

> **last\_name**: `string`

Defined in: [src/types/bc.ts:236](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L236)

***

### company?

> `optional` **company**: `string`

Defined in: [src/types/bc.ts:237](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L237)

***

### phone?

> `optional` **phone**: `string`

Defined in: [src/types/bc.ts:238](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L238)

***

### notes?

> `optional` **notes**: `string`

Defined in: [src/types/bc.ts:239](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L239)

***

### tax\_exempt\_category?

> `optional` **tax\_exempt\_category**: `string`

Defined in: [src/types/bc.ts:240](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L240)

***

### customer\_group\_id?

> `optional` **customer\_group\_id**: `number`

Defined in: [src/types/bc.ts:241](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L241)

***

### addresses?

> `optional` **addresses**: [`BCAddress`](BCAddress.md)[]

Defined in: [src/types/bc.ts:242](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L242)

***

### attributes?

> `optional` **attributes**: `object`[]

Defined in: [src/types/bc.ts:243](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L243)

#### attribute\_id

> **attribute\_id**: `number`

#### attribute\_value

> **attribute\_value**: `string`

#### date\_created?

> `optional` **date\_created**: `string`

#### date\_modified?

> `optional` **date\_modified**: `string`

***

### authentication?

> `optional` **authentication**: `object`

Defined in: [src/types/bc.ts:244](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L244)

#### force\_password\_reset

> **force\_password\_reset**: `boolean`

#### new\_password?

> `optional` **new\_password**: `string`

***

### accepts\_product\_review\_abandoned\_cart\_emails?

> `optional` **accepts\_product\_review\_abandoned\_cart\_emails**: `boolean`

Defined in: [src/types/bc.ts:248](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L248)

***

### store\_credit\_amounts?

> `optional` **store\_credit\_amounts**: `object`[]

Defined in: [src/types/bc.ts:249](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L249)

#### amount

> **amount**: `number`

***

### origin\_channel\_id?

> `optional` **origin\_channel\_id**: `number`

Defined in: [src/types/bc.ts:250](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L250)

***

### channel\_ids?

> `optional` **channel\_ids**: `number`[]

Defined in: [src/types/bc.ts:251](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L251)

***

### form\_fields?

> `optional` **form\_fields**: `object`[]

Defined in: [src/types/bc.ts:252](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L252)

#### name

> **name**: `string`

#### value

> **value**: `string` \| `number` \| `string`[]
