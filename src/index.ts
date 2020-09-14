import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import { CeramicApi, Doctype, DocMetadata } from '@ceramicnetwork/ceramic-common'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import { DID, DIDProvider, ResolverOptions } from 'dids'

import { DoctypeProxy } from './doctypes'
import {
  ContentEntry,
  Definition,
  DefinitionsAliases,
  DefinitionEntry,
  DocID,
  Entry,
  IdentityIndexContent,
  SchemasAliases
} from './types'
import { getIDXRoot } from './utils'

export * from './types'

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}

export interface CreateOptions {
  pin?: boolean
}

export interface CreateContentOptions {
  pin?: boolean
  tags?: Array<string>
}

export interface ContentIteratorOptions {
  did?: string
  tag?: string
}

export interface IDXOptions {
  autopin?: boolean
  ceramic: CeramicApi
  definitions?: DefinitionsAliases
  resolver?: ResolverOptions
  schemas: SchemasAliases
}

export class IDX {
  _autopin: boolean
  _ceramic: CeramicApi
  _definitions: DefinitionsAliases
  _didCache: Record<string, DocID | null> = {}
  _docLoader: DataLoader<string, Doctype>
  _indexProxy: DoctypeProxy
  _resolver: Resolver
  _schemas: SchemasAliases

  constructor({ autopin, ceramic, definitions = {}, resolver = {}, schemas }: IDXOptions) {
    this._autopin = !!autopin
    this._ceramic = ceramic
    this._definitions = definitions
    this._schemas = schemas

    this._docLoader = new DataLoader(async (docIds: ReadonlyArray<string>) => {
      return await Promise.all(docIds.map(async docId => await this._ceramic.loadDocument(docId)))
    })
    this._indexProxy = new DoctypeProxy(this._getOwnIDXDoc.bind(this))

    const ceramicResolver = ThreeIDResolver.getResolver(ceramic)
    const registry = resolver.registry
      ? { ...resolver.registry, ...ceramicResolver }
      : ceramicResolver
    this._resolver = new Resolver(registry, resolver.cache)
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

  async createDocument(
    content: unknown,
    meta: Partial<DocMetadata> = {},
    { pin }: CreateOptions = {}
  ): Promise<Doctype> {
    const doc = await this._ceramic.createDocument('tile', {
      content,
      metadata: { owners: [this.id], ...meta }
    })
    if (pin ?? this._autopin) {
      await this._ceramic.pin.add(doc.id)
    }
    return doc
  }

  async loadDocument(id: DocID): Promise<Doctype> {
    return await this._docLoader.load(id)
  }

  // High-level APIs

  async has(name: string, did?: string): Promise<boolean> {
    const id = this._toDefinitionId(name)
    const entry = await this._getEntry(id, did)
    return entry != null
  }

  async get<T = unknown>(name: string, did?: string): Promise<T | null> {
    const id = this._toDefinitionId(name)
    return await this.getEntryContent(id, did)
  }

  async getTags(name: string, did?: string): Promise<Array<string>> {
    const id = this._toDefinitionId(name)
    return await this.getEntryTags(id, did)
  }

  async set(name: string, content: unknown): Promise<DocID> {
    const id = this._toDefinitionId(name)
    return await this.setEntryContent(id, content)
  }

  async addTag(name: string, tag: string): Promise<Array<string>> {
    const id = this._toDefinitionId(name)
    return await this.addEntryTag(id, tag)
  }

  async removeTag(name: string, tag: string): Promise<Array<string>> {
    const id = this._toDefinitionId(name)
    return await this.removeEntryTag(id, tag)
  }

  async remove(name: string): Promise<void> {
    const id = this._toDefinitionId(name)
    await this.removeEntry(id)
  }

  _toDefinitionId(name: string): DocID {
    const id = this._definitions[name] ?? this._definitions[`idx:${name}`]
    if (id == null) {
      if (name.startsWith('ceramic://')) {
        return name
      }
      throw new Error(`Invalid name: ${name}`)
    }
    return id
  }

  // Identity Index APIs

  async getIDXDocID(did?: string): Promise<DocID | null> {
    const userDoc = await this._resolver.resolve(did ?? this.id)
    return getIDXRoot(userDoc) ?? null
  }

  async getIDXContent(did?: string): Promise<IdentityIndexContent | null> {
    const rootDoc =
      this.authenticated && (did === this.id || did == null)
        ? await this._indexProxy.get()
        : await this._getIDXDoc(did ?? this.id)
    return (rootDoc?.content as IdentityIndexContent) ?? null
  }

  async isSupported(did?: string): Promise<boolean> {
    const id = await this.getIDXDocID(did)
    return id !== null
  }

  async _getIDXDoc(did: string): Promise<Doctype | null> {
    let rootId
    rootId = this._didCache[did]
    if (rootId === null) {
      return null
    }
    if (rootId == null) {
      rootId = await this.getIDXDocID(did)
      this._didCache[did] = rootId
    }
    return rootId == null ? null : await this.loadDocument(rootId)
  }

  async _getOwnIDXDoc(): Promise<Doctype> {
    const doc = await this._getIDXDoc(this.id)
    if (doc == null) {
      throw new Error('IDX is not supported by the authenticated DID')
    }
    return doc
  }

  // Definition APIs

  async createDefinition(content: Definition, options?: CreateOptions): Promise<DocID> {
    const doctype = await this.createDocument(
      content,
      { schema: this._schemas.Definition },
      options
    )
    return doctype.id
  }

  async getDefinition(id: DocID): Promise<Definition> {
    const doc = await this.loadDocument(id)
    if (doc.metadata.schema !== this._schemas.Definition) {
      throw new Error('Invalid definition')
    }
    return doc.content as Definition
  }

  // Entry APIs

  async getEntryContent<T = unknown>(definitionId: DocID, did?: string): Promise<T | null> {
    const entry = await this._getEntry(definitionId, did)
    if (entry == null) {
      return null
    } else {
      const doc = await this.loadDocument(entry.ref)
      return doc.content as T
    }
  }

  async getEntryTags(definitionId: DocID, did?: string): Promise<Array<string>> {
    const entry = await this._getEntry(definitionId, did)
    return entry?.tags ?? []
  }

  async setEntryContent(
    definitionId: DocID,
    content: unknown,
    { pin, tags = [] }: CreateContentOptions = {}
  ): Promise<DocID> {
    const entry = await this._getEntry(definitionId, this.id)
    if (entry == null) {
      const definition = await this.getDefinition(definitionId)
      const ref = await this._createReference(definition, content, { pin })
      await this._setEntry(definitionId, { ref, tags })
      return ref
    } else {
      const doc = await this.loadDocument(entry.ref)
      await doc.change({ content })
      return doc.id
    }
  }

  async addEntryTag(definitionId: DocID, tag: string): Promise<Array<string>> {
    const entry = await this._getEntry(definitionId, this.id)
    if (entry == null) {
      return []
    }
    if (entry.tags.includes(tag)) {
      return entry.tags
    }

    entry.tags.push(tag)
    await this._setEntry(definitionId, entry)
    return entry.tags
  }

  async removeEntryTag(definitionId: DocID, tag: string): Promise<Array<string>> {
    const entry = await this._getEntry(definitionId, this.id)
    if (entry == null) {
      return []
    }

    const index = entry.tags.indexOf(tag)
    if (index !== -1) {
      entry.tags.splice(index, 1)
      await this._setEntry(definitionId, entry)
    }
    return entry.tags
  }

  async removeEntry(definitionId: DocID): Promise<void> {
    await this._indexProxy.changeContent<IdentityIndexContent>(
      ({ [definitionId]: _remove, ...content }) => {
        return content
      }
    )
  }

  async getEntries(did?: string): Promise<Array<DefinitionEntry>> {
    const index = await this.getIDXContent(did)
    return Object.entries(index ?? {}).map(([def, entry]) => {
      return { ...entry, def }
    }, [] as Array<DefinitionEntry>)
  }

  async getTagEntries(tag: string, did?: string): Promise<Array<DefinitionEntry>> {
    const index = await this.getIDXContent(did)
    return Object.entries(index ?? {}).reduce((acc, [def, entry]) => {
      if (entry.tags.includes(tag)) {
        acc.push({ ...entry, def })
      }
      return acc
    }, [] as Array<DefinitionEntry>)
  }

  contentIterator({ did, tag }: ContentIteratorOptions = {}): AsyncIterableIterator<ContentEntry> {
    let list: Array<DefinitionEntry>
    let cursor = 0

    return {
      [Symbol.asyncIterator]() {
        return this
      },
      next: async (): Promise<IteratorResult<ContentEntry>> => {
        if (list == null) {
          list = tag ? await this.getTagEntries(tag, did) : await this.getEntries()
        }
        if (cursor === list.length) {
          return { done: true, value: null }
        }

        const entry = list[cursor++]
        const doc = await this.loadDocument(entry.ref)
        return { done: false, value: { ...entry, content: doc.content } }
      }
    }
  }

  async _getEntry(definitionId: DocID, did?: string): Promise<Entry | null> {
    const index = await this.getIDXContent(did ?? this.id)
    return index?.[definitionId] ?? null
  }

  async _setEntry(definitionId: DocID, entry: Entry): Promise<void> {
    await this._indexProxy.changeContent<IdentityIndexContent>(content => {
      return { ...content, [definitionId]: entry }
    })
  }

  async _createReference(
    definition: Definition,
    content: unknown,
    options?: CreateOptions
  ): Promise<DocID> {
    const doc = await this.createDocument(content, { schema: definition.schema }, options)
    return doc.id
  }
}
