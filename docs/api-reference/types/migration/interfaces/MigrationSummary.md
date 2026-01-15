[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/migration](../README.md) / MigrationSummary

# Interface: MigrationSummary

Defined in: [src/types/migration.ts:79](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L79)

## Properties

### migrationId

> **migrationId**: `string`

Defined in: [src/types/migration.ts:80](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L80)

***

### startedAt

> **startedAt**: `string`

Defined in: [src/types/migration.ts:81](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L81)

***

### completedAt

> **completedAt**: `string`

Defined in: [src/types/migration.ts:82](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L82)

***

### duration

> **duration**: `number`

Defined in: [src/types/migration.ts:83](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L83)

***

### overallStatus

> **overallStatus**: [`MigrationStatus`](../type-aliases/MigrationStatus.md)

Defined in: [src/types/migration.ts:84](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L84)

***

### results

> **results**: `object`

Defined in: [src/types/migration.ts:85](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L85)

#### categories

> **categories**: [`MigrationResult`](MigrationResult.md)

#### products

> **products**: [`MigrationResult`](MigrationResult.md)

#### customers

> **customers**: [`MigrationResult`](MigrationResult.md)

#### orders

> **orders**: [`MigrationResult`](MigrationResult.md)

***

### totalErrors

> **totalErrors**: `number`

Defined in: [src/types/migration.ts:91](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L91)

***

### errorsLogPath?

> `optional` **errorsLogPath**: `string`

Defined in: [src/types/migration.ts:92](https://github.com/nino-chavez/bc-migration/blob/main/src/types/migration.ts#L92)
