/**
 * Batching and caching for Ceramic streams.
 *
 * ## Purpose
 *
 * The `tile-loader` module exports a `TileLoader` providing batching and caching for Tile load and
 * creation in order to improve client-side performance.
 *
 * ## Installation
 *
 * ```sh
 * npm install @glazed/tile-loader
 * ```
 *
 * ## Common use-cases
 *
 * ### Batch stream loads
 *
 * Batching consists in the process of combining multiple concurrent queries to a Ceramic node into
 * a single one.
 *
 * Using a loader instance in the following example, the two streams will be loaded with a single
 * request to the Ceramic node:
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { TileLoader } from '@glazed/tile-loader'
 *
 * const ceramic = new CeramicClient()
 * const loader = new TileLoader({ ceramic })
 *
 * async function loadStreams() {
 *   const [stream1, stream2] = await Promise.all([
 *     loader.load('k2...ab'),
 *     loader.load('k2...cd'),
 *   ])
 * }
 * ```
 *
 * ### Cache loaded streams
 *
 * Caching consists in keeping track of streams loaded from a Ceramic node.
 *
 * Caching is **disabled by default** and **may not be suited for your use-cases**, make sure you
 * carefully consider the trade-offs before enabling it. Streams loaded from the cache may be out
 * of date from the state on the Ceramic network, so applications should be designed accordingly.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { TileLoader } from '@glazed/tile-loader'
 *
 * const ceramic = new CeramicClient()
 * const loader = new TileLoader({ ceramic, cache: true })
 *
 * async function loadStream() {
 *   // Load the stream at some point in your app
 *   const stream = await loader.load('k2...ab')
 * }
 *
 * async function alsoLoadStream() {
 *   // Maybe the same stream needs to be loaded at a different time or in another part of your app
 *   const streamAgain = await loader.load('k2...ab')
 * }
 * ```
 *
 * ### Use a custom cache
 *
 * When setting the `cache` option to `true` in the loader constructor, the cache will live as long
 * as the loader instance. This means any individual stream will only ever get loaded once, and
 * persist in memory until the loader instance is deleted.
 *
 * It is possible to provide a custom cache implementation in the loader constructor to customize
 * this behavior, for example in order to limit memory usage by restricting the number of streams
 * kept in the cache, or discarding loaded streams after a given period of time.
 *
 * A custom cache must implement a subset of the `Map` interface, defined by the
 * {@linkcode TileCache} interface.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { TileLoader } from '@glazed/tile-loader'
 *
 * const ceramic = new CeramicClient()
 * // The cache must implement a subset of the Map interface
 * const cache = new Map()
 * const loader = new TileLoader({ ceramic, cache })
 *
 * async function load(id) {
 *   // The loader will cache the request as soon as the load() method is called, so the stored
 *   // value is a Promise of a TileDocument
 *   return await loader.load(id)
 * }
 *
 * function getFromCache(id) {
 *   return cache.get(id) // Promise<TileDocument>
 * }
 * ```
 *
 * ### Create and cache a stream
 *
 * The `create` method adss the created stream to the internal cache of the loader. This has no
 * effect if the cache is disabled.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { TileLoader } from '@glazed/tile-loader'
 *
 * const ceramic = new CeramicClient()
 * const loader = new TileLoader({ ceramic, cache: true })
 *
 * async function createAndLoad() {
 *   const stream = await loader.create({ hello: world })
 *   // The following call will returne the stream from the cache
 *   await loader.load(stream.id)
 * }
 * ```
 *
 * ### Load a deterministic stream
 *
 * Using the `deterministic` method of a loader instance allows to load such streams while
 * benefiting from the batching and caching functionalities of the loader.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { TileLoader } from '@glazed/tile-loader'
 *
 * const ceramic = new CeramicClient()
 * const loader = new TileLoader({ ceramic, cache: true })
 *
 * async function load() {
 *   // The following call will load the latest version of the stream based on its metadata
 *   const stream = await loader.deterministic({ controllers: ['did:key:...'], family: 'test' })
 * }
 * ```
 *
 * @module tile-loader
 */

// Polyfill setImmediate for browsers not supporting it - see https://github.com/graphql/dataloader/issues/249
import 'setimmediate'
import type {
  CeramicApi,
  CeramicSigner,
  CreateOpts,
  GenesisCommit,
  MultiQuery,
} from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'
import { CommitID, StreamID, StreamRef } from '@ceramicnetwork/streamid'
import DataLoader from 'dataloader'

/**
 * Omit `path` and `atTime` from [MultiQuery](https://developers.ceramic.network/reference/typescript/interfaces/_ceramicnetwork_common.multiquery-1.html) as the cache needs to be deterministic based on the ID.
 */
