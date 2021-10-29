# Module: datamodel

```sh
npm install @glazed/datamodel
```

## Classes

- [DataModel](../classes/datamodel.DataModel.md)

## Type aliases

### CreateOptions

Ƭ **CreateOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `pin?` | `boolean` | Pin the created stream (default) |

___

### DataModelParams

Ƭ **DataModelParams**<`Model`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `Model` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `autopin?` | `boolean` | Pin all created streams (default) |
| `cache?` | `TileCache` \| `boolean` | [`TileLoader`](../classes/tile_loader.TileLoader.md) cache parameter, only used if `loader` is not provided |
| `ceramic?` | `CeramicApi` | A Ceramic client instance, only used if `loader` is not provided |
| `loader?` | `TileLoader` | A [`TileLoader`](../classes/tile_loader.TileLoader.md) instance to use, must be provided if `ceramic` is not provided |
| `model` | `Model` | The runtime model aliases to use |
