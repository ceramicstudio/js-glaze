import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import { CeramicApi, Doctype } from '@ceramicnetwork/ceramic-common'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import { DID, DIDProvider, ResolverOptions } from 'dids'

import { DoctypeProxy } from './doctypes'
import { getIDXRoot } from './utils'

type DocID = string

type CollectionsIndex = Record<string, DocID>

const COLLECTIONS_INDEX: CollectionsIndex = {
  'idx:profiles.basic': '' // docId of collection definition doc
}

export interface CollectionDefinition<T extends Record<string, any> = {}> {
  name: string
  schema: string // docId
  description?: string
  url?: string
  config?: T
}

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}

export interface IDXOptions {
  ceramic: CeramicApi
  collections?: CollectionsIndex
  resolver?: ResolverOptions
}

export class IDX {
  _ceramic: CeramicApi
  _collections: CollectionsIndex
  _did2rootId: Record<string, string | null> = {}
  _docLoader: DataLoader<string, Doctype>
  _resolver: Resolver
  _rootDocProxy: DoctypeProxy<Doctype>

  constructor({ ceramic, collections = {}, resolver = {} }: IDXOptions) {
    this._ceramic = ceramic
    this._collections = { ...collections, ...COLLECTIONS_INDEX }

    this._docLoader = new DataLoader(async (docIds: ReadonlyArray<string>) => {
      return await Promise.all(docIds.map(async docId => await this._ceramic.loadDocument(docId)))
    })

    const ceramicResolver = ThreeIDResolver.getResolver(ceramic)
    const registry = resolver.registry
      ? { ...resolver.registry, ...ceramicResolver }
      : ceramicResolver
    this._resolver = new Resolver(registry, resolver.cache)

    this._rootDocProxy = new DoctypeProxy(this._getOrCreateOwnRootDoc.bind(this))
  }

  get authenticated(): boolean {
    return this._ceramic.user != null
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get resolver(): Resolver {
    return this._resolver
  }

  get did(): DID {
    if (this._ceramic.user == null) {
      throw new Error('Ceramic instance is not authenticated')
    }
    return this._ceramic.user
  }

  async authenticate(options: AuthenticateOptions = {}): Promise<void> {
    if (this._ceramic.user == null) {
      if (options.provider == null) {
        throw new Error('Not provider available')
      } else {
        await this._ceramic.setDIDProvider(options.provider)
      }
    }
  }

  // Ceramic APIs wrappers

  async createDocument<T = any>(content: T, meta: Record<string, any> = {}): Promise<Doctype> {
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
    const id = this._toCollectionId(name)
    const docId = await this.getCollectionId(id, did ?? this.did.id)
    return docId != null
  }

  async get<T = any>(name: string, did?: string): Promise<T | null> {
    const id = this._toCollectionId(name)
    return await this.getCollection(id, did ?? this.did.id)
  }

  async set<T = any>(name: string, content: T): Promise<DocID> {
    const id = this._toCollectionId(name)
    return await this.setCollection(id, content)
  }

  async remove(name: string): Promise<void> {
    const id = this._toCollectionId(name)
    await this.removeCollection(id)
  }

  _toCollectionId(name: string): DocID {
    if (!name.includes(':')) {
      name = `idx:${name}`
    }
    const id = this._collections[name]
    if (id == null) {
      throw new Error(`Invalid name: ${name}`)
    }
    return id
  }

  // Collection definitions APIs

  async createCollectionDefinition(content: CollectionDefinition): Promise<DocID> {
    // TODO: add schema
    const doctype = await this.createDocument(content)
    return doctype.id
  }

  async getCollectionDefinition(id: DocID): Promise<CollectionDefinition> {
    const doc = await this.loadDocument(id)
    // TODO: ensure schema metadata matches collection definition
    return doc.content
  }

  // Collection APIs

  async getCollectionId(definitionId: DocID, did: string): Promise<DocID | null> {
    const rootIndex = await this.getRootDocument(did)
    return rootIndex?.content[definitionId] ?? null
  }

  async getCollection<T = any>(definitionId: DocID, did: string): Promise<T | null> {
    const docId = await this.getCollectionId(definitionId, did)
    if (docId == null) {
      return null
    } else {
      const doc = await this.loadDocument(docId)
      return doc.content
    }
  }

  async setCollectionId(definitionId: DocID, docId: DocID): Promise<void> {
    await this._changeRootIndex(content => ({ ...content, [definitionId]: docId }))
  }

  async setCollection<T = any>(definitionId: DocID, content: T): Promise<DocID> {
    const root = await this._rootDocProxy.get()
    const existingId = root.content[definitionId]
    if (existingId == null) {
      const definition = await this.getCollectionDefinition(definitionId)
      const docId = await this._createCollection(definition, content)
      await this.setCollectionId(definitionId, docId)
      return docId
    } else {
      const doc = await this.loadDocument(existingId)
      await doc.change({ content })
      return doc.id
    }
  }

  async addCollection<T = any>(definition: CollectionDefinition, content: T): Promise<DocID> {
    const [definitionId, docId] = await Promise.all([
      this.createCollectionDefinition(definition),
      this._createCollection(definition, content)
    ])
    await this.setCollectionId(definitionId, docId)
    return docId
  }

  async removeCollection(id: DocID): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    await this._changeRootIndex(({ [id]: _remove, ...content }) => content)
  }

  async _createCollection<T = any>(definition: CollectionDefinition, content: T): Promise<DocID> {
    const doctype = await this.createDocument(content, { schema: definition.schema })
    return doctype.id
  }

  // Root document

  async getRootDocument(did: string): Promise<Doctype | null> {
    let rootId = this._did2rootId[did]
    if (rootId === null) {
      return null
    }
    if (rootId == null) {
      const userDoc = await this._resolver.resolve(did)
      rootId = getIDXRoot(userDoc) ?? null
      this._did2rootId[did] = rootId
    }
    return rootId ? await this.loadDocument(rootId) : null
  }

  async _getOrCreateOwnRootDoc(): Promise<Doctype> {
    const doc = await this._getOwnRootDoc()
    return doc ?? (await this._createOwnRootDoc())
  }

  async _getOwnRootDoc(): Promise<Doctype | null> {
    return await this.getRootDocument(this.did.id)
  }

  async _createOwnRootDoc(content = {}): Promise<Doctype> {
    // TODO: schema
    const doctype = await this.createDocument(content, { tags: ['RootIndex', 'DocIdMap'] })
    this._did2rootId[this.did.id] = doctype.id
    return doctype
  }

  async _changeRootIndex<T = any>(change: (content: T) => T): Promise<void> {
    const mutation = async (doc: Doctype): Promise<Doctype> => {
      await doc.change({ content: change(doc.content) })
      return doc
    }
    return await this._rootDocProxy.change(mutation)
  }
}
