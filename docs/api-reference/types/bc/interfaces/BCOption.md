[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [types/bc](../README.md) / BCOption

# Interface: BCOption

Defined in: [src/types/bc.ts:53](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L53)

## Properties

### id?

> `optional` **id**: `number`

Defined in: [src/types/bc.ts:54](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L54)

***

### product\_id?

> `optional` **product\_id**: `number`

Defined in: [src/types/bc.ts:55](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L55)

***

### display\_name

> **display\_name**: `string`

Defined in: [src/types/bc.ts:56](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L56)

***

### type

> **type**: `"radio_buttons"` \| `"rectangles"` \| `"dropdown"` \| `"product_list"` \| `"product_list_with_images"` \| `"swatch"`

Defined in: [src/types/bc.ts:57](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L57)

***

### config?

> `optional` **config**: `object`

Defined in: [src/types/bc.ts:58](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L58)

#### default\_value?

> `optional` **default\_value**: `string`

#### checked\_by\_default?

> `optional` **checked\_by\_default**: `boolean`

#### checkbox\_label?

> `optional` **checkbox\_label**: `string`

#### date\_limited?

> `optional` **date\_limited**: `boolean`

#### date\_limit\_mode?

> `optional` **date\_limit\_mode**: `"earliest"` \| `"range"` \| `"latest"`

#### date\_earliest\_value?

> `optional` **date\_earliest\_value**: `string`

#### date\_latest\_value?

> `optional` **date\_latest\_value**: `string`

#### file\_types\_mode?

> `optional` **file\_types\_mode**: `"specific"` \| `"all"`

#### file\_types\_supported?

> `optional` **file\_types\_supported**: `string`[]

#### file\_types\_other?

> `optional` **file\_types\_other**: `string`[]

#### file\_max\_size?

> `optional` **file\_max\_size**: `number`

#### text\_characters\_limited?

> `optional` **text\_characters\_limited**: `boolean`

#### text\_min\_length?

> `optional` **text\_min\_length**: `number`

#### text\_max\_length?

> `optional` **text\_max\_length**: `number`

#### text\_lines\_limited?

> `optional` **text\_lines\_limited**: `boolean`

#### text\_max\_lines?

> `optional` **text\_max\_lines**: `number`

#### number\_limited?

> `optional` **number\_limited**: `boolean`

#### number\_limit\_mode?

> `optional` **number\_limit\_mode**: `"range"` \| `"lowest"` \| `"highest"`

#### number\_lowest\_value?

> `optional` **number\_lowest\_value**: `number`

#### number\_highest\_value?

> `optional` **number\_highest\_value**: `number`

#### number\_integers\_only?

> `optional` **number\_integers\_only**: `boolean`

#### product\_list\_adjusts\_inventory?

> `optional` **product\_list\_adjusts\_inventory**: `boolean`

#### product\_list\_adjusts\_pricing?

> `optional` **product\_list\_adjusts\_pricing**: `boolean`

#### product\_list\_shipping\_calc?

> `optional` **product\_list\_shipping\_calc**: `"none"` \| `"weight"` \| `"package"`

***

### sort\_order?

> `optional` **sort\_order**: `number`

Defined in: [src/types/bc.ts:84](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L84)

***

### option\_values

> **option\_values**: [`BCOptionValue`](BCOptionValue.md)[]

Defined in: [src/types/bc.ts:85](https://github.com/nino-chavez/bc-migration/blob/main/src/types/bc.ts#L85)
