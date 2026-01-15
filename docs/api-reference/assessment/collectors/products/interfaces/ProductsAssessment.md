[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [assessment/collectors/products](../README.md) / ProductsAssessment

# Interface: ProductsAssessment

Defined in: [src/assessment/collectors/products.ts:25](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/products.ts#L25)

## Properties

### timestamp

> **timestamp**: `Date`

Defined in: [src/assessment/collectors/products.ts:26](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/products.ts#L26)

***

### metrics

> **metrics**: `object`

Defined in: [src/assessment/collectors/products.ts:27](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/products.ts#L27)

#### total

> **total**: `number`

#### byType

> **byType**: `Record`\<`string`, `number`\>

#### withVariants

> **withVariants**: `number`

#### totalVariants

> **totalVariants**: `number`

#### withoutSKU

> **withoutSKU**: `number`

#### withoutImages

> **withoutImages**: `number`

#### avgPrice

> **avgPrice**: `number`

#### zeroPriceCount

> **zeroPriceCount**: `number`

***

### issues

> **issues**: `object`

Defined in: [src/assessment/collectors/products.ts:37](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/products.ts#L37)

#### blockers

> **blockers**: [`Issue`](Issue.md)[]

#### warnings

> **warnings**: [`Issue`](Issue.md)[]

#### info

> **info**: [`Issue`](Issue.md)[]

***

### samples

> **samples**: `object`

Defined in: [src/assessment/collectors/products.ts:42](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/products.ts#L42)

#### highVariantProducts

> **highVariantProducts**: [`ProductSample`](ProductSample.md)[]

#### problematicProducts

> **problematicProducts**: [`ProductSample`](ProductSample.md)[]
