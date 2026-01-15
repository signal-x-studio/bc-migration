[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/migration](../README.md) / MigrationState

# Interface: MigrationState

Defined in: [src/types/migration.ts:39](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L39)

## Properties

### migrationId

> **migrationId**: `string`

Defined in: [src/types/migration.ts:40](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L40)

***

### sourceStoreUrl

> **sourceStoreUrl**: `string`

Defined in: [src/types/migration.ts:41](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L41)

***

### targetStoreHash

> **targetStoreHash**: `string`

Defined in: [src/types/migration.ts:42](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L42)

***

### startedAt

> **startedAt**: `string`

Defined in: [src/types/migration.ts:43](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L43)

***

### lastUpdatedAt

> **lastUpdatedAt**: `string`

Defined in: [src/types/migration.ts:44](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L44)

***

### status

> **status**: [`MigrationStatus`](../type-aliases/MigrationStatus.md)

Defined in: [src/types/migration.ts:45](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L45)

***

### phases

> **phases**: `object`

Defined in: [src/types/migration.ts:46](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L46)

#### categories

> **categories**: [`PhaseState`](PhaseState.md)

#### products

> **products**: [`PhaseState`](PhaseState.md)

#### customers

> **customers**: [`PhaseState`](PhaseState.md)

#### orders

> **orders**: [`PhaseState`](PhaseState.md)

***

### mappings

> **mappings**: `object`

Defined in: [src/types/migration.ts:52](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L52)

#### categories

> **categories**: [`IdMapping`](IdMapping.md)[]

#### products

> **products**: [`IdMapping`](IdMapping.md)[]

#### customers

> **customers**: [`IdMapping`](IdMapping.md)[]

#### orders

> **orders**: [`IdMapping`](IdMapping.md)[]
