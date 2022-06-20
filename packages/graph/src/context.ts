import type { BaseQuery, CeramicApi } from '@ceramicnetwork/common'
import type { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import type { Connection } from 'graphql-relay'

import { type ConnectionQuery, queryConnection, querySingle } from './query.js'
import { type DocumentCache, DocumentLoader } from './loader.js'

export type ContextParams = {
  cache?: DocumentCache | boolean
  ceramic: CeramicApi
  loader?: DocumentLoader
}

export class Context {
  #ceramic: CeramicApi
  #loader: DocumentLoader

  constructor(params: ContextParams) {
    const { cache, ceramic, loader } = params
    this.#ceramic = ceramic
    this.#loader = loader ?? new DocumentLoader({ ceramic, cache })
  }

  get authenticated(): boolean {
    return this.#ceramic.did?.authenticated ?? false
  }

  get ceramic(): CeramicApi {
    return this.#ceramic
  }

  get loader(): DocumentLoader {
    return this.#loader
  }

  get viewerID(): string | null {
    return this.#ceramic.did?.id ?? null
  }

  async loadDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID,
    fresh = false
  ): Promise<ModelInstanceDocument<Content>> {
    if (fresh) {
      this.#loader.clear(id)
    }
    return await this.#loader.load<Content>(id)
  }

  async createDoc<Content = Record<string, any>>(
    model: string,
    content: Content
  ): Promise<ModelInstanceDocument<Content>> {
    return await this.#loader.create(model, content)
  }

  async updateDoc<Content = Record<string, any>>(
    id: string | StreamID,
    content: Content
  ): Promise<ModelInstanceDocument<Content | null>> {
    return await this.#loader.update(id, content)
  }

  async queryConnection(query: ConnectionQuery): Promise<Connection<ModelInstanceDocument>> {
    return await queryConnection(this.#ceramic, query)
  }

  async querySingle(query: BaseQuery): Promise<ModelInstanceDocument | null> {
    return await querySingle(this.#ceramic, query)
  }
}
