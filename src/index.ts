import type { CeramicApi, Doctype, DocMetadata } from '@ceramicnetwork/common'
import type DocID from '@ceramicnetwork/docid'
import { definitions, schemas } from '@ceramicstudio/idx-constants'
import DataLoader from 'dataloader'
import type { DID, DIDProvider } from 'dids'

import { DoctypeProxy } from './doctypes'
import type {
  ContentEntry,
  DefinitionsAliases,
  DefinitionWithID,
  IdentityIndexContent,
  IndexKey,
} from './types'
import { toDocIDString } from './utils'

export * from './types'
export * from './utils'

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}

export interface CreateOptions {
  pin?: boolean
}

export interface IDXOptions {
  aliases?: DefinitionsAliases
  autopin?: boolean
  ceramic: CeramicApi
}

export class IDX {
  _aliases: DefinitionsAliases
  _autopin: boolean
  _ceramic: CeramicApi
  _docLoader: DataLoader<string, Doctype>
  _indexProxy: DoctypeProxy

  constructor({ aliases = {}, autopin, ceramic }: IDXOptions) {
    this._aliases = { ...definitions, ...aliases }
    this._autopin = autopin !== false
    this._ceramic = ceramic

    this._docLoader = new DataLoader(async (ids: ReadonlyArray<string>) => {
      return await Promise.all(ids.map(async (id) => await this._ceramic.loadDocument<Doctype>(id)))
    })
    this._indexProxy = new DoctypeProxy(this._getOwnIDXDoc.bind(this))
  }

  get authenticated(): boolean {
    return this._ceramic.did != null
  }

