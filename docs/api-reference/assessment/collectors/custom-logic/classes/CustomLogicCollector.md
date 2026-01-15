[**bc-migration v0.1.0**](../../../../README.md)

***

[bc-migration](../../../../README.md) / [assessment/collectors/custom-logic](../README.md) / CustomLogicCollector

# Class: CustomLogicCollector

Defined in: [src/assessment/collectors/custom-logic.ts:14](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/custom-logic.ts#L14)

CustomLogicCollector analyzes the theme's functions.php (if accessible)
or uses heuristic checks via WC API to identify custom business logic.

## Constructors

### Constructor

> **new CustomLogicCollector**(`client`): `CustomLogicCollector`

Defined in: [src/assessment/collectors/custom-logic.ts:15](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/custom-logic.ts#L15)

#### Parameters

##### client

[`WCClient`](../../../wc-client/classes/WCClient.md)

#### Returns

`CustomLogicCollector`

## Methods

### collect()

> **collect**(): `Promise`\<[`CustomLogicMetrics`](../interfaces/CustomLogicMetrics.md)\>

Defined in: [src/assessment/collectors/custom-logic.ts:17](https://github.com/nino-chavez/bc-migration/blob/main/src/assessment/collectors/custom-logic.ts#L17)

#### Returns

`Promise`\<[`CustomLogicMetrics`](../interfaces/CustomLogicMetrics.md)\>
