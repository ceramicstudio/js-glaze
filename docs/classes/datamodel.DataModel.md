# Class: DataModel<ModelTypes, ModelAliases\>

[datamodel](../modules/datamodel.md).DataModel

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

#### Returns

`ModelAliases`

___

### loader

• `get` **loader**(): `TileLoader`

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
