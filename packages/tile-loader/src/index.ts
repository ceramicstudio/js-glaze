/**
 * ```sh
 * npm install @glazed/tile-loader
 * ```
 *
 * @module tile-loader
 */

import type { CeramicApi, CreateOpts, GenesisCommit, MultiQuery } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'
import { CommitID, StreamID, StreamRef } from '@ceramicnetwork/streamid'
import DataLoader from 'dataloader'
import type { CacheMap } from 'dataloader'

/**
 * Omit `path` and `atTime` from [MultiQuery](https://developers.ceramic.network/reference/typescript/interfaces/_ceramicnetwork_common.multiquery-1.html) as the cache needs to be deterministic based on the ID.
 */
export type TileQuery = Omit<MultiQuery, 'paths' | 'atTime'>

export type TileKey = CommitID | StreamID | TileQuery | string

export type TileCache = CacheMap<string, Promise<TileDocument>>

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
    this.#useCache = params.cache !== false
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
    if (this.#useCache) {
      this.prime(stream.id.toString(), stream)
    }
    return stream
  }

  /**
   * Create or load a deterministic TileDocument based on its metadata.
   */
  async deterministic<T extends Record<string, any> = Record<string, any>>(
    metadata: TileMetadataArgs
  ): Promise<TileDocument<T | null | undefined>> {
    const genesis = (await TileDocument.makeGenesis({} as any, null, {
      ...metadata,
      deterministic: true,
    })) as GenesisCommit
    const streamId = await StreamID.fromGenesis('tile', genesis)
    return (await super.load({ streamId, genesis })) as TileDocument<T | null | undefined>
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
