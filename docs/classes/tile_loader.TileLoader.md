# Class: TileLoader

[tile-loader](../modules/tile_loader.md).TileLoader

## Hierarchy

- `DataLoader`<[`Key`](../modules/tile_loader.md#key), `TileDocument`\>

  ↳ **`TileLoader`**

## Constructors

### constructor

• **new TileLoader**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`TileLoaderParams`](../modules/tile_loader.md#tileloaderparams) |

#### Overrides

DataLoader&lt;Key, TileDocument\&gt;.constructor

## Methods

### create

▸ **create**<`T`\>(`content`, `metadata?`, `options?`): `Promise`<`TileDocument`<`T`\>\>

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

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\>`Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`Key`](../modules/tile_loader.md#key) |

#### Returns

`Promise`<`TileDocument`<`T`\>\>

#### Overrides

DataLoader.load