  get ceramic(): CeramicApi {
    return this._ceramic
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

  // High-level APIs

  async has(name: string, did?: string): Promise<boolean> {
    const key = this._toIndexKey(name)
    const ref = await this._getReference(key, did)
    return ref != null
  }

  async get<T = unknown>(name: string, did?: string): Promise<T | null> {
    const key = this._toIndexKey(name)
    return await this._getContent(key, did)
  }

  async set(name: string, content: unknown, options?: CreateOptions): Promise<DocID> {
    const key = this._toIndexKey(name)
    return await this._setContent(key, content, options)
  }

  async merge<T extends Record<string, unknown> = Record<string, unknown>>(
    name: string,
    content: T,
    options?: CreateOptions
  ): Promise<DocID> {
    const key = this._toIndexKey(name)
    const existing = await this._getContent<T>(key)
    const newContent = existing ? { ...existing, ...content } : content
    return await this._setContent(key, newContent, options)
  }

  async setAll(
    contents: Record<string, unknown>,
    options?: CreateOptions
  ): Promise<IdentityIndexContent> {
    const updates = Object.entries(contents).map(async ([name, content]) => {
      const key = this._toIndexKey(name)
      const [created, id] = await this._setContentOnly(key, content, options)
      return [created, key, id]
    }) as Array<Promise<[boolean, IndexKey, DocID]>>
    const changes = await Promise.all(updates)

    const newReferences = changes.reduce((acc, [created, key, id]) => {
      if (created) {
        acc[key] = id.toUrl()
      }
      return acc
    }, {} as IdentityIndexContent)
    await this._setReferences(newReferences)

    return newReferences
  }

  async setDefaults(
    contents: Record<string, unknown>,
    options?: CreateOptions
  ): Promise<IdentityIndexContent> {
    const index = (await this.getIDXContent()) ?? {}

    const updates = Object.entries(contents)
      .map(([name, content]) => [this._toIndexKey(name), content])
      .filter(([key]) => index[key as IndexKey] == null)
      .map(async ([key, content]) => {
        const definition = await this.getDefinition(key as IndexKey)
        const id = await this._createContent(definition, content, options)
        return { [key as IndexKey]: id.toUrl() }
      }) as Array<Promise<IdentityIndexContent>>
    const changes = await Promise.all(updates)

    const newReferences = changes.reduce((acc, keyToID) => {
      return Object.assign(acc, keyToID)
    }, {} as IdentityIndexContent)
    await this._setReferences(newReferences)

    return newReferences
  }

  async remove(name: string): Promise<void> {
    const key = this._toIndexKey(name)
    await this._removeReference(key)
  }

  _toIndexKey(name: string): IndexKey {
    return this._aliases[name] ?? name
  }

  // Identity Index APIs

  async getIDXContent(did?: string): Promise<IdentityIndexContent> {
    const rootDoc =
      this.authenticated && (did === this.id || did == null)
        ? await this._indexProxy.get()
        : await this._getIDXDoc(did ?? this.id)
    return rootDoc?.content as IdentityIndexContent
  }

  contentIterator(did?: string): AsyncIterableIterator<ContentEntry> {
    let list: Array<[IndexKey, string]>
    let cursor = 0

    return {
      [Symbol.asyncIterator]() {
        return this
      },
      next: async (): Promise<IteratorResult<ContentEntry>> => {
        if (list == null) {
          const index = await this.getIDXContent(did)
          list = Object.entries(index ?? {})
        }
        if (cursor === list.length) {
          return { done: true, value: null }
        }

        const [key, ref] = list[cursor++]
        const doc = await this._loadDocument(ref)
        return { done: false, value: { key, ref, content: doc.content } }
      },
    }
  }

  async _getIDXDoc(did: string): Promise<Doctype> {
    const doc = await this._ceramic.createDocument(
      'tile',
      {
        deterministic: true,
        metadata: { controllers: [did], family: 'IDX', schema: schemas.IdentityIndex },
      },
      { anchor: false, publish: false }
    )
    if (doc.metadata.schema !== schemas.IdentityIndex) {
      throw new Error('Invalid document: schema is not IdentityIndex')
    }
    return doc
  }

  async _getOwnIDXDoc(): Promise<Doctype> {
    return await this._getIDXDoc(this.id)
  }

  // Definition APIs

  async getDefinition(idOrKey: DocID | IndexKey): Promise<DefinitionWithID> {
    const doc = await this._loadDocument(idOrKey)
    if (doc.metadata.schema !== schemas.Definition) {
      throw new Error('Invalid document: schema is not Definition')
    }
    return { ...doc.content, id: doc.id } as DefinitionWithID
  }

  // Content APIs

  async _getContent<T = unknown>(key: IndexKey, did?: string): Promise<T | null> {
    const ref = await this._getReference(key, did)
    if (ref == null) {
      return null
    } else {
      const doc = await this._loadDocument(ref)
      return doc.content as T
    }
  }

  async _setContent(key: IndexKey, content: unknown, options?: CreateOptions): Promise<DocID> {
    const [created, id] = await this._setContentOnly(key, content, options)
    if (created) {
      await this._setReference(key, id)
    }
    return id
  }

  async _setContentOnly(
    key: IndexKey,
    content: unknown,
    { pin }: CreateOptions = {}
  ): Promise<[boolean, DocID]> {
    const existing = await this._getReference(key, this.id)
    if (existing == null) {
      const definition = await this.getDefinition(key)
      const ref = await this._createContent(definition, content, { pin })
      return [true, ref]
    } else {
      const doc = await this._loadDocument(existing)
      await doc.change({ content })
      return [false, doc.id]
    }
  }

  async _loadDocument(id: DocID | string): Promise<Doctype> {
    return await this._docLoader.load(toDocIDString(id))
  }

  async _createContent(
    definition: DefinitionWithID,
    content: unknown,
    options?: CreateOptions
  ): Promise<DocID> {
    const doc = await this._createDocument(
      content,
      { family: definition.id.toString(), schema: definition.schema },
      options
    )
    return doc.id
  }

  async _createDocument(
    content: unknown,
    meta: Partial<DocMetadata> = {},
    { pin }: CreateOptions = {}
  ): Promise<Doctype> {
    const doc = await this._ceramic.createDocument('tile', {
      content,
      metadata: { controllers: [this.id], ...meta },
    })
    if (pin ?? this._autopin) {
      await this._ceramic.pin.add(doc.id)
    }
    return doc
  }

  // References APIs

  async _getReference(key: IndexKey, did?: string): Promise<string | null> {
    const index = await this.getIDXContent(did ?? this.id)
    return index?.[key] ?? null
  }

  async _setReference(key: IndexKey, id: DocID): Promise<void> {
    await this._indexProxy.changeContent<IdentityIndexContent>((content) => {
      return { ...content, [key]: id.toUrl() }
    })
  }

  async _setReferences(references: IdentityIndexContent): Promise<void> {
    if (Object.keys(references).length !== 0) {
      await this._indexProxy.changeContent<IdentityIndexContent>((content) => {
        return { ...content, ...references }
      })
    }
  }

  async _removeReference(key: IndexKey): Promise<void> {
    await this._indexProxy.changeContent<IdentityIndexContent>(({ [key]: _remove, ...content }) => {
      return content
    })
  }
}
