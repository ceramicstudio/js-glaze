# Class: TileLoader

[tile-loader](../modules/tile_loader.md).TileLoader

A TileLoader extends [DataLoader](https://github.com/graphql/dataloader) to provide
batching and caching functionalities for loading TileDocument streams.

It is exported by the [`tile-loader`](../modules/tile_loader.md) module.

```sh
import { TileLoader } from '@glazed/tile-loader'
```

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

### cache

▸ **cache**(`stream`): `boolean`

Add a TileDocument to the local cache, if enabled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `stream` | `TileDocument`<`Record`<`string`, `any`\>\> |

#### Returns

`boolean`

___

### create

▸ **create**<`T`\>(`content`, `metadata?`, `options?`): `Promise`<`TileDocument`<`T`\>\>

Create a new TileDocument and add it to the cache, if enabled.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> = `Record`<`string`, `any`\> |

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

▸ **deterministic**<`T`\>(`metadata`, `options?`): `Promise`<`TileDocument`<`undefined` \| ``null`` \| `T`\>\>

Create or load a deterministic TileDocument based on its metadata.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> = `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadata` | `TileMetadataArgs` |
| `options?` | `CreateOpts` |

#### Returns

`Promise`<`TileDocument`<`undefined` \| ``null`` \| `T`\>\>

___

### load

▸ **load**<`T`\>(`key`): `Promise`<`TileDocument`<`T`\>\>

Load a TileDocument from the cache (if enabled) or remotely.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> = `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`TileKey`](../modules/tile_loader.md#tilekey) |

#### Returns

`Promise`<`TileDocument`<`T`\>\>

#### Overrides

DataLoader.load

___

### update

▸ **update**<`T`\>(`streamID`, `content?`, `metadata?`, `options?`): `Promise`<`TileDocument`<`undefined` \| ``null`` \| `T`\>\>

Update a TileDocument after loading the stream remotely, bypassing the cache.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> = `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamID` | `string` \| `StreamID` |
| `content?` | `T` |
| `metadata?` | `TileMetadataArgs` |
| `options?` | `UpdateOpts` |

#### Returns

`Promise`<`TileDocument`<`undefined` \| ``null`` \| `T`\>\>
