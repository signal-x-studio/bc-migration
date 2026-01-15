[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/errors](../README.md) / ValidationError

# Class: ValidationError

Defined in: [src/lib/errors.ts:122](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L122)

Validation error for data transformation issues

## Extends

- [`MigrationError`](MigrationError.md)

## Constructors

### Constructor

> **new ValidationError**(`message`, `field?`, `value?`, `context?`): `ValidationError`

Defined in: [src/lib/errors.ts:126](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L126)

#### Parameters

##### message

`string`

##### field?

`string`

##### value?

`unknown`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`ValidationError`

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

### field?

> `readonly` `optional` **field**: `string`

Defined in: [src/lib/errors.ts:123](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L123)

***

### value?

> `readonly` `optional` **value**: `unknown`

Defined in: [src/lib/errors.ts:124](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L124)

## Methods

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/errors.ts:38](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/errors.ts#L38)

#### Returns

`Record`\<`string`, `unknown`\>

#### Inherited from

[`MigrationError`](MigrationError.md).[`toJSON`](MigrationError.md#tojson)
