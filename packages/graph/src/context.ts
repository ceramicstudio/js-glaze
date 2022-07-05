import type { BaseQuery, CeramicApi } from '@ceramicnetwork/common'
import type { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import type { Connection } from 'graphql-relay'

import { type ConnectionQuery, queryConnection, querySingle } from './query.js'
import { type DocumentCache, DocumentLoader, type UpdateDocOptions } from './loader.js'

export type ContextParams = {
  /**
   * Optional cache for documents.
   */
  cache?: DocumentCache | boolean
  /**
   * Ceramic client instance.
   */
  ceramic: CeramicApi
  /**
   * @internal
   */
  loader?: DocumentLoader
}

/**
 * GraphQL execution context, exported by the {@linkcode graph} module.
 *
 * ```sh
 * import { Context } from '@glazed/graph'
 * ```
 */
export class Context {
  #ceramic: CeramicApi
  #loader: DocumentLoader

  constructor(params: ContextParams) {
    const { cache, ceramic } = params
    this.#ceramic = ceramic
    this.#loader = params.loader ?? new DocumentLoader({ ceramic, cache })
  }

  /**
   * Returns whether the Ceramic client instance used internally is authenticated or not. When not
   * authenticated, mutations will fail.
   */
  get authenticated(): boolean {
    return this.#ceramic.did?.authenticated ?? false
  }

  /**
   * Ceramic client instance used internally.
   */
  get ceramic(): CeramicApi {
    return this.#ceramic
  }

  /**
   * Document loader instance used internally.
   */
  get loader(): DocumentLoader {
    return this.#loader
  }

  /**
   * ID of the current viewer (authenticated DID), if set.
   */
  get viewerID(): string | null {
    return this.#ceramic.did?.id ?? null
  }

  /**
   * Load a document by ID, using the cache if possible.
   */
  async loadDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID,
    fresh = false
  ): Promise<ModelInstanceDocument<Content>> {
    if (fresh) {
      this.#loader.clear(id)
    }
    return await this.#loader.load<Content>(id)
  }

  /**
   * Create a new document with the given model and content.
   */
  async createDoc<Content = Record<string, any>>(
    model: string,
    content: Content
  ): Promise<ModelInstanceDocument<Content>> {
    return await this.#loader.create(model, content)
  }

  /**
   * Update an existing document.
   */
  async updateDoc<Content = Record<string, any>>(
    id: string | StreamID,
    content: Content,
    options?: UpdateDocOptions
  ): Promise<ModelInstanceDocument<Content>> {
    return await this.#loader.update(id, content, options)
  }

  /**
   * Query the index for a connection of documents.
   */
  async queryConnection(query: ConnectionQuery): Promise<Connection<ModelInstanceDocument>> {
    return await queryConnection(this.#ceramic, query)
  }

  /**
   * Query the index for a single document.
   */
  async querySingle(query: BaseQuery): Promise<ModelInstanceDocument | null> {
    return await querySingle(this.#ceramic, query)
  }
}
