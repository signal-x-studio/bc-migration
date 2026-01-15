[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [migration/category-migrator](../README.md) / CategoryMigrator

# Class: CategoryMigrator

Defined in: [src/migration/category-migrator.ts:17](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/category-migrator.ts#L17)

## Constructors

### Constructor

> **new CategoryMigrator**(`wcClient`, `bcClient`, `options`): `CategoryMigrator`

Defined in: [src/migration/category-migrator.ts:23](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/category-migrator.ts#L23)

#### Parameters

##### wcClient

[`WCClient`](../../../assessment/wc-client/classes/WCClient.md)

##### bcClient

`BCClient`

##### options

###### skipExisting?

`boolean`

#### Returns

`CategoryMigrator`

## Methods

### getIdMapping()

> **getIdMapping**(): `Map`\<`number`, `number`\>

Defined in: [src/migration/category-migrator.ts:37](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/category-migrator.ts#L37)

Get the ID mapping (WC ID -> BC ID) after migration
Useful for other migrators that need to map category references

#### Returns

`Map`\<`number`, `number`\>

***

### run()

> **run**(): `Promise`\<`MigrationStats`\>

Defined in: [src/migration/category-migrator.ts:41](https://github.com/nino-chavez/bc-migration/blob/main/src/migration/category-migrator.ts#L41)

#### Returns

`Promise`\<`MigrationStats`\>
