[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/bc](../README.md) / BCProduct

# Interface: BCProduct

Defined in: [src/types/bc.ts:142](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L142)

## Properties

### id?

> `optional` **id**: `number`

Defined in: [src/types/bc.ts:143](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L143)

***

### name

> **name**: `string`

Defined in: [src/types/bc.ts:144](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L144)

***

### type

> **type**: [`BCProductType`](../type-aliases/BCProductType.md)

Defined in: [src/types/bc.ts:145](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L145)

***

### sku

> **sku**: `string`

Defined in: [src/types/bc.ts:146](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L146)

***

### description?

> `optional` **description**: `string`

Defined in: [src/types/bc.ts:147](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L147)

***

### weight

> **weight**: `number`

Defined in: [src/types/bc.ts:148](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L148)

***

### width?

> `optional` **width**: `number`

Defined in: [src/types/bc.ts:149](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L149)

***

### depth?

> `optional` **depth**: `number`

Defined in: [src/types/bc.ts:150](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L150)

***

### height?

> `optional` **height**: `number`

Defined in: [src/types/bc.ts:151](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L151)

***

### price

> **price**: `number`

Defined in: [src/types/bc.ts:152](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L152)

***

### cost\_price?

> `optional` **cost\_price**: `number`

Defined in: [src/types/bc.ts:153](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L153)

***

### retail\_price?

> `optional` **retail\_price**: `number`

Defined in: [src/types/bc.ts:154](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L154)

***

### sale\_price?

> `optional` **sale\_price**: `number`

Defined in: [src/types/bc.ts:155](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L155)

***

### map\_price?

> `optional` **map\_price**: `number`

Defined in: [src/types/bc.ts:156](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L156)

***

### tax\_class\_id?

> `optional` **tax\_class\_id**: `number`

Defined in: [src/types/bc.ts:157](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L157)

***

### product\_tax\_code?

> `optional` **product\_tax\_code**: `string`

Defined in: [src/types/bc.ts:158](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L158)

***

### calculated\_price?

> `optional` **calculated\_price**: `number`

Defined in: [src/types/bc.ts:159](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L159)

***

### categories

> **categories**: `number`[]

Defined in: [src/types/bc.ts:160](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L160)

***

### brand\_id?

> `optional` **brand\_id**: `number`

Defined in: [src/types/bc.ts:161](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L161)

***

### option\_set\_id?

> `optional` **option\_set\_id**: `number` \| `null`

Defined in: [src/types/bc.ts:162](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L162)

***

### option\_set\_display?

> `optional` **option\_set\_display**: `string`

Defined in: [src/types/bc.ts:163](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L163)

***

### inventory\_level?

> `optional` **inventory\_level**: `number`

Defined in: [src/types/bc.ts:164](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L164)

***

### inventory\_warning\_level?

> `optional` **inventory\_warning\_level**: `number`

Defined in: [src/types/bc.ts:165](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L165)

***

### inventory\_tracking

> **inventory\_tracking**: [`BCInventoryTracking`](../type-aliases/BCInventoryTracking.md)

Defined in: [src/types/bc.ts:166](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L166)

***

### reviews\_rating\_sum?

> `optional` **reviews\_rating\_sum**: `number`

Defined in: [src/types/bc.ts:167](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L167)

***

### reviews\_count?

> `optional` **reviews\_count**: `number`

Defined in: [src/types/bc.ts:168](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L168)

***

### total\_sold?

> `optional` **total\_sold**: `number`

Defined in: [src/types/bc.ts:169](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L169)

***

### fixed\_cost\_shipping\_price?

> `optional` **fixed\_cost\_shipping\_price**: `number`

Defined in: [src/types/bc.ts:170](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L170)

***

### is\_free\_shipping?

> `optional` **is\_free\_shipping**: `boolean`

Defined in: [src/types/bc.ts:171](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L171)

***

### is\_visible

> **is\_visible**: `boolean`

Defined in: [src/types/bc.ts:172](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L172)

***

### is\_featured?

> `optional` **is\_featured**: `boolean`

Defined in: [src/types/bc.ts:173](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L173)

***

### related\_products?

> `optional` **related\_products**: `number`[]

Defined in: [src/types/bc.ts:174](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L174)

***

### warranty?

> `optional` **warranty**: `string`

Defined in: [src/types/bc.ts:175](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L175)

***

### bin\_picking\_number?

> `optional` **bin\_picking\_number**: `string`

Defined in: [src/types/bc.ts:176](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L176)

***

### layout\_file?

> `optional` **layout\_file**: `string`

Defined in: [src/types/bc.ts:177](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L177)

***

### upc?

> `optional` **upc**: `string`

Defined in: [src/types/bc.ts:178](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L178)

***

### mpn?

> `optional` **mpn**: `string`

Defined in: [src/types/bc.ts:179](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L179)

***

### gtin?

> `optional` **gtin**: `string`

Defined in: [src/types/bc.ts:180](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L180)

***

### search\_keywords?

> `optional` **search\_keywords**: `string`

Defined in: [src/types/bc.ts:181](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L181)

***

### availability?

> `optional` **availability**: [`BCAvailability`](../type-aliases/BCAvailability.md)

Defined in: [src/types/bc.ts:182](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L182)

***

### availability\_description?

