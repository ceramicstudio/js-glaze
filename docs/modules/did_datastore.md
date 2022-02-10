# Module: did-datastore

Associate data records to a DID.

## Purpose

The `did-datastore` module exports a `DIDDataStore` class allowing to associate Ceramic tiles to
a DID in a deterministic way by implementing the Identity Index (IDX) protocol described in the
[CIP-11 specification](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-11/CIP-11.md).

## Installation

```sh
npm install @glazed/did-datastore
```

## Common use-cases

### Read the contents of a record

The [`DIDDataStore`](../classes/did_datastore.DIDDataStore.md) instance uses a [`DataModel`](../classes/datamodel.DataModel.md) instance
to support aliases for definitions.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'

const ceramic = new CeramicClient()
const aliases = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {
    myDefinition: 'k2...ef',
  },
  tiles: {},
}
const model = new DataModel({ ceramic, aliases })
const dataStore = new DIDDataStore({ ceramic, model })

async function getMyDefinitionRecord(did) {
  return await dataStore.get('myDefinition', did)
}
```

### Use a published model object

Instead of using a [`DataModel`](../classes/datamodel.DataModel.md) instance, it is possible to provide
a published model aliases object directly.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DIDDataStore } from '@glazed/did-datastore'

const ceramic = new CeramicClient()
const aliases = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {
    myDefinition: 'k2...ef',
  },
  tiles: {},
}
const dataStore = new DIDDataStore({ ceramic, model: aliases })

async function getMyDefinitionRecord(did) {
  return await dataStore.get('myDefinition', did)
}
```

### Use a TileLoader instance

The [`DIDDataStore`](../classes/did_datastore.DIDDataStore.md) instance uses a [`TileLoader`](../classes/tile_loader.TileLoader.md)
instance internally to batch queries. It is possible to provide an instance to use instead, for
example to share it with other functions.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DIDDataStore } from '@glazed/did-datastore'
import { TileLoader } from '@glazed/tile-loader'

const ceramic = new CeramicClient()
const loader = new TileLoader({ ceramic })
const aliases = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {
    myDefinition: 'k2...ef',
  },
  tiles: {},
}
const dataStore = new DIDDataStore({ ceramic, loader, model: aliases })

async function getMyDefinitionRecord(did) {
  return await dataStore.get('myDefinition', did)
}
```

### Set the contents of a record

It is possible to set the contents of a record when the Ceramic instance is authenticated using
the [`set`](../classes/did_datastore.DIDDataStore.md#set) method.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DIDDataStore } from '@glazed/did-datastore'

const ceramic = new CeramicClient()
const aliases = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {
    myDefinition: 'k2...ef',
  },
  tiles: {},
}
const dataStore = new DIDDataStore({ ceramic, model: aliases })

async function setMyDefinitionRecord(content) {
  // This will throw an error if the Ceramic instance is not authenticated
  return await dataStore.set('myDefinition', content)
}
```

### Merge the contents of a record

Rather than completely replacing the contents of a record using the `set` method, the
[`merge`](../classes/did_datastore.DIDDataStore.md#merge) method can be used to only replace the specified fields.

The `merge` method only applies a shallow (one level) replacement, if you need a deep merge or
more complex logic, you should implement it directly using the [`get`](../classes/did_datastore.DIDDataStore.md#get)
and [`set`](../classes/did_datastore.DIDDataStore.md#set) methods.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DIDDataStore } from '@glazed/did-datastore'

const ceramic = new CeramicClient()
const aliases = {
 schemas: {
    MySchema: 'ceramic://k2...ab',
  },
  definitions: {
    myDefinition: 'k2...ef',
  },
  tiles: {},
}
const dataStore = new DIDDataStore({ ceramic, model: aliases })

async function setMyDefinitionRecord(content) {
  // This will only replace the fields present in the input `content` object, other fields
  // already present in the record will not be affected
  return await dataStore.merge('myDefinition', content)
}
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
