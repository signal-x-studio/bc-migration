[**bc-migration v0.1.0**](../../../README.md)

***

[bc-migration](../../../README.md) / [assessment/report](../README.md) / ReportGenerator

# Class: ReportGenerator

Defined in: [src/assessment/report.ts:5](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/report.ts#L5)

## Constructors

### Constructor

> **new ReportGenerator**(`result`): `ReportGenerator`

Defined in: [src/assessment/report.ts:6](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/report.ts#L6)

#### Parameters

##### result

[`AssessmentResult`](../../orchestrator/interfaces/AssessmentResult.md)

#### Returns

`ReportGenerator`

## Methods

### generateMarkdown()

> **generateMarkdown**(): `string`

Defined in: [src/assessment/report.ts:8](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/report.ts#L8)

#### Returns

`string`

***

### save()

> **save**(`baseDir`): `Promise`\<\{ `markdown`: `string`; `json`: `string`; \}\>

Defined in: [src/assessment/report.ts:81](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/report.ts#L81)

#### Parameters

##### baseDir

`string` = `'./reports'`

#### Returns

`Promise`\<\{ `markdown`: `string`; `json`: `string`; \}\>
