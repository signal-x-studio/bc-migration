[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/errors](../README.md) / MigrationError

# Class: MigrationError

Defined in: [src/lib/errors.ts:15](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L15)

Base class for all migration errors

## Extends

- `Error`

## Extended by

- [`RateLimitError`](RateLimitError.md)
- [`ApiError`](ApiError.md)
- [`ValidationError`](ValidationError.md)
- [`DuplicateError`](DuplicateError.md)
- [`ConfigurationError`](ConfigurationError.md)
- [`ConnectionError`](ConnectionError.md)

## Constructors

### Constructor

> **new MigrationError**(`message`, `code`, `retriable`, `context?`): `MigrationError`

Defined in: [src/lib/errors.ts:21](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L21)

#### Parameters

##### message

`string`

##### code

`string`

##### retriable

`boolean` = `false`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`MigrationError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

Defined in: [src/lib/errors.ts:16](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L16)

***

### retriable

> `readonly` **retriable**: `boolean`

Defined in: [src/lib/errors.ts:17](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L17)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:18](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L18)

***

### timestamp

> `readonly` **timestamp**: `string`

Defined in: [src/lib/errors.ts:19](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L19)

## Methods

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:38](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L38)

#### Returns

`Record`\<`string`, `unknown`\>
