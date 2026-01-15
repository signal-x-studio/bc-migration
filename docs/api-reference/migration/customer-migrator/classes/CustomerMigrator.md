[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [migration/customer-migrator](../README.md) / CustomerMigrator

# Class: CustomerMigrator

Defined in: [src/migration/customer-migrator.ts:17](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/customer-migrator.ts#L17)

## Constructors

### Constructor

> **new CustomerMigrator**(`wcClient`, `bcClient`, `options`): `CustomerMigrator`

Defined in: [src/migration/customer-migrator.ts:22](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/customer-migrator.ts#L22)

#### Parameters

##### wcClient

[`WCClient`](../../../assessment/wc-client/classes/WCClient.md)

##### bcClient

`BCClient`

##### options

###### skipExisting?

`boolean`

#### Returns

`CustomerMigrator`

## Methods

### run()

> **run**(): `Promise`\<`MigrationStats`\>

Defined in: [src/migration/customer-migrator.ts:32](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/customer-migrator.ts#L32)

#### Returns

`Promise`\<`MigrationStats`\>
