# Module: did-datastore

```sh
npm install @glazed/did-datastore
```

## Classes

- [DIDDataStore](../classes/did_datastore.DIDDataStore.md)

## Type aliases

### CreateOptions

Ƭ **CreateOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `controller?` | `string` | Optional controller for the record |
| `pin?` | `boolean` | Pin the created record stream (default) |

___

### DIDDataStoreParams

Ƭ **DIDDataStoreParams**<`ModelTypes`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` = `ModelTypeAliases` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `autopin?` | `boolean` | Pin all created records streams (default) |
| `cache?` | `TileCache` \| `boolean` | [`TileLoader`](../classes/tile_loader.TileLoader.md) cache parameter, only used if `loader` is not provided |
| `ceramic` | `CeramicApi` | A Ceramic client instance |
| `id?` | `string` | Fallback DID to use when not explicitly set in method calls |
| `loader?` | `TileLoader` | An optional [`TileLoader`](../classes/tile_loader.TileLoader.md) instance to use |
| `model` | `DataModel`<`ModelTypes`\> \| `ModelTypesToAliases`<`ModelTypes`\> | A [`DataModel`](../classes/datamodel.DataModel.md) instance or runtime model aliases to use |

___

### DefinitionContentType

Ƭ **DefinitionContentType**<`ModelTypes`, `Alias`\>: `ModelTypes`[``"schemas"``][`ModelTypes`[``"definitions"``][`Alias`]]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` |
| `Alias` | extends keyof `ModelTypes`[``"definitions"``] |

___

### DefinitionWithID

Ƭ **DefinitionWithID**<`Config`\>: `Definition`<`Config`\> & { `id`: `StreamID`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Config` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

___

### DefinitionsContentTypes

Ƭ **DefinitionsContentTypes**<`ModelTypes`, `Fallback`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` |
| `Fallback` | `Record`<`string`, `unknown`\> |

#### Index signature

▪ [Key: `string`]: typeof `Key` extends keyof `ModelTypes`[``"definitions"``] ? [`DefinitionContentType`](did_datastore.md#definitioncontenttype)<`ModelTypes`, typeof `Key`\> : `Fallback`

___

### Entry

Ƭ **Entry**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | Record ID (Ceramic StreamID) |
| `key` | `string` | Key (definition ID) identifying the record ID in the index |
| `record` | `unknown` | Record contents |

## Functions

### assertDIDstring

▸ **assertDIDstring**(`did`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`void`

___

### isDIDstring

▸ **isDIDstring**(`did`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`boolean`
