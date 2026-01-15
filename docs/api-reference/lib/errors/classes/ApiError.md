[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/errors](../README.md) / ApiError

# Class: ApiError

Defined in: [src/lib/errors.ts:67](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L67)

API error wrapping axios errors

## Extends

- [`MigrationError`](MigrationError.md)

## Constructors

### Constructor

> **new ApiError**(`message`, `axiosError`, `context?`): `ApiError`

Defined in: [src/lib/errors.ts:73](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L73)

#### Parameters

##### message

`string`

##### axiosError

`AxiosError`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`ApiError`

#### Overrides

[`MigrationError`](MigrationError.md).[`constructor`](MigrationError.md#constructor)

## Properties

### code

> `readonly` **code**: `string`

Defined in: [src/lib/errors.ts:16](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L16)

#### Inherited from

[`MigrationError`](MigrationError.md).[`code`](MigrationError.md#code)

***

### retriable

> `readonly` **retriable**: `boolean`

Defined in: [src/lib/errors.ts:17](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L17)

#### Inherited from

[`MigrationError`](MigrationError.md).[`retriable`](MigrationError.md#retriable)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:18](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L18)

#### Inherited from

[`MigrationError`](MigrationError.md).[`context`](MigrationError.md#context)

***

### timestamp

> `readonly` **timestamp**: `string`

Defined in: [src/lib/errors.ts:19](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L19)

#### Inherited from

[`MigrationError`](MigrationError.md).[`timestamp`](MigrationError.md#timestamp)

***

### status?

> `readonly` `optional` **status**: `number`

Defined in: [src/lib/errors.ts:68](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L68)

***

### url?

> `readonly` `optional` **url**: `string`

Defined in: [src/lib/errors.ts:69](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L69)

***

### method?

> `readonly` `optional` **method**: `string`

Defined in: [src/lib/errors.ts:70](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L70)

***

### responseData?

> `readonly` `optional` **responseData**: `unknown`

Defined in: [src/lib/errors.ts:71](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L71)

## Methods

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:38](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L38)

#### Returns

`Record`\<`string`, `unknown`\>

#### Inherited from

[`MigrationError`](MigrationError.md).[`toJSON`](MigrationError.md#tojson)

***

### fromAxiosError()

> `static` **fromAxiosError**(`error`, `context?`): `ApiError`

Defined in: [src/lib/errors.ts:89](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L89)

#### Parameters

##### error

`AxiosError`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`ApiError`
