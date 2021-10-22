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
import { CommitID, StreamID } from '@ceramicnetwork/streamid'
import DataLoader from 'dataloader'
import type { CacheMap } from 'dataloader'

type Query = Omit<MultiQuery, 'paths'>
type Key = CommitID | StreamID | Query | string

export type TileLoaderParams = {
  ceramic: CeramicApi
  cache?: CacheMap<string, Promise<TileDocument>> | boolean
}

export function keyToQuery(key: Key): Query {
  return typeof key === 'string' || CommitID.isInstance(key) || StreamID.isInstance(key)
    ? { streamId: key }
    : { streamId: key.streamId, genesis: key.genesis }
}

export function keyToString(key: Key): string {
  if (typeof key === 'string') {
    return key
  }
  if (CommitID.isInstance(key) || StreamID.isInstance(key)) {
    return key.toString()
  }
  return key.streamId.toString()
}

export class TileLoader extends DataLoader<Key, TileDocument> {
  #ceramic: CeramicApi
  #useCache: boolean

  constructor(params: TileLoaderParams) {
    super(
      async (keys) => {
        if (params.cache === false) {
          // Disable cache but keep batching behavior
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

  async deterministic<T extends Record<string, any> = Record<string, any>>(
    metadata: TileMetadataArgs
  ): Promise<TileDocument<T | null | undefined>> {
    const genesis = (await TileDocument.makeGenesis({} as any, null, metadata)) as GenesisCommit
    const streamId = await StreamID.fromGenesis('tile', genesis)
    return (await super.load({ streamId, genesis })) as TileDocument<T | null | undefined>
  }

  async load<T extends Record<string, any> = Record<string, any>>(
    key: Key
  ): Promise<TileDocument<T>> {
    return (await super.load(key)) as TileDocument<T>
  }
}
