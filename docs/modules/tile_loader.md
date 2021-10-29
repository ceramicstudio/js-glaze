# Module: tile-loader

```sh
npm install @glazed/tile-loader
```

## Classes

- [TileLoader](../classes/tile_loader.TileLoader.md)

## Type aliases

### TileCache

Ƭ **TileCache**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `clear` | () => `any` |
| `delete` | (`id`: `string`) => `any` |
| `get` | (`id`: `string`) => `void` \| `Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\> |
| `set` | (`id`: `string`, `value`: `Promise`<`TileDocument`<`Record`<`string`, `any`\>\>\>) => `any` |

___

### TileKey

Ƭ **TileKey**: `CommitID` \| `StreamID` \| [`TileQuery`](tile_loader.md#tilequery) \| `string`

___

### TileLoaderParams

Ƭ **TileLoaderParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cache?` | [`TileCache`](tile_loader.md#tilecache) \| `boolean` | A supported cache implementation, `true` to use the default implementation or `false` to disable the cache (default) |
| `ceramic` | `CeramicApi` | A Ceramic client instance |

___

### TileQuery

Ƭ **TileQuery**: `Omit`<`MultiQuery`, ``"paths"`` \| ``"atTime"``\>

Omit `path` and `atTime` from [MultiQuery](https://developers.ceramic.network/reference/typescript/interfaces/_ceramicnetwork_common.multiquery-1.html) as the cache needs to be deterministic based on the ID.

## Functions

### getDeterministicQuery

▸ **getDeterministicQuery**(`metadata`): `Promise`<[`TileQuery`](tile_loader.md#tilequery)\>

Create a [`TileQuery`](tile_loader.md#tilequery) for a determinitic TileDocument based on its metadata.

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadata` | `TileMetadataArgs` |

#### Returns

`Promise`<[`TileQuery`](tile_loader.md#tilequery)\>
