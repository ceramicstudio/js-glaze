# Module: tile-loader

Batching and caching for Ceramic streams.

## Purpose

The `tile-loader` module exports a `TileLoader` class providing batching and caching for Tile
load and creation in order to improve client-side performance.

## Installation

```sh
npm install @glazed/tile-loader
```

## Common use-cases

### Batch stream loads

Batching consists in the process of combining multiple concurrent queries to a Ceramic node into
a single one.

Using a loader instance in the following example, the two streams will be loaded with a single
request to the Ceramic node:

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileLoader } from '@glazed/tile-loader'

const ceramic = new CeramicClient()
const loader = new TileLoader({ ceramic })

async function loadStreams() {
  const [stream1, stream2] = await Promise.all([
    loader.load('k2...ab'),
    loader.load('k2...cd'),
  ])
}
```

### Cache loaded streams

Caching consists in keeping track of streams loaded from a Ceramic node.

Caching is **disabled by default** and **may not be suited for your use-cases**, make sure you
carefully consider the trade-offs before enabling it. Streams loaded from the cache may be out
of date from the state on the Ceramic network, so applications should be designed accordingly.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileLoader } from '@glazed/tile-loader'

const ceramic = new CeramicClient()
const loader = new TileLoader({ ceramic, cache: true })

async function loadStream() {
  // Load the stream at some point in your app
  const stream = await loader.load('k2...ab')
}

async function alsoLoadStream() {
  // Maybe the same stream needs to be loaded at a different time or in another part of your app
  const streamAgain = await loader.load('k2...ab')
}
```

### Use a custom cache

When setting the `cache` option to `true` in the loader constructor, the cache will live as long
as the loader instance. This means any individual stream will only ever get loaded once, and
persist in memory until the loader instance is deleted.

It is possible to provide a custom cache implementation in the loader constructor to customize
this behavior, for example in order to limit memory usage by restricting the number of streams
kept in the cache, or discarding loaded streams after a given period of time.

A custom cache must implement a subset of the `Map` interface, defined by the
[`TileCache`](tile_loader.md#tilecache) interface.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileLoader } from '@glazed/tile-loader'

const ceramic = new CeramicClient()
// The cache must implement a subset of the Map interface
const cache = new Map()
const loader = new TileLoader({ ceramic, cache })

async function load(id) {
  // The loader will cache the request as soon as the load() method is called, so the stored
  // value is a Promise of a TileDocument
  return await loader.load(id)
}

function getFromCache(id) {
  return cache.get(id) // Promise<TileDocument>
}
```

### Create and cache a stream

The `create` method adss the created stream to the internal cache of the loader. This has no
effect if the cache is disabled.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileLoader } from '@glazed/tile-loader'

const ceramic = new CeramicClient()
const loader = new TileLoader({ ceramic, cache: true })

async function createAndLoad() {
  const stream = await loader.create({ hello: world })
  // The following call will returne the stream from the cache
  await loader.load(stream.id)
}
```

### Load a deterministic stream

Using the `deterministic` method of a loader instance allows to load such streams while
benefiting from the batching and caching functionalities of the loader.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileLoader } from '@glazed/tile-loader'

const ceramic = new CeramicClient()
const loader = new TileLoader({ ceramic, cache: true })

async function load() {
  // The following call will load the latest version of the stream based on its metadata
  const stream = await loader.deterministic({ controllers: ['did:key:...'], family: 'test' })
}
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
