# Class: ModelManager

[devtools](../modules/devtools.md).ModelManager

The ModelManager class provides APIs for managing a data model so it can be used at runtime
using the [`DataModel`](datamodel.DataModel.md) runtime.

The ModelManager class is exported by the [`devtools`](../modules/devtools.md) module.

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

Stream IDs of definitions included in the model.

#### Returns

`string`[]

___

### model

• `get` **model**(): `ManagedModel`<`DagJWSResult`\>

[`Managed model`](../modules/types.md#managedmodel) used internally.

#### Returns

`ManagedModel`<`DagJWSResult`\>

___

### schemas

• `get` **schemas**(): `string`[]

Stream IDs of schemas included in the model.

#### Returns

`string`[]

___

### tiles

• `get` **tiles**(): `string`[]

Stream IDs of tiles included in the model.

#### Returns

`string`[]

## Methods

### addJSONModel

▸ **addJSONModel**(`encoded`): `void`

Add a [`JSON-encoded managed model`](../modules/types.md#encodedmanagedmodel) to the internal model
used by the instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoded` | `EncodedManagedModel` |

#### Returns

`void`

___

### addModel

▸ **addModel**(`model`): `void`

Add a [`managed model`](../modules/types.md#managedmodel) to the internal model used by the instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`DagJWSResult`\> |

#### Returns

`void`

___

### create

▸ **create**<`T`, `Content`\>(`type`, `alias`, `content`, `meta?`): `Promise`<`string`\>

Create a new stream of the given type and add it to the managed model.

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

Create a new definition stream and add it to the managed model.

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

Create a new schema stream and add it to the managed model.

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

Create a new tile stream and add it to the managed model.

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

### deploy

▸ **deploy**(): `Promise`<`ModelData`<`string`\>\>

Deploy the managed model to the Ceramic node and return the [`types.ModelAliases`](../modules/types.md#modelaliases) to
be used by the [`DataModel`](datamodel.DataModel.md) runtime.

#### Returns

`Promise`<`ModelData`<`string`\>\>

___

### getDefinition

▸ **getDefinition**(`id`): ``null`` \| `ManagedEntry`<`DagJWSResult`\>

Get the definition [`managed entry`](../modules/types.md#managedentry) for a given ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedEntry`<`DagJWSResult`\>

___

### getDefinitionID

▸ **getDefinitionID**(`alias`): ``null`` \| `string`

Get the ID of given definition alias, if present in the model.

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

___

### getSchema

▸ **getSchema**(`id`): ``null`` \| `ManagedSchema`<`DagJWSResult`\>

Get the [`managed schema`](../modules/types.md#managedschema) for a given ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedSchema`<`DagJWSResult`\>

___

### getSchemaByAlias

▸ **getSchemaByAlias**(`alias`): ``null`` \| `ManagedSchema`<`DagJWSResult`\>

Get the [`managed schema`](../modules/types.md#managedschema) for a given alias.

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `ManagedSchema`<`DagJWSResult`\>

___

### getSchemaID

▸ **getSchemaID**(`alias`): ``null`` \| `string`

Get the ID of given schema alias, if present in the model.

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

``null`` \| `string`

___

### getSchemaURL

▸ **getSchemaURL**(`id`): ``null`` \| `string`

Get the schema commit URL for a given ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `string`

___

### getTile

▸ **getTile**(`id`): ``null`` \| `ManagedEntry`<`DagJWSResult`\>

Get the tile [`managed entry`](../modules/types.md#managedentry) for a given ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| `ManagedEntry`<`DagJWSResult`\>

___

### getTileID

▸ **getTileID**(`alias`): ``null`` \| `string`

Get the ID of given tile alias, if present in the model.

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

Load a stream commits.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`DagJWSResult`[]\>

___

### loadSchema

▸ **loadSchema**(`id`, `alias?`): `Promise`<`string`\>

Load a schema stream and other schemas it depends on.

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

Extract and load a schema's dependencies.

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `Schema`<`Record`<`string`, `any`\>\> |

#### Returns

`Promise`<`Record`<`string`, `string`[]\>\>

___

### loadStream

▸ **loadStream**(`streamID`): `Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>

Load a stream, ensuring it can be used in a data model.

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamID` | `string` \| `StreamRef` |

#### Returns

`Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>

___

### toJSON

▸ **toJSON**(): `EncodedManagedModel`

Returns the [`JSON-encoded managed model`](../modules/types.md#encodedmanagedmodel) so it can be
easily stored, shared and reused with the [`fromJSON`](devtools.ModelManager.md#fromjson) static method.

#### Returns

`EncodedManagedModel`

___

### useDeployed

▸ **useDeployed**<`T`, `ID`\>(`type`, `alias`, `id`): `Promise`<`string`\>

Load an already deployed stream of the given type from the Ceramic node and add it to the
managed model.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof `UseDeployedIDType` |
| `ID` | `UseDeployedIDType`[`T`] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `T` |
| `alias` | `string` |
| `id` | `ID` |

#### Returns

`Promise`<`string`\>

___

### useDeployedDefinition

▸ **useDeployedDefinition**(`alias`, `id`): `Promise`<`string`\>

Load an already deployed definition stream from the Ceramic node and add it to the managed
model.

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `id` | `string` \| `StreamID` |

#### Returns

`Promise`<`string`\>

___

### useDeployedSchema

▸ **useDeployedSchema**(`alias`, `id`): `Promise`<`string`\>

Load an already deployed schema stream from the Ceramic node and add it to the managed model.

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `id` | `string` \| `StreamRef` |

#### Returns

`Promise`<`string`\>

___

### useDeployedTile

▸ **useDeployedTile**(`alias`, `id`): `Promise`<`string`\>

Load an already deployed tile stream from the Ceramic node and add it to the managed model.

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

Create a ModelManager instance from a
[`JSON-encoded managed model`](../modules/types.md#encodedmanagedmodel).

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`FromJSONParams`](../modules/devtools.md#fromjsonparams) |

#### Returns

[`ModelManager`](devtools.ModelManager.md)
