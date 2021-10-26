# Module: tile-loader

```sh
npm install @glazed/tile-loader
```

## Classes

- [TileLoader](../classes/tile_loader.TileLoader.md)

## Type aliases

### Cache

Ƭ **Cache**: `CacheMap`<`string`, `Promise`<`TileDocument`\>\>

___

### Key

Ƭ **Key**: `CommitID` \| `StreamID` \| [`Query`](tile_loader.md#query) \| `string`

___

### Query

Ƭ **Query**: `Omit`<`MultiQuery`, ``"paths"`` \| ``"atTime"``\>

___

### TileLoaderParams

Ƭ **TileLoaderParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cache?` | [`Cache`](tile_loader.md#cache) \| `boolean` |
| `ceramic` | `CeramicApi` |
