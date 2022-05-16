import type { CeramicApi } from '@ceramicnetwork/common'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import type { ModelInstanceDocument, QueryAPIs } from '@glazed/types'
// import {
//   type Connection,
//   type ConnectionArguments,
//   type Edge,
//   cursorToOffset,
//   offsetToCursor,
// } from 'graphql-relay'

// import { ItemConnectionHandler, ReferenceConnectionHandler } from './connection'
import { type DocumentCache, DocumentLoader } from './loader.js'

// const SLICE_DEFAULT_SIZE = 20

export type ContextParams = {
  cache?: DocumentCache | boolean
  ceramic: CeramicApi
  loader?: DocumentLoader
}

export class Context {
  #ceramic: CeramicApi
  #loader: DocumentLoader
  // #itemConnections: Record<string, Promise<ItemConnectionHandler<unknown>>> = {}
  // #referenceConnections: Record<string, Promise<ReferenceConnectionHandler<unknown>>> = {}

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

  get query(): QueryAPIs {
    throw new Error('Not implemented')
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

  // async getRecordID(aliasOrID: string): Promise<string> {
  //   const definitionID = this.dataStore.getDefinitionID(aliasOrID)
  //   const recordID = await this.dataStore.getRecordID(definitionID)
  //   // Create an empty record if not already existing
  //   return recordID ?? (await this.dataStore.setRecord(definitionID, {})).toString()
  // }

  async loadDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID,
    fresh = false
  ): Promise<ModelInstanceDocument<Content>> {
    if (fresh) {
      this.#loader.clear(id)
    }
    return await this.#loader.load<Content>(id)
  }

  createDoc<Content = Record<string, any>>(
    _model: string,
    _content: Content
  ): Promise<ModelInstanceDocument<Content>> {
    throw new Error('Not implemented')
  }

  updateDoc<Content = Record<string, any>>(
    _id: string | StreamID,
    _content: Content
  ): Promise<ModelInstanceDocument<Content | null | undefined>> {
    throw new Error('Not implemented')
  }

  // async loadListConnection(
  //   list: Array<string>,
  //   args: ConnectionArguments = {}
  // ): Promise<Connection<TileDocument | null>> {
  //   let sliceStart: number
  //   let sliceEnd: number
  //   if (args.last != null) {
  //     sliceEnd = Math.min(args.before ? cursorToOffset(args.before) : list.length, list.length)
  //     sliceStart = Math.max(0, sliceEnd - args.last)
  //   } else {
  //     sliceStart = Math.min(args.after ? cursorToOffset(args.after) + 1 : 0, list.length)
  //     sliceEnd = Math.min(sliceStart + (args.first ?? SLICE_DEFAULT_SIZE), list.length)
  //   }

  //   const sliceIDs = list.slice(sliceStart, sliceEnd)
  //   const results = await this.#loader.loadMany(sliceIDs)
  //   const edges = results.map((doc, i) => ({
  //     cursor: offsetToCursor(sliceStart + i),
  //     node: doc instanceof Error ? null : doc,
  //   }))

  //   return {
  //     pageInfo: {
  //       startCursor: edges[0]?.cursor,
  //       endCursor: edges[edges.length - 1]?.cursor,
  //       hasNextPage: sliceEnd !== list.length,
  //       hasPreviousPage: sliceStart !== 0,
  //     },
  //     edges: args.last ? edges.reverse() : edges,
  //   }
  // }

  // async addListConnectionEdges<T = Record<string, any>>(
  //   ownerID: string,
  //   listKey: string,
  //   schema: string,
  //   contents: Array<T>
  // ): Promise<{ node: TileDocument; edges: Array<Edge<TileDocument<T>>> }> {
  //   const createEdgeDocs = contents.map(async (content) => await this.createDoc(schema, content))
  //   const [ownerDoc, ...edgeDocs] = await Promise.all([
  //     this.loadDoc(ownerID, true), // Force fresh load to ensure the list is up-to-date
  //     ...createEdgeDocs,
  //   ])
  //   const content = ownerDoc.content ?? {}
  //   const existing = (content[listKey] ?? []) as Array<string>

  //   const edgeIDs: Array<string> = []
  //   const edges: Array<Edge<TileDocument<T>>> = []
  //   edgeDocs.forEach((doc, i) => {
  //     edgeIDs.push(doc.id.toUrl())
  //     edges.push({ cursor: offsetToCursor(existing.length + i), node: doc })
  //   })
  //   await ownerDoc.update({ ...content, [listKey]: [...existing, ...edgeIDs] })

  //   return { edges, node: ownerDoc }
  // }
}
