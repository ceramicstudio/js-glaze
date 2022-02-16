import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'
import { TileLoader } from '@glazed/tile-loader'
import type { TileCache } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'
import {
  type Connection,
  type ConnectionArguments,
  type Edge,
  cursorToOffset,
  offsetToCursor,
} from 'graphql-relay'

// import { ItemConnectionHandler, ReferenceConnectionHandler } from './connection'

const SLICE_DEFAULT_SIZE = 20

export type ContextConfig<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  cache?: TileCache | boolean
  ceramic: CeramicApi
  loader?: TileLoader
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
}

export class Context<ModelTypes extends ModelTypeAliases = ModelTypeAliases> {
  #ceramic: CeramicApi
  #loader: TileLoader
  #dataStore: DIDDataStore<ModelTypes>
  // #itemConnections: Record<string, Promise<ItemConnectionHandler<unknown>>> = {}
  // #referenceConnections: Record<string, Promise<ReferenceConnectionHandler<unknown>>> = {}

  constructor(config: ContextConfig<ModelTypes>) {
    const { cache, ceramic, loader, model } = config
    this.#ceramic = ceramic
    this.#loader = loader ?? new TileLoader({ ceramic, cache })
    this.#dataStore = new DIDDataStore<ModelTypes>({
      ceramic,
      loader: this.#loader,
      model:
        model instanceof DataModel
          ? model
          : new DataModel<ModelTypes>({ loader: this.#loader, aliases: model }),
    })
  }

  get authenticated(): boolean {
    return this.#ceramic.did?.authenticated ?? false
  }

  get ceramic(): CeramicApi {
    return this.#ceramic
  }

  get dataStore(): DIDDataStore<ModelTypes> {
    return this.#dataStore
  }

  get loader(): TileLoader {
    return this.#loader
  }

  get viewerID(): string | null {
    return this.#ceramic.did?.id ?? null
  }

  // async getItemConnection<Node = unknown>(id: string): Promise<ItemConnectionHandler<Node>> {
  //   if (this.#itemConnections[id] == null) {
  //     this.#itemConnections[id] = ItemConnectionHandler.load<Node>(this.#loader, id)
  //   }
  //   return (await this.#itemConnections[id]) as ItemConnectionHandler<Node>
  // }

  // async createItemConnection<Node = unknown>(
  //   schemaURL: string
  // ): Promise<ItemConnectionHandler<Node>> {
  //   const handler = await ItemConnectionHandler.create<Node>(this.#loader, schemaURL)
  //   this.#itemConnections[handler.id] = Promise.resolve(handler)
  //   return handler
  // }

  // async getReferenceConnection<Node = unknown>(
  //   id: string,
  //   nodeSchemaURL: string
  // ): Promise<ReferenceConnectionHandler<Node>> {
  //   if (this.#referenceConnections[id] == null) {
  //     this.#referenceConnections[id] = ReferenceConnectionHandler.load<Node>(
  //       this.#loader,
  //       id,
  //       nodeSchemaURL
  //     )
  //   }
  //   return (await this.#referenceConnections[id]) as ReferenceConnectionHandler<Node>
  // }

  // async createReferenceConnection<Node = unknown>(
  //   schemaURL: string,
  //   nodeSchemaURL: string
  // ): Promise<ReferenceConnectionHandler<Node>> {
  //   const handler = await ReferenceConnectionHandler.create<Node>(
  //     this.#loader,
  //     schemaURL,
  //     nodeSchemaURL
  //   )
  //   this.#referenceConnections[handler.id] = Promise.resolve(handler)
  //   return handler
  // }

  async getRecordID(aliasOrID: string): Promise<string> {
    const definitionID = this.dataStore.getDefinitionID(aliasOrID)
    const recordID = await this.dataStore.getRecordID(definitionID)
    // Create an empty record if not already existing
    return recordID ?? (await this.dataStore.setRecord(definitionID, {})).toString()
  }

  async loadDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID,
    fresh = false
  ): Promise<TileDocument<Content>> {
    if (fresh) {
      this.#loader.clear(id)
    }
    return await this.#loader.load<Content>(id)
  }

  async createDoc<Content = Record<string, any>>(
    schema: string,
    content: Content
  ): Promise<TileDocument<Content>> {
    return await this.#loader.create<Content>(content, { schema })
  }

  async updateDoc<Content = Record<string, any>>(
    id: string | StreamID,
    content: Content
  ): Promise<TileDocument<Content | null | undefined>> {
    return await this.#loader.update(id, content)
  }

  async loadListConnection(
    list: Array<string>,
    args: ConnectionArguments = {}
  ): Promise<Connection<TileDocument | null>> {
    let sliceStart: number
    let sliceEnd: number
    if (args.last != null) {
      sliceEnd = Math.min(args.before ? cursorToOffset(args.before) : list.length, list.length)
      sliceStart = Math.max(0, sliceEnd - args.last)
    } else {
      sliceStart = Math.min(args.after ? cursorToOffset(args.after) + 1 : 0, list.length)
      sliceEnd = Math.min(sliceStart + (args.first ?? SLICE_DEFAULT_SIZE), list.length)
    }

    const sliceIDs = list.slice(sliceStart, sliceEnd)
    const results = await this.#loader.loadMany(sliceIDs)
    const edges = results.map((doc, i) => ({
      cursor: offsetToCursor(sliceStart + i),
      node: doc instanceof Error ? null : doc,
    }))

    return {
      pageInfo: {
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        hasNextPage: sliceEnd !== list.length,
        hasPreviousPage: sliceStart !== 0,
      },
      edges: args.last ? edges.reverse() : edges,
    }
  }

  async addListConnectionEdges<T = Record<string, any>>(
    ownerID: string,
    listKey: string,
    schema: string,
    contents: Array<T>
  ): Promise<{ node: TileDocument; edges: Array<Edge<TileDocument<T>>> }> {
    const createEdgeDocs = contents.map(async (content) => await this.createDoc(schema, content))
    const [ownerDoc, ...edgeDocs] = await Promise.all([
      this.loadDoc(ownerID, true), // Force fresh load to ensure the list is up-to-date
      ...createEdgeDocs,
    ])
    const content = ownerDoc.content ?? {}
    const existing = (content[listKey] ?? []) as Array<string>

    const edgeIDs: Array<string> = []
    const edges: Array<Edge<TileDocument<T>>> = []
    edgeDocs.forEach((doc, i) => {
      edgeIDs.push(doc.id.toString())
      edges.push({ cursor: offsetToCursor(existing.length + i), node: doc })
    })
    await ownerDoc.update({ ...content, [listKey]: [...existing, ...edgeIDs] })

    return { edges, node: ownerDoc }
  }
}
