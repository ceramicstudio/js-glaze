# Class: TileLoader

[tile-loader](../modules/tile_loader.md).TileLoader

A TileLoader extends [DataLoader](https://github.com/graphql/dataloader) to provide batching and caching functionalities for loading TileDocument streams.

## Hierarchy

- `DataLoader`<[`TileKey`](../modules/tile_loader.md#tilekey), `TileDocument`\>

  ↳ **`TileLoader`**

## Constructors

### constructor

• **new TileLoader**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`TileLoaderParams`](../modules/tile_loader.md#tileloaderparams) |

#### Overrides

DataLoader&lt;TileKey, TileDocument\&gt;.constructor

## Methods

### create

▸ **create**<`T`\>(`content`, `metadata?`, `options?`): `Promise`<`TileDocument`<`T`\>\>

Create a new TileDocument and add it to the cache if enabled.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\>`Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `T` |
| `metadata?` | `TileMetadataArgs` |
| `options?` | `CreateOpts` |

#### Returns

`Promise`<`TileDocument`<`T`\>\>

___

### deterministic

▸ **deterministic**<`T`\>(`metadata`): `Promise`<`TileDocument`<`undefined` \| ``null`` \| `T`\>\>

Create or load a deterministic TileDocument based on its metadata.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\>`Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadata` | `TileMetadataArgs` |

#### Returns

`Promise`<`TileDocument`<`undefined` \| ``null`` \| `T`\>\>

___

### load

▸ **load**<`T`\>(`key`): `Promise`<`TileDocument`<`T`\>\>

Load a TileDocument from the cache (if enabled) or remotely.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\>`Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`TileKey`](../modules/tile_loader.md#tilekey) |

#### Returns

`Promise`<`TileDocument`<`T`\>\>

#### Overrides

DataLoader.load
