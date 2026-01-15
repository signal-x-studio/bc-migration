[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/errors](../README.md) / DuplicateError

# Class: DuplicateError

Defined in: [src/lib/errors.ts:142](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L142)

Duplicate item error

## Extends

- [`MigrationError`](MigrationError.md)

## Constructors

### Constructor

> **new DuplicateError**(`message`, `identifier`, `existingId?`, `context?`): `DuplicateError`

Defined in: [src/lib/errors.ts:146](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L146)

#### Parameters

##### message

`string`

##### identifier

`string`

##### existingId?

`number`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`DuplicateError`

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

### identifier

> `readonly` **identifier**: `string`

Defined in: [src/lib/errors.ts:143](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L143)

***

### existingId?

> `readonly` `optional` **existingId**: `number`

Defined in: [src/lib/errors.ts:144](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L144)

## Methods

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:38](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L38)

#### Returns

`Record`\<`string`, `unknown`\>

#### Inherited from

[`MigrationError`](MigrationError.md).[`toJSON`](MigrationError.md#tojson)
