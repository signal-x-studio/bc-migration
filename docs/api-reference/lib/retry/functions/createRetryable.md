[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/retry](../README.md) / createRetryable

# Function: createRetryable()

> **createRetryable**\<`T`\>(`fn`, `options`, `contextFn?`): `T`

Defined in: [src/lib/retry.ts:168](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L168)

Create a retry-wrapped version of an async function

## Type Parameters

### T

`T` *extends* (...`args`) => `Promise`\<`any`\>

## Parameters

### fn

`T`

### options

[`RetryOptions`](../interfaces/RetryOptions.md) = `{}`

### contextFn?

(...`args`) => `string`

## Returns

`T`
