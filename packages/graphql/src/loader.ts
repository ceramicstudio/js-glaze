import type { CeramicApi } from '@ceramicnetwork/common'
import { type CommitID, type StreamID, StreamRef } from '@ceramicnetwork/streamid'
import type { ModelInstanceDocument } from '@glazed/types'
import DataLoader from 'dataloader'
import type { BatchLoadFn } from 'dataloader'

export type DocID = CommitID | StreamID | string

// Implements CacheMap from dataloader, copied here to generate docs
export type DocumentCache = {
  /**
   * Get a Promise of a ModelInstanceDocument by its stream ID
   */
  get(id: string): Promise<ModelInstanceDocument> | void
  /**
   * Set a Promise of a ModelInstanceDocument by its stream ID
   */
  set(id: string, value: Promise<ModelInstanceDocument>): any
  /**
   * Remove a specific entry from the cache
   */
  delete(id: string): any
  /**
   * Remove all entries from the cache
   */
  clear(): any
}

export type DocumentLoaderParams = {
  /**
   * A Ceramic client instance
   */
  ceramic: CeramicApi
  /**
   * A supported cache implementation, `true` to use the default implementation or `false` to
   * disable the cache (default)
   */
  cache?: DocumentCache | boolean
  /**
   * MultiQuery request timeout in milliseconds
   */
  multiqueryTimeout?: number
}

/** @internal */
export function idToString(id: DocID): string {
  return typeof id === 'string' ? StreamRef.from(id).toString() : id.toString()
}

const tempBatchLoadFn: BatchLoadFn<DocID, ModelInstanceDocument> = () => Promise.resolve([])

export class DocumentLoader extends DataLoader<DocID, ModelInstanceDocument> {
  // #ceramic: CeramicApi
  // #useCache: boolean

  constructor(params: DocumentLoaderParams) {
    super(tempBatchLoadFn, {
      cache: true, // Cache needs to be enabled for batching
      cacheKeyFn: idToString,
      cacheMap:
        params.cache != null && typeof params.cache !== 'boolean' ? params.cache : undefined,
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore internal method
    this._batchLoadFn = async (keys: ReadonlyArray<TileKey>) => {
      if (!params.cache) {
        // Disable cache but keep batching behavior - from https://github.com/graphql/dataloader#disabling-cache
        this.clearAll()
      }
      const results = await params.ceramic.multiQuery(
        keys.map(idToString).map((streamId) => ({ streamId })),
        params.multiqueryTimeout
      )
      return keys.map((key) => {
        const id = idToString(key)
        const doc = results[id]
        return doc
          ? (doc as unknown as ModelInstanceDocument)
          : new Error(`Failed to load document: ${id}`)
      })
    }

    // this.#ceramic = params.ceramic
    // this.#useCache = !!params.cache
  }

  /**
   * Add a TileDocument to the local cache, if enabled.
   */
  // cache(stream: TileDocument): boolean {
  //   if (!this.#useCache) {
  //     return false
  //   }

  //   const id = stream.id.toString()
  //   this.clear(id).prime(id, stream)
  //   return true
  // }

  /**
   * Create a new TileDocument and add it to the cache, if enabled.
   */
  // async create<T extends Record<string, any> = Record<string, any>>(
  //   content: T,
  //   metadata?: TileMetadataArgs,
  //   options?: CreateOpts
  // ): Promise<TileDocument<T>> {
  //   const stream = await TileDocument.create<T>(this.#ceramic, content, metadata, options)
  //   this.cache(stream)
  //   return stream
  // }

  /**
   * Load a ModelInstanceDocument from the cache (if enabled) or remotely.
   */
  async load<T extends Record<string, any> = Record<string, any>>(
    id: DocID
  ): Promise<ModelInstanceDocument<T>> {
    return (await super.load(id)) as ModelInstanceDocument<T>
  }

  /**
   * Update a TileDocument after loading the stream remotely, bypassing the cache.
   */
  // async update<T extends Record<string, any> = Record<string, any>>(
  //   streamID: string | StreamID,
  //   content?: T,
  //   metadata?: TileMetadataArgs,
  //   options?: UpdateOpts
  // ): Promise<TileDocument<T | null | undefined>> {
  //   const id = keyToString(streamID)
  //   this.clear(id)
  //   const stream = await this.load<T>({ streamId: id })
  //   await stream.update(content, metadata, options)
  //   return stream
  // }
}
