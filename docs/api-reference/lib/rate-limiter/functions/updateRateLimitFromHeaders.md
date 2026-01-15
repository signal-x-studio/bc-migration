[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [lib/rate-limiter](../README.md) / updateRateLimitFromHeaders

# Function: updateRateLimitFromHeaders()

> **updateRateLimitFromHeaders**(`headers`): `void`

Defined in: [src/lib/rate-limiter.ts:40](https://github.com/nino-chavez/bc-migration/blob/main/src/lib/rate-limiter.ts#L40)

Update reservoir based on API response headers
Call this after each BC API request to sync with actual limits

## Parameters

### headers

`Record`\<`string`, `string`\>

## Returns

`void`
