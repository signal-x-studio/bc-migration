[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [migration/product-migrator](../README.md) / ProductMigrator

# Class: ProductMigrator

Defined in: [src/migration/product-migrator.ts:23](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/product-migrator.ts#L23)

## Constructors

### Constructor

> **new ProductMigrator**(`wcClient`, `bcClient`, `options`): `ProductMigrator`

Defined in: [src/migration/product-migrator.ts:31](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/product-migrator.ts#L31)

#### Parameters

##### wcClient

[`WCClient`](../../../assessment/wc-client/classes/WCClient.md)

##### bcClient

`BCClient`

##### options

###### isDelta?

`boolean`

###### skipExisting?

`boolean`

#### Returns

`ProductMigrator`

## Methods

### run()

> **run**(): `Promise`\<`MigrationStats`\>

Defined in: [src/migration/product-migrator.ts:43](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/product-migrator.ts#L43)

#### Returns

`Promise`\<`MigrationStats`\>
