# Class: DataModel<ModelTypes, ModelAliases\>

[datamodel](../modules/datamodel.md).DataModel

The DataModel runtime provides APIs for interacting with datamodel aliases in applications and
libraries. The [`ModelManager`](devtools.ModelManager.md) provides complementary APIs for
managing datamodels during development.

It is exported by the [`datamodel`](../modules/datamodel.md) module.

```sh
import { DataModel } from '@glazed/datamodel'
```

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` |
| `ModelAliases` | extends `ModelTypesToAliases`<`ModelTypes`\> = `ModelTypesToAliases`<`ModelTypes`\> |

## Constructors

### constructor

• **new DataModel**<`ModelTypes`, `ModelAliases`\>(`params`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |
| `ModelAliases` | extends `ModelTypesToAliases`<`ModelTypes`\> = `ModelTypesToAliases`<`ModelTypes`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`DataModelParams`](../modules/datamodel.md#datamodelparams)<`ModelAliases`\> |

## Accessors

### aliases

• `get` **aliases**(): `ModelAliases`

[`Model aliases`](../modules/types.md#modelaliases) provided in constructor.

#### Returns

`ModelAliases`

___

### loader

• `get` **loader**(): `TileLoader`

[`TileLoader`](tile_loader.TileLoader.md) instance used internally.

#### Returns

`TileLoader`

## Methods

### createTile

▸ **createTile**<`Alias`, `ContentType`\>(`schemaAlias`, `content`, `options?`): `Promise`<`TileDocument`<`ContentType`\>\>

Create a TileDocument using a schema identified by the given `schemaAlias`.

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
| `options` | [`CreateOptions`](../modules/datamodel.md#createoptions) |

#### Returns

`Promise`<`TileDocument`<`ContentType`\>\>

___

### getDefinitionID

▸ **getDefinitionID**<`Alias`\>(`alias`): ``null`` \| `string`

Returns the definition stream ID for a given alias, if present in local model aliases.

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

___

### getSchemaURL

▸ **getSchemaURL**<`Alias`\>(`alias`): ``null`` \| `string`

Returns the schema stream URL for a given alias, if present in local model aliases.

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

___

### getTileID

▸ **getTileID**<`Alias`\>(`alias`): ``null`` \| `string`

Returns the tile stream ID for a given alias, if present in local model aliases.

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

___

### loadTile

▸ **loadTile**<`Alias`, `ContentType`\>(`alias`): `Promise`<``null`` \| `TileDocument`<`ContentType`\>\>

Load the TileDocument identified by the given `alias`.

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
