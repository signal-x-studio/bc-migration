[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/batch](../README.md) / processBatches

# Function: processBatches()

> **processBatches**\<`T`, `R`\>(`items`, `batchSize`, `processor`, `options`): `Promise`\<[`BatchProcessingResult`](../interfaces/BatchProcessingResult.md)\<`T`, `R`\>\>

Defined in: [src/lib/batch.ts:51](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L51)

Process items in batches with a processor function

## Type Parameters

### T

`T`

### R

`R`

## Parameters

### items

`T`[]

Array of items to process

### batchSize

`number`

Number of items per batch (default 10 for BC)

### processor

(`batch`) => `Promise`\<`R`[]\>

Function that processes a batch and returns results

### options

Additional options

#### onBatchComplete?

(`batchIndex`, `totalBatches`, `results`) => `void`

Called after each batch completes

#### onBatchError?

(`batchIndex`, `error`, `batch`) => `void`

Called when a batch fails

#### continueOnError?

`boolean`

Continue processing if a batch fails

#### context?

`string`

Context for logging

## Returns

`Promise`\<[`BatchProcessingResult`](../interfaces/BatchProcessingResult.md)\<`T`, `R`\>\>
