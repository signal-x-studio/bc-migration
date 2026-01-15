[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/bc](../README.md) / BCOrder

# Interface: BCOrder

Defined in: [src/types/bc.ts:278](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L278)

## Properties

### id?

> `optional` **id**: `number`

Defined in: [src/types/bc.ts:279](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L279)

***

### customer\_id

> **customer\_id**: `number`

Defined in: [src/types/bc.ts:280](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L280)

***

### status\_id

> **status\_id**: [`BCOrderStatusId`](../type-aliases/BCOrderStatusId.md)

Defined in: [src/types/bc.ts:281](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L281)

***

### billing\_address

> **billing\_address**: [`BCAddress`](BCAddress.md) & `object`

Defined in: [src/types/bc.ts:282](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L282)

#### Type Declaration

##### email?

> `optional` **email**: `string`

***

### shipping\_addresses?

> `optional` **shipping\_addresses**: [`BCAddress`](BCAddress.md) & `object`[]

Defined in: [src/types/bc.ts:283](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L283)

***

### products

> **products**: ([`BCOrderProduct`](BCOrderProduct.md) \| [`BCOrderCustomProduct`](BCOrderCustomProduct.md))[]

Defined in: [src/types/bc.ts:284](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L284)

***

### subtotal\_ex\_tax?

> `optional` **subtotal\_ex\_tax**: `string`

Defined in: [src/types/bc.ts:285](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L285)

***

### subtotal\_inc\_tax?

> `optional` **subtotal\_inc\_tax**: `string`

Defined in: [src/types/bc.ts:286](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L286)

***

### base\_shipping\_cost?

> `optional` **base\_shipping\_cost**: `string`

Defined in: [src/types/bc.ts:287](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L287)

***

### shipping\_cost\_ex\_tax?

> `optional` **shipping\_cost\_ex\_tax**: `string`

Defined in: [src/types/bc.ts:288](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L288)

***

### shipping\_cost\_inc\_tax?

> `optional` **shipping\_cost\_inc\_tax**: `string`

Defined in: [src/types/bc.ts:289](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L289)

***

### base\_handling\_cost?

> `optional` **base\_handling\_cost**: `string`

Defined in: [src/types/bc.ts:290](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L290)

***

### handling\_cost\_ex\_tax?

> `optional` **handling\_cost\_ex\_tax**: `string`

Defined in: [src/types/bc.ts:291](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L291)

***

### handling\_cost\_inc\_tax?

> `optional` **handling\_cost\_inc\_tax**: `string`

Defined in: [src/types/bc.ts:292](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L292)

***

### base\_wrapping\_cost?

> `optional` **base\_wrapping\_cost**: `string`

Defined in: [src/types/bc.ts:293](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L293)

***

### wrapping\_cost\_ex\_tax?

> `optional` **wrapping\_cost\_ex\_tax**: `string`

Defined in: [src/types/bc.ts:294](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L294)

***

### wrapping\_cost\_inc\_tax?

> `optional` **wrapping\_cost\_inc\_tax**: `string`

Defined in: [src/types/bc.ts:295](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L295)

***

### total\_ex\_tax?

> `optional` **total\_ex\_tax**: `string`

Defined in: [src/types/bc.ts:296](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L296)

***

### total\_inc\_tax?

> `optional` **total\_inc\_tax**: `string`

Defined in: [src/types/bc.ts:297](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L297)

***

### items\_total?

> `optional` **items\_total**: `number`

Defined in: [src/types/bc.ts:298](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L298)

***

### items\_shipped?

> `optional` **items\_shipped**: `number`

Defined in: [src/types/bc.ts:299](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L299)

***

### payment\_method?

> `optional` **payment\_method**: `string`

Defined in: [src/types/bc.ts:300](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L300)

***

### payment\_provider\_id?

> `optional` **payment\_provider\_id**: `string`

Defined in: [src/types/bc.ts:301](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L301)

***

### payment\_status?

> `optional` **payment\_status**: `string`

Defined in: [src/types/bc.ts:302](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L302)

***

### refunded\_amount?

> `optional` **refunded\_amount**: `string`

Defined in: [src/types/bc.ts:303](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L303)

***

### order\_is\_digital?

> `optional` **order\_is\_digital**: `boolean`

Defined in: [src/types/bc.ts:304](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L304)

***

### staff\_notes?

> `optional` **staff\_notes**: `string`

Defined in: [src/types/bc.ts:305](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L305)

***

### customer\_message?

> `optional` **customer\_message**: `string`

Defined in: [src/types/bc.ts:306](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L306)

***

### discount\_amount?

> `optional` **discount\_amount**: `string`

Defined in: [src/types/bc.ts:307](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L307)

***

### coupon\_discount?

> `optional` **coupon\_discount**: `string`

Defined in: [src/types/bc.ts:308](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L308)

***

### credit\_card\_type?

> `optional` **credit\_card\_type**: `string`

Defined in: [src/types/bc.ts:309](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L309)

***

### ip\_address?

> `optional` **ip\_address**: `string`

Defined in: [src/types/bc.ts:310](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L310)

***

### geoip\_country?

> `optional` **geoip\_country**: `string`

Defined in: [src/types/bc.ts:311](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L311)

***

### geoip\_country\_iso2?

> `optional` **geoip\_country\_iso2**: `string`

Defined in: [src/types/bc.ts:312](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L312)

***

### date\_created?

> `optional` **date\_created**: `string`

Defined in: [src/types/bc.ts:313](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L313)

***

### date\_modified?

> `optional` **date\_modified**: `string`

Defined in: [src/types/bc.ts:314](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L314)

***

### date\_shipped?

> `optional` **date\_shipped**: `string`

Defined in: [src/types/bc.ts:315](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L315)

***

### external\_source?

> `optional` **external\_source**: `string`

Defined in: [src/types/bc.ts:316](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L316)

***

### external\_id?

> `optional` **external\_id**: `string`

Defined in: [src/types/bc.ts:317](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L317)

***

### external\_merchant\_id?

> `optional` **external\_merchant\_id**: `string`

Defined in: [src/types/bc.ts:318](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L318)

***

### channel\_id?

> `optional` **channel\_id**: `number`

Defined in: [src/types/bc.ts:319](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L319)

***

### tax\_provider\_id?

> `optional` **tax\_provider\_id**: `string`

Defined in: [src/types/bc.ts:320](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L320)

***

### is\_email\_opt\_in?

> `optional` **is\_email\_opt\_in**: `boolean`

Defined in: [src/types/bc.ts:321](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L321)
