/**
 * ```sh
 * npm install @glazed/did-datastore
 * ```
 *
 * @module did-datastore
 */

import type { CeramicApi } from '@ceramicnetwork/common'
import type { StreamID } from '@ceramicnetwork/streamid'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CIP11_DEFINITION_SCHEMA_URL, CIP11_INDEX_SCHEMA_URL } from '@glazed/constants'
import { DataModel } from '@glazed/datamodel'
import type { Definition, IdentityIndex } from '@glazed/did-datastore-model'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

import { TileProxy } from './proxy'
import type { TileContent, TileDoc } from './proxy'
import { assertDIDstring } from './utils'

export { assertDIDstring, isDIDstring } from './utils'

export type DefinitionContentType<
  ModelTypes extends ModelTypeAliases,
  Alias extends keyof ModelTypes['definitions']
> = ModelTypes['schemas'][ModelTypes['definitions'][Alias]]

export type DefinitionsContentTypes<
  ModelTypes extends ModelTypeAliases,
  Fallback = Record<string, unknown>
> = {
  [Key: string]: typeof Key extends keyof ModelTypes['definitions']
    ? DefinitionContentType<ModelTypes, typeof Key>
    : Fallback
}

export type DefinitionWithID<Config extends Record<string, unknown> = Record<string, unknown>> =
  Definition<Config> & { id: StreamID }

export type Entry = {
  key: string
  id: string
  record: unknown
}

export type CreateOptions = {
  controller?: string
  pin?: boolean
}

export type DIDDataStoreParams<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  autopin?: boolean
  ceramic: CeramicApi
  id?: string
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
}

/**
 * ```sh
 * import { DIDDataStore } from '@glazed/did-datastore'
 * ```
 */
export class DIDDataStore<
  ModelTypes extends ModelTypeAliases = ModelTypeAliases,
  Alias extends keyof ModelTypes['definitions'] = keyof ModelTypes['definitions']
