[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/errors](../README.md) / RateLimitError

# Class: RateLimitError

Defined in: [src/lib/errors.ts:54](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L54)

Rate limit exceeded error

## Extends

- [`MigrationError`](MigrationError.md)

## Constructors

### Constructor

> **new RateLimitError**(`message`, `retryAfterMs?`, `context?`): `RateLimitError`

Defined in: [src/lib/errors.ts:57](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L57)

#### Parameters

##### message

`string`

##### retryAfterMs?

`number`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`RateLimitError`

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

### retryAfterMs?

> `readonly` `optional` **retryAfterMs**: `number`

Defined in: [src/lib/errors.ts:55](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L55)

## Methods

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:38](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L38)

#### Returns

`Record`\<`string`, `unknown`\>

#### Inherited from

[`MigrationError`](MigrationError.md).[`toJSON`](MigrationError.md#tojson)
