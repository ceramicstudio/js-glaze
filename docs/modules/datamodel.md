# Module: datamodel

Aliases for Ceramic stream references.

## Purpose

The `datamodel` module exports a `DataModel` class for **runtime** interactions with a published
data model, using aliases for Ceramic stream IDs.

## Installation

```sh
npm install @glazed/datamodel
```

## Common use-cases

### Get the ID of a known alias

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'

const ceramic = new CeramicClient()
const publishedModel = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {
    myDefinition: 'k2...ef',
  },
  tiles: {},
}
const model = new DataModel({ ceramic, model: publishedModel })

function getMySchemaURL() {
  return model.getSchemaURL('MySchema') // 'ceramic://k2...ab'
}

function getMyDefinitionID() {
  return model.getDefinitionID('myDefinition') // 'k2...ef'
}
```

### Load a tile by alias

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'

const ceramic = new CeramicClient()
const publishedModel = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {},
  tiles: {
    myTile: 'k2...cd',
  },
}
const model = new DataModel({ ceramic, model: publishedModel })

async function loadMyTile() {
  return await model.loadTile('myTile')
}
```

### Create a tile with a schema alias

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'

const ceramic = new CeramicClient()
const publishedModel = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {},
  tiles: {},
}
const model = new DataModel({ ceramic, model: publishedModel })

async function createTileWithMySchema(content) {
  return await model.createTile('MySchema', content)
}
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
