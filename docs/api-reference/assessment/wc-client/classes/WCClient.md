[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [assessment/wc-client](../README.md) / WCClient

# Class: WCClient

Defined in: [src/assessment/wc-client.ts:12](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L12)

## Constructors

### Constructor

> **new WCClient**(`config`): `WCClient`

Defined in: [src/assessment/wc-client.ts:15](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L15)

#### Parameters

##### config

[`WCConfig`](../interfaces/WCConfig.md)

#### Returns

`WCClient`

## Methods

### getCounts()

> **getCounts**(`endpoint`): `Promise`\<`number`\>

Defined in: [src/assessment/wc-client.ts:25](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L25)

#### Parameters

##### endpoint

`string`

#### Returns

`Promise`\<`number`\>

***

### getProducts()

> **getProducts**(`params`): `Promise`\<`any`\>

Defined in: [src/assessment/wc-client.ts:36](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L36)

#### Parameters

##### params

`any` = `{}`

#### Returns

`Promise`\<`any`\>

***

### getSystemStatus()

> **getSystemStatus**(): `Promise`\<`any`\>

Defined in: [src/assessment/wc-client.ts:40](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L40)

#### Returns

`Promise`\<`any`\>

***

### getCategories()

> **getCategories**(`params`): `Promise`\<`any`\>

Defined in: [src/assessment/wc-client.ts:44](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L44)

#### Parameters

##### params

`any` = `{}`

#### Returns

`Promise`\<`any`\>

***

### getCustomers()

> **getCustomers**(`params`): `Promise`\<`any`\>

Defined in: [src/assessment/wc-client.ts:48](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L48)

#### Parameters

##### params

`any` = `{}`

#### Returns

`Promise`\<`any`\>

***

### getOrders()

> **getOrders**(`params`): `Promise`\<`any`\>

Defined in: [src/assessment/wc-client.ts:52](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L52)

#### Parameters

##### params

`any` = `{}`

#### Returns

`Promise`\<`any`\>

***

### getProductVariations()

> **getProductVariations**(`productId`, `params`): `Promise`\<`any`\>

Defined in: [src/assessment/wc-client.ts:63](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L63)

Get variations for a specific product

#### Parameters

##### productId

`number`

The WC product ID

##### params

`any` = `{}`

Optional query parameters (per_page, page, etc.)

#### Returns

`Promise`\<`any`\>

Promise with variations data

***

### getAllProductVariations()

> **getAllProductVariations**(`productId`): `Promise`\<`any`[]\>

Defined in: [src/assessment/wc-client.ts:72](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L72)

Fetch all variations for a product (handles pagination)

#### Parameters

##### productId

`number`

The WC product ID

#### Returns

`Promise`\<`any`[]\>

Promise with all variations

***

### testConnection()

> **testConnection**(): `Promise`\<`boolean`\>

Defined in: [src/assessment/wc-client.ts:94](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/wc-client.ts#L94)

#### Returns

`Promise`\<`boolean`\>