> {
  #autopin: boolean
  #ceramic: CeramicApi
  #id: string | undefined
  #indexProxies: Record<string, TileProxy> = {}
  #model: DataModel<ModelTypes>

  constructor({ autopin, ceramic, id, model }: DIDDataStoreParams<ModelTypes>) {
    this.#autopin = autopin !== false
    this.#ceramic = ceramic
    this.#id = id
    this.#model =
      model instanceof DataModel ? model : new DataModel<ModelTypes>({ autopin, ceramic, model })
  }

  get authenticated(): boolean {
    return this.#ceramic.did != null
  }

  get ceramic(): CeramicApi {
    return this.#ceramic
  }

  get id(): string {
    if (this.#id != null) {
      return this.#id
    }
    if (this.#ceramic.did == null) {
      throw new Error('Ceramic instance is not authenticated')
    }
    return this.#ceramic.did.id
  }

  get model(): DataModel<ModelTypes> {
    return this.#model
  }

  // High-level APIs

  async has(key: Alias, did?: string): Promise<boolean> {
    const definitionID = this.getDefinitionID(key as string)
    const ref = await this.getRecordID(definitionID, did)
    return ref != null
  }

  async get<Key extends Alias, ContentType = DefinitionContentType<ModelTypes, Key>>(
    key: Key,
    did?: string
  ): Promise<ContentType | null> {
    const definitionID = this.getDefinitionID(key as string)
    return await this.getRecord<ContentType>(definitionID, did)
  }

  async set<Key extends Alias, ContentType = DefinitionContentType<ModelTypes, Key>>(
    key: Key,
    content: ContentType,
    options: CreateOptions = {}
  ): Promise<StreamID> {
    const definitionID = this.getDefinitionID(key as string)
    const [created, id] = await this._setRecordOnly(definitionID, content, options)
    if (created) {
      await this._setReference(options.controller ?? this.id, definitionID, id)
    }
    return id
  }

  async merge<Key extends Alias, ContentType = DefinitionContentType<ModelTypes, Key>>(
    key: Key,
    content: ContentType,
    options?: CreateOptions
  ): Promise<StreamID> {
    const definitionID = this.getDefinitionID(key as string)
    const existing = await this.getRecord<ContentType>(definitionID)
    const newContent = existing ? { ...existing, ...content } : content
    return await this.setRecord(definitionID, newContent, options)
  }

  async setAll<Contents extends DefinitionsContentTypes<ModelTypes>>(
    contents: Contents,
    options: CreateOptions = {}
  ): Promise<IdentityIndex> {
    const updates = Object.entries(contents).map(async ([alias, content]) => {
      const definitionID = this.getDefinitionID(alias)
      const [created, id] = await this._setRecordOnly(definitionID, content, options)
      return [created, definitionID, id]
    }) as Array<Promise<[boolean, string, StreamID]>>
    const changes = await Promise.all(updates)

    const newReferences = changes.reduce((acc, [created, key, id]) => {
      if (created) {
        acc[key] = id.toUrl()
      }
      return acc
    }, {} as IdentityIndex)
    await this._setReferences(options.controller ?? this.id, newReferences)

    return newReferences
  }

  async setDefaults<Contents extends DefinitionsContentTypes<ModelTypes>>(
    contents: Contents,
    options: CreateOptions = {}
  ): Promise<IdentityIndex> {
    const index = (await this.getIndex()) ?? {}

    const updates = Object.entries(contents)
      .map(([alias, content]): [string, Record<string, unknown>] => [
        this.getDefinitionID(alias),
        content,
      ])
      .filter((entry) => index[entry[0]] == null)
      .map(async ([key, content]) => {
        const definition = await this.getDefinition(key)
        const id = await this._createRecord(definition, content, options)
        return { [key]: id.toUrl() }
      }) as Array<Promise<IdentityIndex>>
    const changes = await Promise.all(updates)

    const newReferences = changes.reduce((acc, keyToID) => {
      return Object.assign(acc, keyToID)
    }, {} as IdentityIndex)
    await this._setReferences(options.controller ?? this.id, newReferences)

    return newReferences
  }

  async remove(key: Alias, controller = this.id): Promise<void> {
    await this._getIndexProxy(controller).changeContent((index) => {
      if (index != null) {
        delete index[this.getDefinitionID(key as string)]
      }
      return index
    })
  }

  // Identity Index APIs

  async getIndex(did = this.id): Promise<IdentityIndex | null> {
    const rootDoc =
      this.authenticated && did === this.id
        ? await this._getIndexProxy(did).get()
        : await this._getIDXDoc(did)
    return rootDoc ? (rootDoc.content as IdentityIndex) : null
  }

  iterator(did?: string): AsyncIterableIterator<Entry> {
    let list: Array<[string, string]>
    let cursor = 0

    return {
      [Symbol.asyncIterator]() {
        return this
      },
      next: async (): Promise<IteratorResult<Entry>> => {
        if (list == null) {
          const index = await this.getIndex(did)
          list = Object.entries(index ?? {})
        }
        if (cursor === list.length) {
          return { done: true, value: null }
        }

        const [key, id] = list[cursor++]
        const doc = await this._loadDocument(id)
        return { done: false, value: { key, id, record: doc.content } }
      },
    }
  }

  /** @internal */
  async _createIDXDoc(controller: string): Promise<TileDoc> {
    assertDIDstring(controller)
    return await TileDocument.create<TileContent>(
      this.#ceramic,
      null,
      { deterministic: true, controllers: [controller], family: 'IDX' },
      { anchor: false, publish: false }
    )
  }

  /** @internal */
  async _getIDXDoc(did: string): Promise<TileDoc | null> {
    const doc = await this._createIDXDoc(did)
    if (doc.content == null || doc.metadata.schema == null) {
      return null
    }
    if (doc.metadata.schema !== CIP11_INDEX_SCHEMA_URL) {
      throw new Error('Invalid document: schema is not IdentityIndex')
    }
    return doc
  }

  /** @internal */
  async _getOwnIDXDoc(did: string): Promise<TileDoc> {
    const doc = await this._createIDXDoc(did)
    if (doc.content == null || doc.metadata.schema == null) {
      // Doc just got created, set to empty object with schema
      await doc.update({}, { schema: CIP11_INDEX_SCHEMA_URL })
      if (this.#autopin) {
        await this.#ceramic.pin.add(doc.id)
      }
    } else if (doc.metadata.schema !== CIP11_INDEX_SCHEMA_URL) {
      throw new Error('Invalid document: schema is not IdentityIndex')
    }
    return doc
  }

  /** @internal */
  _getIndexProxy(controller: string): TileProxy {
    let proxy = this.#indexProxies[controller]
    if (proxy == null) {
      proxy = new TileProxy(async () => await this._getOwnIDXDoc(controller))
      this.#indexProxies[controller] = proxy
    }
    return proxy
  }

  // Definition APIs

  getDefinitionID(aliasOrID: string): string {
    return this.#model.getDefinitionID(aliasOrID) ?? aliasOrID
  }

  async getDefinition(id: StreamID | string): Promise<DefinitionWithID> {
    const doc = await this._loadDocument(id)
    if (doc.metadata.schema !== CIP11_DEFINITION_SCHEMA_URL) {
      throw new Error('Invalid document: schema is not Definition')
    }
    return { ...doc.content, id: doc.id } as DefinitionWithID
  }

  // Record APIs

  async getRecordID(definitionID: string, did?: string): Promise<string | null> {
    const index = await this.getIndex(did ?? this.id)
    return index?.[definitionID] ?? null
  }

  async getRecordDocument(definitionID: string, did?: string): Promise<TileDoc | null> {
    const id = await this.getRecordID(definitionID, did)
    return id ? await this._loadDocument(id) : null
  }

  async getRecord<ContentType = unknown>(
    definitionID: string,
    did?: string
  ): Promise<ContentType | null> {
    const doc = await this.getRecordDocument(definitionID, did)
    return doc ? (doc.content as ContentType) : null
  }

  async setRecord(
    definitionID: string,
    content: Record<string, any>,
    options: CreateOptions = {}
  ): Promise<StreamID> {
    const [created, id] = await this._setRecordOnly(definitionID, content, options)
    if (created) {
      await this._setReference(options.controller ?? this.id, definitionID, id)
    }
    return id
  }

  /** @internal */
  async _setRecordOnly(
    definitionID: string,
    content: Record<string, any>,
    { pin }: CreateOptions = {}
  ): Promise<[boolean, StreamID]> {
    const existing = await this.getRecordID(definitionID, this.id)
    if (existing == null) {
      const definition = await this.getDefinition(definitionID)
      const ref = await this._createRecord(definition, content, { pin })
      return [true, ref]
    } else {
      const doc = await this._loadDocument(existing)
      await doc.update(content)
      return [false, doc.id]
    }
  }

  /** @internal */
  async _loadDocument(id: StreamID | string): Promise<TileDoc> {
    return await TileDocument.load(this.#ceramic, id)
  }

  /** @internal */
  async _createRecord(
    definition: DefinitionWithID,
    content: Record<string, any>,
    { controller, pin }: CreateOptions
  ): Promise<StreamID> {
    // Doc must first be created in a deterministic way
    const doc = await TileDocument.create<TileContent>(
      this.#ceramic,
      null,
      {
        deterministic: true,
        controllers: [controller ?? this.id],
        family: definition.id.toString(),
      },
      { anchor: false, publish: false }
    )
    // Then be updated with content and schema
    const updated = doc.update(content, { schema: definition.schema })
    if (pin ?? this.#autopin) {
      await Promise.all([updated, this.#ceramic.pin.add(doc.id)])
    } else {
      await updated
    }
    return doc.id
  }

  // References APIs

  /** @internal */
  async _setReference(controller: string, definitionID: string, id: StreamID): Promise<void> {
    await this._getIndexProxy(controller).changeContent((index) => {
      return { ...index, [definitionID]: id.toUrl() }
    })
  }

  /** @internal */
  async _setReferences(controller: string, references: IdentityIndex): Promise<void> {
    if (Object.keys(references).length !== 0) {
      await this._getIndexProxy(controller).changeContent((index) => {
        return { ...index, ...references }
      })
    }
  }
}
