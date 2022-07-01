import type { CeramicApi, CreateOpts, UpdateOpts } from '@ceramicnetwork/common'
import {
  ModelInstanceDocument,
  type ModelInstanceDocumentMetadata,
} from '@ceramicnetwork/stream-model-instance'
import { type CommitID, StreamID, StreamRef } from '@ceramicnetwork/streamid'
import DataLoader from 'dataloader'
import type { BatchLoadFn } from 'dataloader'

export type DocID = CommitID | StreamID | string

export type CreateOptions = CreateOpts & {
  controller?: string
}

export type UpdateDocOptions = {
  replace?: boolean
  version?: string
}

export type UpdateOptions = UpdateOpts & UpdateDocOptions

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
  #ceramic: CeramicApi
  #useCache: boolean

  constructor(params: DocumentLoaderParams) {
    super(tempBatchLoadFn, {
      cache: true, // Cache needs to be enabled for batching
      cacheKeyFn: idToString,
      cacheMap:
        params.cache != null && typeof params.cache !== 'boolean' ? params.cache : undefined,
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore internal method
    this._batchLoadFn = async (keys: ReadonlyArray<DocID>) => {
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

    this.#ceramic = params.ceramic
    this.#useCache = !!params.cache
  }

  /**
   * Add a ModelInstanceDocument to the local cache, if enabled.
   */
  cache(stream: ModelInstanceDocument): boolean {
    if (!this.#useCache) {
      return false
    }

    const id = stream.id.toString()
    this.clear(id).prime(id, stream)
    return true
  }

  /**
   * Create a new ModelInstanceDocument and add it to the cache, if enabled.
   */
  async create<T extends Record<string, any> = Record<string, any>>(
    model: string | StreamID,
    content: T,
    { controller, ...options }: CreateOptions = {}
  ): Promise<ModelInstanceDocument<T>> {
    const metadata: ModelInstanceDocumentMetadata = {
      controller: controller ?? (this.#ceramic.did?.id as string),
      model: model instanceof StreamID ? model : StreamID.fromString(model),
    }
    const stream = await ModelInstanceDocument.create<T>(this.#ceramic, content, metadata, options)
    this.cache(stream)
    return stream
  }

  /**
   * Load a ModelInstanceDocument from the cache (if enabled) or remotely.
   */
  async load<T extends Record<string, any> = Record<string, any>>(
    id: DocID
  ): Promise<ModelInstanceDocument<T>> {
    return (await super.load(id)) as ModelInstanceDocument<T>
  }

  /**
   * Update a ModelInstanceDocument after loading the stream remotely, bypassing the cache.
   */
  async update<T extends Record<string, any> = Record<string, any>>(
    streamID: string | StreamID,
    content: T,
    { replace, version, ...options }: UpdateOptions = {}
  ): Promise<ModelInstanceDocument<T>> {
    const id = idToString(streamID)
    this.clear(id)
    const stream = await this.load<T>(id)
    if (version != null && stream.commitId.toString() !== version) {
      throw new Error('Stream version mismatch')
    }
    const newContent = replace ? content : { ...stream.content, ...content }
    await stream.replace(newContent, options)
    return stream
  }
}
