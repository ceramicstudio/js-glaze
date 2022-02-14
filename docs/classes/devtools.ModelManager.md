# Class: ModelManager

[devtools](../modules/devtools.md).ModelManager

```sh
import { ModelManager } from '@glazed/devtools'
```

## Constructors

### constructor

• **new ModelManager**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ModelManagerConfig`](../modules/devtools.md#modelmanagerconfig) |

## Accessors

### definitions

• `get` **definitions**(): `string`[]

#### Returns

`string`[]

___

### model

• `get` **model**(): `ManagedModel`<`DagJWSResult`\>

#### Returns

`ManagedModel`<`DagJWSResult`\>

___

### schemas

• `get` **schemas**(): `string`[]

#### Returns

`string`[]

___

### tiles

• `get` **tiles**(): `string`[]

#### Returns

`string`[]

## Methods

### \_createDoc

▸ **_createDoc**<`T`\>(`content`, `metadata?`, `opts?`): `Promise`<`TileDocument`<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `T` |
| `metadata` | `Partial`<`StreamMetadata`\> |
| `opts` | `CreateOpts` |

#### Returns

`Promise`<`TileDocument`<`T`\>\>

___

### addJSONModel

▸ **addJSONModel**(`encoded`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoded` | `EncodedManagedModel` |

#### Returns

`void`

___

### addModel

▸ **addModel**(`model`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`DagJWSResult`\> |

#### Returns

`void`

___

### create

▸ **create**<`T`, `Content`\>(`type`, `alias`, `content`, `meta?`): `Promise`<`string`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof `CreateContentType` |
| `Content` | `CreateContentType`[`T`] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `T` |
| `alias` | `string` |
| `content` | `Content` |
| `meta?` | `Partial`<`StreamMetadata`\> |

#### Returns

`Promise`<`string`\>

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

___

### createTile

▸ **createTile**<`T`\>(`alias`, `contents`, `meta?`): `Promise`<`string`\>

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

___

### getDefinition

▸ **getDefinition**(`id`): ``null`` \| `ManagedEntry`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedEntry`<`DagJWSResult`\>

___

### getDefinitionID

▸ **getDefinitionID**(`alias`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

___

### getSchema

▸ **getSchema**(`id`): ``null`` \| `ManagedSchema`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedSchema`<`DagJWSResult`\>

___

### getSchemaByAlias

▸ **getSchemaByAlias**(`alias`): ``null`` \| `ManagedSchema`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `ManagedSchema`<`DagJWSResult`\>

___

### getSchemaID

▸ **getSchemaID**(`alias`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

___

### getSchemaURL

▸ **getSchemaURL**(`id`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `string`

___

### getTile

▸ **getTile**(`id`): ``null`` \| `ManagedEntry`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedEntry`<`DagJWSResult`\>

___

### getTileID

▸ **getTileID**(`alias`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

___

### hasDefinitionAlias

▸ **hasDefinitionAlias**(`alias`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`boolean`

___

### hasSchemaAlias

▸ **hasSchemaAlias**(`alias`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`boolean`

___

### hasTileAlias

▸ **hasTileAlias**(`alias`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`boolean`

___

### loadCommits

▸ **loadCommits**(`id`): `Promise`<`DagJWSResult`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`DagJWSResult`[]\>

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

___

### loadSchemaDependencies

▸ **loadSchemaDependencies**(`schema`): `Promise`<`Record`<`string`, `string`[]\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `Schema`<`Record`<`string`, `any`\>\> |

#### Returns

`Promise`<`Record`<`string`, `string`[]\>\>

___

### loadStream

▸ **loadStream**(`streamID`): `Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamID` | `string` \| `StreamRef` |

#### Returns

`Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>

___

### toJSON

▸ **toJSON**(): `EncodedManagedModel`

#### Returns

`EncodedManagedModel`

___

### toPublished

▸ **toPublished**(): `Promise`<`ModelData`<`string`\>\>

#### Returns

`Promise`<`ModelData`<`string`\>\>

___

### usePublished

▸ **usePublished**<`T`, `ID`\>(`type`, `alias`, `id`): `Promise`<`string`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof `UsePublishedIDType` |
| `ID` | `UsePublishedIDType`[`T`] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `T` |
| `alias` | `string` |
| `id` | `ID` |

#### Returns

`Promise`<`string`\>

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

___

### fromJSON

▸ `Static` **fromJSON**(`params`): [`ModelManager`](devtools.ModelManager.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`FromJSONParams`](../modules/devtools.md#fromjsonparams) |

#### Returns

[`ModelManager`](devtools.ModelManager.md)
