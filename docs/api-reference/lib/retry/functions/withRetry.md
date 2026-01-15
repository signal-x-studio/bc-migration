[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/retry](../README.md) / withRetry

# Function: withRetry()

> **withRetry**\<`T`\>(`fn`, `options`, `context?`): `Promise`\<`T`\>

Defined in: [src/lib/retry.ts:107](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L107)

Execute a function with automatic retry on transient failures

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

### options

[`RetryOptions`](../interfaces/RetryOptions.md) = `{}`

### context?

`string`

## Returns

`Promise`\<`T`\>
