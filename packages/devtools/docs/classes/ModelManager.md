[@glazed/devtools](../README.md) / [Exports](../modules.md) / ModelManager

# Class: ModelManager

## Table of contents

### Constructors

- [constructor](ModelManager.md#constructor)

### Accessors

- [definitions](ModelManager.md#definitions)
- [model](ModelManager.md#model)
- [schemas](ModelManager.md#schemas)
- [tiles](ModelManager.md#tiles)

### Methods

- [addJSONModel](ModelManager.md#addjsonmodel)
- [addModel](ModelManager.md#addmodel)
- [createDefinition](ModelManager.md#createdefinition)
- [createSchema](ModelManager.md#createschema)
- [createTile](ModelManager.md#createtile)
- [getDefinition](ModelManager.md#getdefinition)
- [getDefinitionID](ModelManager.md#getdefinitionid)
- [getSchema](ModelManager.md#getschema)
- [getSchemaByAlias](ModelManager.md#getschemabyalias)
- [getSchemaID](ModelManager.md#getschemaid)
- [getSchemaURL](ModelManager.md#getschemaurl)
- [getTile](ModelManager.md#gettile)
- [getTileID](ModelManager.md#gettileid)
- [hasDefinitionAlias](ModelManager.md#hasdefinitionalias)
- [hasSchemaAlias](ModelManager.md#hasschemaalias)
- [hasTileAlias](ModelManager.md#hastilealias)
- [loadCommits](ModelManager.md#loadcommits)
- [loadSchema](ModelManager.md#loadschema)
- [loadSchemaDependencies](ModelManager.md#loadschemadependencies)
- [loadStream](ModelManager.md#loadstream)
- [toJSON](ModelManager.md#tojson)
- [toPublished](ModelManager.md#topublished)
- [usePublishedDefinition](ModelManager.md#usepublisheddefinition)
- [usePublishedSchema](ModelManager.md#usepublishedschema)
- [usePublishedTile](ModelManager.md#usepublishedtile)
- [fromJSON](ModelManager.md#fromjson)

## Constructors

### constructor

• **new ModelManager**(`ceramic`, `model?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `model?` | `ManagedModel`<`DagJWSResult`\> |

#### Defined in

[datamodel.ts:111](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L111)

## Accessors

### definitions

• `get` **definitions**(): `string`[]

#### Returns

`string`[]

#### Defined in

[datamodel.ts:128](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L128)

___

### model

• `get` **model**(): `ManagedModel`<`DagJWSResult`\>

#### Returns

`ManagedModel`<`DagJWSResult`\>

#### Defined in

[datamodel.ts:120](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L120)

___

### schemas

• `get` **schemas**(): `string`[]

#### Returns

`string`[]

#### Defined in

[datamodel.ts:124](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L124)

___

### tiles

• `get` **tiles**(): `string`[]

#### Returns

`string`[]

#### Defined in

[datamodel.ts:132](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L132)

## Methods

### addJSONModel

▸ **addJSONModel**(`encoded`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoded` | `EncodedManagedModel` |

#### Returns

`void`

#### Defined in

[datamodel.ts:182](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L182)

___

### addModel

▸ **addModel**(`model`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`DagJWSResult`\> |

#### Returns

`void`

#### Defined in

[datamodel.ts:138](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L138)

___

### createDefinition

▸ **createDefinition**(`alias`, `definition`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `definition` | `Definition`<`Record`<`string`, `any`\>\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:325](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L325)

___

### createSchema

▸ **createSchema**(`alias`, `schema`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `schema` | `Schema`<`Record`<`string`, `any`\>\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:279](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L279)

___

### createTile

▸ **createTile**<`T`\>(`alias`, `contents`, `meta`): `Promise`<`string`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `contents` | `T` |
| `meta` | `Partial`<`StreamMetadata`\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:387](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L387)

___

### getDefinition

▸ **getDefinition**(`id`): ``null`` \| `ManagedEntry`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedEntry`<`DagJWSResult`\>

#### Defined in

[datamodel.ts:321](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L321)

___

### getDefinitionID

▸ **getDefinitionID**(`alias`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

#### Defined in

[datamodel.ts:313](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L313)

___

### getSchema

▸ **getSchema**(`id`): ``null`` \| `ManagedSchema`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedSchema`<`DagJWSResult`\>

#### Defined in

[datamodel.ts:265](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L265)

___

### getSchemaByAlias

▸ **getSchemaByAlias**(`alias`): ``null`` \| `ManagedSchema`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `ManagedSchema`<`DagJWSResult`\>

#### Defined in

[datamodel.ts:274](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L274)

___

### getSchemaID

▸ **getSchemaID**(`alias`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

#### Defined in

[datamodel.ts:257](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L257)

___

### getSchemaURL

▸ **getSchemaURL**(`id`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `string`

#### Defined in

[datamodel.ts:269](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L269)

___

### getTile

▸ **getTile**(`id`): ``null`` \| `ManagedEntry`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedEntry`<`DagJWSResult`\>

#### Defined in

[datamodel.ts:383](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L383)

___

### getTileID

▸ **getTileID**(`alias`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

#### Defined in

[datamodel.ts:375](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L375)

___

### hasDefinitionAlias

▸ **hasDefinitionAlias**(`alias`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`boolean`

#### Defined in

[datamodel.ts:317](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L317)

___

### hasSchemaAlias

▸ **hasSchemaAlias**(`alias`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`boolean`

#### Defined in

[datamodel.ts:261](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L261)

___

### hasTileAlias

▸ **hasTileAlias**(`alias`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`boolean`

#### Defined in

[datamodel.ts:379](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L379)

___

### loadCommits

▸ **loadCommits**(`id`): `Promise`<`DagJWSResult`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`DagJWSResult`[]\>

#### Defined in

[datamodel.ts:196](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L196)

___

### loadSchema

▸ **loadSchema**(`id`, `alias?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `StreamRef` |
| `alias?` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:201](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L201)

___

### loadSchemaDependencies

▸ **loadSchemaDependencies**(`schema`): `Promise`<`Record`<`string`, `string`[]\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `Schema`<`Record`<`string`, `any`\>\> |

#### Returns

`Promise`<`Record`<`string`, `string`[]\>\>

#### Defined in

[datamodel.ts:235](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L235)

___

### loadStream

▸ **loadStream**(`streamID`): `Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamID` | `string` \| `StreamRef` |

#### Returns

`Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>

#### Defined in

[datamodel.ts:188](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L188)

___

### toJSON

▸ **toJSON**(): `EncodedManagedModel`

#### Returns

`EncodedManagedModel`

#### Defined in

[datamodel.ts:447](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L447)

___

### toPublished

▸ **toPublished**(): `Promise`<`ModelData`<`string`\>\>

#### Returns

`Promise`<`ModelData`<`string`\>\>

#### Defined in

[datamodel.ts:443](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L443)

___

### usePublishedDefinition

▸ **usePublishedDefinition**(`alias`, `id`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `id` | `string` \| `StreamID` |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:351](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L351)

___

### usePublishedSchema

▸ **usePublishedSchema**(`alias`, `id`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `id` | `string` \| `StreamRef` |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:304](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L304)

___

### usePublishedTile

▸ **usePublishedTile**(`alias`, `id`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `id` | `string` \| `StreamID` |

#### Returns

`Promise`<`string`\>

#### Defined in

[datamodel.ts:419](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L419)

___

### fromJSON

▸ `Static` **fromJSON**(`ceramic`, `encoded`): [`ModelManager`](ModelManager.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `encoded` | `EncodedManagedModel` |

#### Returns

[`ModelManager`](ModelManager.md)

#### Defined in

[datamodel.ts:93](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L93)
