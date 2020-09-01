import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import { CeramicApi, Doctype } from '@ceramicnetwork/ceramic-common'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import { DID, DIDProvider, ResolverOptions } from 'dids'

import { RootIndex } from './indexes'
import { Definition, DefinitionsAliases, DocID } from './types'

const DEFINITIONS: DefinitionsAliases = {}

export * from './types'

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}

export interface IDXOptions {
  ceramic: CeramicApi
  definitions?: DefinitionsAliases
  resolver?: ResolverOptions
}

export class IDX {
  _ceramic: CeramicApi
  _definitions: DefinitionsAliases
  _docLoader: DataLoader<string, Doctype>
  _resolver: Resolver
  _rootIndex: RootIndex

  constructor({ ceramic, definitions = {}, resolver = {} }: IDXOptions) {
    this._ceramic = ceramic
    this._definitions = { ...definitions, ...DEFINITIONS }

    this._docLoader = new DataLoader(async (docIds: ReadonlyArray<string>) => {
      return await Promise.all(docIds.map(async docId => await this._ceramic.loadDocument(docId)))
    })

    const ceramicResolver = ThreeIDResolver.getResolver(ceramic)
    const registry = resolver.registry
      ? { ...resolver.registry, ...ceramicResolver }
      : ceramicResolver
    this._resolver = new Resolver(registry, resolver.cache)

    this._rootIndex = new RootIndex(this)
  }

  get authenticated(): boolean {
    return this._ceramic.did != null
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get resolver(): Resolver {
    return this._resolver
  }

  get did(): DID {
    if (this._ceramic.did == null) {
      throw new Error('Ceramic instance is not authenticated')
    }
    return this._ceramic.did
  }

  get id(): string {
    return this.did.id
  }

  async authenticate(options: AuthenticateOptions = {}): Promise<void> {
    if (this._ceramic.did == null) {
      if (options.provider == null) {
        throw new Error('Not provider available')
      } else {
        await this._ceramic.setDIDProvider(options.provider)
      }
    }
  }

  // Ceramic APIs wrappers

  async createDocument(content: unknown, meta: Record<string, unknown> = {}): Promise<Doctype> {
    return await this._ceramic.createDocument('tile', {
      content,
      metadata: { ...meta, owners: [this.did.id] }
    })
  }

  async loadDocument(id: DocID): Promise<Doctype> {
    return await this._docLoader.load(id)
  }

  // High-level APIs

  async has(name: string, did?: string): Promise<boolean> {
    const id = this._toDefintionId(name)
    const docId = await this.getEntryId(id, did)
    return docId != null
  }

  async get<T = unknown>(name: string, did?: string): Promise<T | null> {
    const id = this._toDefintionId(name)
    return await this.getEntry(id, did)
  }

  async set(name: string, content: unknown): Promise<DocID> {
    const id = this._toDefintionId(name)
    return await this.setEntry(id, content)
  }

  async remove(name: string): Promise<void> {
    const id = this._toDefintionId(name)
    await this.removeEntry(id)
  }

  _toDefintionId(name: string): DocID {
    const id = this._definitions[name] ?? this._definitions[`idx:${name}`]
    if (id == null) {
      throw new Error(`Invalid name: ${name}`)
    }
    return id
  }

  // Definition APIs

  async createDefinition(content: Definition): Promise<DocID> {
    // TODO: add schema
    const doctype = await this.createDocument(content)
    return doctype.id
  }

  async getDefinition(id: DocID): Promise<Definition> {
    const doc = await this.loadDocument(id)
    // TODO: ensure schema metadata matches definition
    return doc.content as Definition
  }

  // Entry APIs

  async getEntryId(definitionId: DocID, did?: string): Promise<DocID | null> {
    return await this._rootIndex.get(definitionId, did ?? this.did.id)
  }

  async getEntry<T = unknown>(definitionId: DocID, did?: string): Promise<T | null> {
    const docId = await this.getEntryId(definitionId, did)
    if (docId == null) {
      return null
    } else {
      const doc = await this.loadDocument(docId)
      return doc.content as T
    }
  }

  async setEntry<T = unknown>(definitionId: DocID, content: T): Promise<DocID> {
    const existingId = await this.getEntryId(definitionId, this.did.id)
    if (existingId == null) {
      const definition = await this.getDefinition(definitionId)
      const docId = await this._createEntry(definition, content)
      await this._setEntryId(definitionId, docId)
      return docId
    } else {
      const doc = await this.loadDocument(existingId)
      await doc.change({ content })
      return doc.id
    }
  }

  async addEntry<T = unknown>(definition: Definition, content: T): Promise<DocID> {
    const [definitionId, docId] = await Promise.all([
      this.createDefinition(definition),
      this._createEntry(definition, content)
    ])
    await this._setEntryId(definitionId, docId)
    return docId
  }

  async removeEntry(definitionId: DocID): Promise<void> {
    await this._rootIndex.remove(definitionId)
  }

  async _createEntry<T = unknown>(definition: Definition, content: T): Promise<DocID> {
    const doctype = await this.createDocument(content, { schema: definition.schema })
    return doctype.id
  }

  async _setEntryId(definitionId: DocID, collectionId: DocID): Promise<void> {
    await this._rootIndex.set(definitionId, collectionId)
  }
}
