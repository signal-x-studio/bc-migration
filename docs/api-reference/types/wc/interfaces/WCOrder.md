[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/wc](../README.md) / WCOrder

# Interface: WCOrder

Defined in: [src/types/wc.ts:252](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L252)

## Properties

### id

> **id**: `number`

Defined in: [src/types/wc.ts:253](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L253)

***

### parent\_id

> **parent\_id**: `number`

Defined in: [src/types/wc.ts:254](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L254)

***

### status

> **status**: [`WCOrderStatus`](../type-aliases/WCOrderStatus.md)

Defined in: [src/types/wc.ts:255](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L255)

***

### currency

> **currency**: `string`

Defined in: [src/types/wc.ts:256](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L256)

***

### version

> **version**: `string`

Defined in: [src/types/wc.ts:257](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L257)

***

### prices\_include\_tax

> **prices\_include\_tax**: `boolean`

Defined in: [src/types/wc.ts:258](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L258)

***

### date\_created

> **date\_created**: `string`

Defined in: [src/types/wc.ts:259](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L259)

***

### date\_modified

> **date\_modified**: `string`

Defined in: [src/types/wc.ts:260](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L260)

***

### discount\_total

> **discount\_total**: `string`

Defined in: [src/types/wc.ts:261](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L261)

***

### discount\_tax

> **discount\_tax**: `string`

Defined in: [src/types/wc.ts:262](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L262)

***

### shipping\_total

> **shipping\_total**: `string`

Defined in: [src/types/wc.ts:263](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L263)

***

### shipping\_tax

> **shipping\_tax**: `string`

Defined in: [src/types/wc.ts:264](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L264)

***

### cart\_tax

> **cart\_tax**: `string`

Defined in: [src/types/wc.ts:265](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L265)

***

### total

> **total**: `string`

Defined in: [src/types/wc.ts:266](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L266)

***

### total\_tax

> **total\_tax**: `string`

Defined in: [src/types/wc.ts:267](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L267)

***

### customer\_id

> **customer\_id**: `number`

Defined in: [src/types/wc.ts:268](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L268)

***

### order\_key

> **order\_key**: `string`

Defined in: [src/types/wc.ts:269](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L269)

***

### billing

> **billing**: [`WCAddress`](WCAddress.md)

Defined in: [src/types/wc.ts:270](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L270)

***

### shipping

> **shipping**: `Omit`\<[`WCAddress`](WCAddress.md), `"email"` \| `"phone"`\>

Defined in: [src/types/wc.ts:271](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L271)

***

### payment\_method

> **payment\_method**: `string`

Defined in: [src/types/wc.ts:272](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L272)

***

### payment\_method\_title

> **payment\_method\_title**: `string`

Defined in: [src/types/wc.ts:273](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L273)

***

### transaction\_id

> **transaction\_id**: `string`

Defined in: [src/types/wc.ts:274](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L274)

***

### customer\_ip\_address

> **customer\_ip\_address**: `string`

Defined in: [src/types/wc.ts:275](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L275)

***

### customer\_user\_agent

> **customer\_user\_agent**: `string`

Defined in: [src/types/wc.ts:276](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L276)

***

### created\_via

> **created\_via**: `string`

Defined in: [src/types/wc.ts:277](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L277)

***

### customer\_note

> **customer\_note**: `string`

Defined in: [src/types/wc.ts:278](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L278)

***

### date\_completed

> **date\_completed**: `string` \| `null`

Defined in: [src/types/wc.ts:279](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L279)

***

### date\_paid

> **date\_paid**: `string` \| `null`

Defined in: [src/types/wc.ts:280](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L280)

***

### cart\_hash

> **cart\_hash**: `string`

Defined in: [src/types/wc.ts:281](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L281)

***

### number

> **number**: `string`

Defined in: [src/types/wc.ts:282](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L282)

***

### meta\_data

> **meta\_data**: [`WCMetaData`](WCMetaData.md)[]

Defined in: [src/types/wc.ts:283](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L283)

***

### line\_items

> **line\_items**: [`WCOrderLineItem`](WCOrderLineItem.md)[]

Defined in: [src/types/wc.ts:284](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L284)

***

### tax\_lines

> **tax\_lines**: `object`[]

Defined in: [src/types/wc.ts:285](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L285)

#### id

> **id**: `number`

#### rate\_code

> **rate\_code**: `string`

#### rate\_id

> **rate\_id**: `number`

#### label

> **label**: `string`

#### compound

> **compound**: `boolean`

#### tax\_total

> **tax\_total**: `string`

#### shipping\_tax\_total

> **shipping\_tax\_total**: `string`

#### rate\_percent

> **rate\_percent**: `number`

#### meta\_data

> **meta\_data**: [`WCMetaData`](WCMetaData.md)[]

***

### shipping\_lines

> **shipping\_lines**: [`WCOrderShippingLine`](WCOrderShippingLine.md)[]

Defined in: [src/types/wc.ts:286](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L286)

***

### fee\_lines

> **fee\_lines**: [`WCOrderFeeLine`](WCOrderFeeLine.md)[]

Defined in: [src/types/wc.ts:287](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L287)

***

### coupon\_lines

> **coupon\_lines**: [`WCOrderCouponLine`](WCOrderCouponLine.md)[]

Defined in: [src/types/wc.ts:288](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L288)

***

### refunds

> **refunds**: `object`[]

Defined in: [src/types/wc.ts:289](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L289)

#### id

> **id**: `number`

#### reason

> **reason**: `string`

#### total

> **total**: `string`

***

### payment\_url

> **payment\_url**: `string`

Defined in: [src/types/wc.ts:290](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L290)

***

### currency\_symbol

> **currency\_symbol**: `string`

Defined in: [src/types/wc.ts:291](https://github.com/nino-chavez/bc-migration/blob/main/src/types/wc.ts#L291)
