[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/retry](../README.md) / RetryOptions

# Interface: RetryOptions

Defined in: [src/lib/retry.ts:14](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L14)

## Properties

### retries?

> `optional` **retries**: `number`

Defined in: [src/lib/retry.ts:16](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L16)

Maximum number of retry attempts

***

### minTimeout?

> `optional` **minTimeout**: `number`

Defined in: [src/lib/retry.ts:18](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L18)

Base delay in milliseconds (doubles each retry)

***

### maxTimeout?

> `optional` **maxTimeout**: `number`

Defined in: [src/lib/retry.ts:20](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L20)

Maximum delay in milliseconds

***

### factor?

> `optional` **factor**: `number`

Defined in: [src/lib/retry.ts:22](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L22)

Multiplier for exponential backoff

***

### randomize?

> `optional` **randomize**: `boolean`

Defined in: [src/lib/retry.ts:24](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L24)

Whether to add random jitter to delays

***

### shouldRetry()?

> `optional` **shouldRetry**: (`error`) => `boolean`

Defined in: [src/lib/retry.ts:26](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/retry.ts#L26)

Custom function to determine if error is retriable

#### Parameters

##### error

`unknown`

#### Returns

`boolean`
