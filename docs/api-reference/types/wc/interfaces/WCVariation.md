[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/wc](../README.md) / WCVariation

# Interface: WCVariation

Defined in: [src/types/wc.ts:124](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L124)

## Properties

### id

> **id**: `number`

Defined in: [src/types/wc.ts:125](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L125)

***

### date\_created

> **date\_created**: `string`

Defined in: [src/types/wc.ts:126](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L126)

***

### date\_modified

> **date\_modified**: `string`

Defined in: [src/types/wc.ts:127](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L127)

***

### description

> **description**: `string`

Defined in: [src/types/wc.ts:128](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L128)

***

### permalink

> **permalink**: `string`

Defined in: [src/types/wc.ts:129](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L129)

***

### sku

> **sku**: `string`

Defined in: [src/types/wc.ts:130](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L130)

***

### price

> **price**: `string`

Defined in: [src/types/wc.ts:131](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L131)

***

### regular\_price

> **regular\_price**: `string`

Defined in: [src/types/wc.ts:132](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L132)

***

### sale\_price

> **sale\_price**: `string`

Defined in: [src/types/wc.ts:133](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L133)

***

### date\_on\_sale\_from

> **date\_on\_sale\_from**: `string` \| `null`

Defined in: [src/types/wc.ts:134](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L134)

***

### date\_on\_sale\_to

> **date\_on\_sale\_to**: `string` \| `null`

Defined in: [src/types/wc.ts:135](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L135)

***

### on\_sale

> **on\_sale**: `boolean`

Defined in: [src/types/wc.ts:136](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L136)

***

### status

> **status**: [`WCProductStatus`](../type-aliases/WCProductStatus.md)

Defined in: [src/types/wc.ts:137](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L137)

***

### purchasable

> **purchasable**: `boolean`

Defined in: [src/types/wc.ts:138](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L138)

***

### virtual

> **virtual**: `boolean`

Defined in: [src/types/wc.ts:139](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L139)

***

### downloadable

> **downloadable**: `boolean`

Defined in: [src/types/wc.ts:140](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L140)

***

### downloads

> **downloads**: [`WCDownload`](WCDownload.md)[]

Defined in: [src/types/wc.ts:141](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L141)

***

### download\_limit

> **download\_limit**: `number`

Defined in: [src/types/wc.ts:142](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L142)

***

### download\_expiry

> **download\_expiry**: `number`

Defined in: [src/types/wc.ts:143](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L143)

***

### tax\_status

> **tax\_status**: [`WCTaxStatus`](../type-aliases/WCTaxStatus.md)

Defined in: [src/types/wc.ts:144](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L144)

***

### tax\_class

> **tax\_class**: `string`

Defined in: [src/types/wc.ts:145](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L145)

***

### manage\_stock

> **manage\_stock**: `boolean` \| `"parent"`

Defined in: [src/types/wc.ts:146](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L146)

***

### stock\_quantity

> **stock\_quantity**: `number` \| `null`

Defined in: [src/types/wc.ts:147](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L147)

***

### stock\_status

> **stock\_status**: [`WCStockStatus`](../type-aliases/WCStockStatus.md)

Defined in: [src/types/wc.ts:148](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L148)

***

### backorders

> **backorders**: [`WCBackorders`](../type-aliases/WCBackorders.md)

Defined in: [src/types/wc.ts:149](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L149)

***

### backorders\_allowed

> **backorders\_allowed**: `boolean`

Defined in: [src/types/wc.ts:150](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L150)

***

### backordered

> **backordered**: `boolean`

Defined in: [src/types/wc.ts:151](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L151)

***

### low\_stock\_amount

> **low\_stock\_amount**: `number` \| `null`

Defined in: [src/types/wc.ts:152](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L152)

***

### weight

> **weight**: `string`

Defined in: [src/types/wc.ts:153](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L153)

***

### dimensions

> **dimensions**: [`WCDimensions`](WCDimensions.md)

Defined in: [src/types/wc.ts:154](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L154)

***

### shipping\_class

> **shipping\_class**: `string`

Defined in: [src/types/wc.ts:155](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L155)

***

### shipping\_class\_id

> **shipping\_class\_id**: `number`

Defined in: [src/types/wc.ts:156](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L156)

***

### image

> **image**: [`WCImage`](WCImage.md) \| `null`

Defined in: [src/types/wc.ts:157](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L157)

***

### attributes

> **attributes**: `object`[]

Defined in: [src/types/wc.ts:158](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L158)

#### id

> **id**: `number`

#### name

> **name**: `string`

#### option

> **option**: `string`

***

### menu\_order

> **menu\_order**: `number`

Defined in: [src/types/wc.ts:159](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L159)

***

### meta\_data

> **meta\_data**: [`WCMetaData`](WCMetaData.md)[]

Defined in: [src/types/wc.ts:160](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L160)