export type TileQuery = Omit<MultiQuery, 'paths' | 'atTime'>

export type TileKey = CommitID | StreamID | TileQuery | string

// Implements CacheMap from dataloader, copied here to generate docs
export type TileCache = {
  /**
   * get a Promise of a TileDocument by its stream ID
   */
  get(id: string): Promise<TileDocument> | void
  /**
   * set a Promise of a TileDocument by its stream ID
   */
  set(id: string, value: Promise<TileDocument>): any
  /**
   * remove a specific entry from the cache
   */
  delete(id: string): any
  /**
   * remove all entries from the cache
   */
  clear(): any
}

export type TileLoaderParams = {
  /**
   * A Ceramic client instance
   */
  ceramic: CeramicApi
  /**
   * A supported cache implementation, `true` to use the default implementation or `false` to disable the cache (default)
   */
  cache?: TileCache | boolean
}

/** @internal */
export function keyToQuery(key: TileKey): TileQuery {
  return typeof key === 'string' || CommitID.isInstance(key) || StreamID.isInstance(key)
    ? { streamId: key }
    : { streamId: key.streamId, genesis: key.genesis }
}

/** @internal */
export function keyToString(key: TileKey): string {
  if (typeof key === 'string') {
    // Convert possible URL input to string representation to match returned keys format
    return StreamRef.from(key).toString()
  }
  if (CommitID.isInstance(key) || StreamID.isInstance(key)) {
    return key.toString()
  }
  return key.streamId.toString()
}

/**
 * Create a {@linkcode TileQuery} for a determinitic TileDocument based on its metadata.
 */
export async function getDeterministicQuery(metadata: TileMetadataArgs): Promise<TileQuery> {
  const genesis = (await TileDocument.makeGenesis({} as unknown as CeramicSigner, null, {
    ...metadata,
    deterministic: true,
  })) as GenesisCommit
  const streamId = await StreamID.fromGenesis('tile', genesis)
  return { genesis, streamId }
}

/**
 * A TileLoader extends [DataLoader](https://github.com/graphql/dataloader) to provide batching and caching functionalities for loading TileDocument streams.
 */
export class TileLoader extends DataLoader<TileKey, TileDocument> {
  #ceramic: CeramicApi
  #useCache: boolean

  constructor(params: TileLoaderParams) {
    super(
      async (keys) => {
        if (!params.cache) {
          // Disable cache but keep batching behavior - from https://github.com/graphql/dataloader#disabling-cache
          this.clearAll()
        }
        const results = await params.ceramic.multiQuery(keys.map(keyToQuery))
        return keys.map((key) => {
          const id = keyToString(key)
          const doc = results[id]
          return doc ? (doc as TileDocument) : new Error(`Failed to load stream: ${id}`)
        })
      },
      {
        cache: true, // Cache needs to be enabled for batching
        cacheKeyFn: keyToString,
        cacheMap:
          params.cache != null && typeof params.cache !== 'boolean' ? params.cache : undefined,
      }
    )

    this.#ceramic = params.ceramic
    this.#useCache = !!params.cache
  }

  /**
   * Add a TileDocument to the local cache if enabled.
   */
  cache(stream: TileDocument): boolean {
    if (!this.#useCache) {
      return false
    }

    const id = stream.id.toString()
    this.clear(id).prime(id, stream)
    return true
  }

  /**
   * Create a new TileDocument and add it to the cache if enabled.
   */
  async create<T extends Record<string, any> = Record<string, any>>(
    content: T,
    metadata?: TileMetadataArgs,
    options?: CreateOpts
  ): Promise<TileDocument<T>> {
    const stream = await TileDocument.create<T>(this.#ceramic, content, metadata, options)
    this.cache(stream)
    return stream
  }

  /**
   * Create or load a deterministic TileDocument based on its metadata.
   */
  async deterministic<T extends Record<string, any> = Record<string, any>>(
    metadata: TileMetadataArgs,
    options?: CreateOpts
  ): Promise<TileDocument<T | null | undefined>> {
    const query = await getDeterministicQuery(metadata)
    try {
      return (await super.load(query)) as TileDocument<T | null | undefined>
    } catch (err) {
      const stream = await TileDocument.createFromGenesis<T>(
        this.#ceramic,
        query.genesis as GenesisCommit,
        options
      )
      this.cache(stream)
      return stream
    }
  }

  /**
   * Load a TileDocument from the cache (if enabled) or remotely.
   */
  async load<T extends Record<string, any> = Record<string, any>>(
    key: TileKey
  ): Promise<TileDocument<T>> {
    return (await super.load(key)) as TileDocument<T>
  }
}
