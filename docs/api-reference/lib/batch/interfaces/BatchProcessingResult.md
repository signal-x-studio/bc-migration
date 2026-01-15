[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/batch](../README.md) / BatchProcessingResult

# Interface: BatchProcessingResult\<T, R\>

Defined in: [src/lib/batch.ts:36](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L36)

Combined results from processing all batches

## Type Parameters

### T

`T`

### R

`R`

## Properties

### totalProcessed

> **totalProcessed**: `number`

Defined in: [src/lib/batch.ts:37](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L37)

***

### succeeded

> **succeeded**: `R`[]

Defined in: [src/lib/batch.ts:38](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L38)

***

### failed

> **failed**: `object`[]

Defined in: [src/lib/batch.ts:39](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L39)

#### item

> **item**: `T`

#### error

> **error**: `Error`

***

### duration

> **duration**: `number`

Defined in: [src/lib/batch.ts:40](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L40)
