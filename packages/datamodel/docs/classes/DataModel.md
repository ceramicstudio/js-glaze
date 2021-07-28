[@glazed/datamodel](../README.md) / [Exports](../modules.md) / DataModel

# Class: DataModel<ModelTypes, ModelAliases\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` |
| `ModelAliases` | extends `ModelTypesToAliases`<`ModelTypes`\>`ModelTypesToAliases`<`ModelTypes`\> |

## Table of contents

### Constructors

- [constructor](DataModel.md#constructor)

### Accessors

- [ceramic](DataModel.md#ceramic)

### Methods

- [createTile](DataModel.md#createtile)
- [getDefinitionID](DataModel.md#getdefinitionid)
- [getSchemaURL](DataModel.md#getschemaurl)
- [getTileID](DataModel.md#gettileid)
- [loadTile](DataModel.md#loadtile)

## Constructors

### constructor

• **new DataModel**<`ModelTypes`, `ModelAliases`\>(`__namedParameters`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |
| `ModelAliases` | extends `ModelTypesToAliases`<`ModelTypes`\>`ModelTypesToAliases`<`ModelTypes`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`DataModelParams`](../modules.md#datamodelparams)<`ModelAliases`\> |

#### Defined in

[index.ts:23](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L23)

## Accessors

### ceramic

• `get` **ceramic**(): `CeramicApi`

#### Returns

`CeramicApi`

#### Defined in

[index.ts:29](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L29)

## Methods

### createTile

▸ **createTile**<`Alias`, `ContentType`\>(`schemaAlias`, `content`, `__namedParameters?`): `Promise`<`TileDocument`<`ContentType`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Alias` | extends `string` \| `number` \| `symbol` |
| `ContentType` | `ModelTypes`[``"schemas"``][`Alias`] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaAlias` | `Alias` |
| `content` | `ContentType` |
| `__namedParameters` | [`CreateOptions`](../modules.md#createoptions) |

#### Returns

`Promise`<`TileDocument`<`ContentType`\>\>

#### Defined in

[index.ts:56](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L56)

___

### getDefinitionID

▸ **getDefinitionID**<`Alias`\>(`alias`): ``null`` \| `string`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Alias` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `Alias` |

#### Returns

``null`` \| `string`

#### Defined in

[index.ts:33](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L33)

___

### getSchemaURL

▸ **getSchemaURL**<`Alias`\>(`alias`): ``null`` \| `string`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Alias` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `Alias` |

#### Returns

``null`` \| `string`

#### Defined in

[index.ts:37](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L37)

___

### getTileID

▸ **getTileID**<`Alias`\>(`alias`): ``null`` \| `string`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Alias` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `Alias` |

#### Returns

``null`` \| `string`

#### Defined in

[index.ts:41](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L41)

___

### loadTile

▸ **loadTile**<`Alias`, `ContentType`\>(`alias`): `Promise`<``null`` \| `TileDocument`<`ContentType`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Alias` | extends `string` \| `number` \| `symbol` |
| `ContentType` | `ModelTypes`[``"schemas"``][`ModelTypes`[``"tiles"``][`Alias`]] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `Alias` |

#### Returns

`Promise`<``null`` \| `TileDocument`<`ContentType`\>\>

#### Defined in

[index.ts:45](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/datamodel/src/index.ts#L45)
