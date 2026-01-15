[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/batch](../README.md) / processWithConcurrency

# Function: processWithConcurrency()

> **processWithConcurrency**\<`T`, `R`\>(`items`, `concurrency`, `processor`, `options`): `Promise`\<[`BatchProcessingResult`](../interfaces/BatchProcessingResult.md)\<`T`, `R`\>\>

Defined in: [src/lib/batch.ts:147](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/batch.ts#L147)

Process items individually with concurrency control
Use this when batch API isn't available but you still want parallel processing

## Type Parameters

### T

`T`

### R

`R`

## Parameters

### items

`T`[]

### concurrency

`number`

### processor

(`item`) => `Promise`\<`R`\>

### options

#### onItemComplete?

(`index`, `total`, `result`) => `void`

#### onItemError?

(`index`, `error`, `item`) => `void`

#### continueOnError?

`boolean`

#### context?

`string`

## Returns

`Promise`\<[`BatchProcessingResult`](../interfaces/BatchProcessingResult.md)\<`T`, `R`\>\>