> `optional` **availability\_description**: `string`

Defined in: [src/types/bc.ts:183](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L183)

***

### gift\_wrapping\_options\_type?

> `optional` **gift\_wrapping\_options\_type**: `"none"` \| `"any"` \| `"list"`

Defined in: [src/types/bc.ts:184](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L184)

***

### gift\_wrapping\_options\_list?

> `optional` **gift\_wrapping\_options\_list**: `number`[]

Defined in: [src/types/bc.ts:185](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L185)

***

### sort\_order?

> `optional` **sort\_order**: `number`

Defined in: [src/types/bc.ts:186](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L186)

***

### condition?

> `optional` **condition**: [`BCCondition`](../type-aliases/BCCondition.md)

Defined in: [src/types/bc.ts:187](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L187)

***

### is\_condition\_shown?

> `optional` **is\_condition\_shown**: `boolean`

Defined in: [src/types/bc.ts:188](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L188)

***

### order\_quantity\_minimum?

> `optional` **order\_quantity\_minimum**: `number`

Defined in: [src/types/bc.ts:189](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L189)

***

### order\_quantity\_maximum?

> `optional` **order\_quantity\_maximum**: `number`

Defined in: [src/types/bc.ts:190](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L190)

***

### page\_title?

> `optional` **page\_title**: `string`

Defined in: [src/types/bc.ts:191](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L191)

***

### meta\_keywords?

> `optional` **meta\_keywords**: `string`[]

Defined in: [src/types/bc.ts:192](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L192)

***

### meta\_description?

> `optional` **meta\_description**: `string`

Defined in: [src/types/bc.ts:193](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L193)

***

### date\_created?

> `optional` **date\_created**: `string`

Defined in: [src/types/bc.ts:194](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L194)

***

### date\_modified?

> `optional` **date\_modified**: `string`

Defined in: [src/types/bc.ts:195](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L195)

***

### view\_count?

> `optional` **view\_count**: `number`

Defined in: [src/types/bc.ts:196](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L196)

***

### preorder\_release\_date?

> `optional` **preorder\_release\_date**: `string` \| `null`

Defined in: [src/types/bc.ts:197](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L197)

***

### preorder\_message?

> `optional` **preorder\_message**: `string`

Defined in: [src/types/bc.ts:198](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L198)

***

### is\_preorder\_only?

> `optional` **is\_preorder\_only**: `boolean`

Defined in: [src/types/bc.ts:199](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L199)

***

### is\_price\_hidden?

> `optional` **is\_price\_hidden**: `boolean`

Defined in: [src/types/bc.ts:200](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L200)

***

### price\_hidden\_label?

> `optional` **price\_hidden\_label**: `string`

Defined in: [src/types/bc.ts:201](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L201)

***

### custom\_url?

> `optional` **custom\_url**: [`BCCustomUrl`](BCCustomUrl.md)

Defined in: [src/types/bc.ts:202](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L202)

***

### base\_variant\_id?

> `optional` **base\_variant\_id**: `number`

Defined in: [src/types/bc.ts:203](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L203)

***

### open\_graph\_type?

> `optional` **open\_graph\_type**: `"product"` \| `"album"` \| `"book"` \| `"drink"` \| `"food"` \| `"game"` \| `"movie"` \| `"song"` \| `"tv_show"`

Defined in: [src/types/bc.ts:204](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L204)

***

### open\_graph\_title?

> `optional` **open\_graph\_title**: `string`

Defined in: [src/types/bc.ts:205](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L205)

***

### open\_graph\_description?

> `optional` **open\_graph\_description**: `string`

Defined in: [src/types/bc.ts:206](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L206)

***

### open\_graph\_use\_meta\_description?

> `optional` **open\_graph\_use\_meta\_description**: `boolean`

Defined in: [src/types/bc.ts:207](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L207)

***

### open\_graph\_use\_product\_name?

> `optional` **open\_graph\_use\_product\_name**: `boolean`

Defined in: [src/types/bc.ts:208](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L208)

***

### open\_graph\_use\_image?

> `optional` **open\_graph\_use\_image**: `boolean`

Defined in: [src/types/bc.ts:209](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L209)

***

### images?

> `optional` **images**: [`BCImage`](BCImage.md)[]

Defined in: [src/types/bc.ts:210](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L210)

***

### videos?

> `optional` **videos**: `object`[]

Defined in: [src/types/bc.ts:211](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L211)

#### title

> **title**: `string`

#### description

> **description**: `string`

#### sort\_order

> **sort\_order**: `number`

#### type

> **type**: `"youtube"`

#### video\_id

> **video\_id**: `string`

***

### custom\_fields?

> `optional` **custom\_fields**: [`BCCustomField`](BCCustomField.md)[]

Defined in: [src/types/bc.ts:212](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L212)

***

### bulk\_pricing\_rules?

> `optional` **bulk\_pricing\_rules**: [`BCBulkPricingRule`](BCBulkPricingRule.md)[]

Defined in: [src/types/bc.ts:213](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L213)

***

### variants?

> `optional` **variants**: [`BCVariant`](BCVariant.md)[]

Defined in: [src/types/bc.ts:214](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L214)

***

### options?

> `optional` **options**: [`BCOption`](BCOption.md)[]

Defined in: [src/types/bc.ts:215](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L215)
