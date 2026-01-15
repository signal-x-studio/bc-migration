[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/batch](../README.md) / BatchResult

# Interface: BatchResult\<T\>

Defined in: [src/lib/batch.ts:28](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L28)

Result of processing a single batch

## Type Parameters

### T

`T`

## Properties

### succeeded

> **succeeded**: `T`[]

Defined in: [src/lib/batch.ts:29](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L29)

***

### failed

> **failed**: `object`[]

Defined in: [src/lib/batch.ts:30](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L30)

#### item

> **item**: `T`

#### error

> **error**: `Error`
