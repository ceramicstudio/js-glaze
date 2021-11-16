/**
 * ```sh
 * npm install @glazed/did-datastore
 * ```
 *
 * @module did-datastore
 */

import type { CeramicApi } from '@ceramicnetwork/common'
import { StreamID } from '@ceramicnetwork/streamid'
import { CIP11_DEFINITION_SCHEMA_URL, CIP11_INDEX_SCHEMA_URL } from '@glazed/constants'
import { DataModel } from '@glazed/datamodel'
import type { Definition, IdentityIndex } from '@glazed/did-datastore-model'
import { TileLoader, getDeterministicQuery } from '@glazed/tile-loader'
import type { TileCache } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

import { TileProxy } from './proxy'
import type { TileDoc } from './proxy'
import { getIDXMetadata } from './utils'

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
  /**
   * Key (definition ID) identifying the record ID in the index
   */
  key: string
  /**
   * Record ID (Ceramic StreamID)
   */
  id: string
  /**
   * Record contents
   */
  record: unknown
}

export type CreateOptions = {
  /**
   * Optional controller for the record
   */
  controller?: string
  /**
   * Pin the created record stream (default)
   */
  pin?: boolean
}

export type DIDDataStoreParams<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  /**
   * Pin all created records streams (default)
   */
  autopin?: boolean
  /**
   * {@linkcode TileLoader} cache parameter, only used if `loader` is not provided
   */
  cache?: TileCache | boolean
  /**
   * A Ceramic client instance
   */
  ceramic: CeramicApi
  /**
   * Fallback DID to use when not explicitly set in method calls
   */
  id?: string
  /**
   * An optional {@linkcode TileLoader} instance to use
   */
  loader?: TileLoader
  /**
   * A {@linkcode DataModel} instance or runtime model aliases to use
   */
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
  #loader: TileLoader
  #model: DataModel<ModelTypes>

  constructor(params: DIDDataStoreParams<ModelTypes>) {
    const { autopin, cache, ceramic, id, loader, model } = params
    this.#autopin = autopin !== false
    this.#ceramic = ceramic
    this.#id = id
    this.#loader = loader ?? new TileLoader({ ceramic, cache })
    this.#model =
      model instanceof DataModel
        ? model
        : new DataModel<ModelTypes>({ autopin, loader: this.#loader, model })
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

  get loader(): TileLoader {
    return this.#loader
  }

  get model(): DataModel<ModelTypes> {
    return this.#model
  }

  // High-level APIs

  /**
   * Returns whether a record exists in the index or not.
   */
  async has(key: Alias, did?: string): Promise<boolean> {
    const definitionID = this.getDefinitionID(key as string)
    const ref = await this.getRecordID(definitionID, did)
    return ref != null
  }

  /**
   * Get the record contents.
   */
  async get<Key extends Alias, ContentType = DefinitionContentType<ModelTypes, Key>>(
    key: Key,
    did?: string
  ): Promise<ContentType | null> {
    const definitionID = this.getDefinitionID(key as string)
    return await this.getRecord<ContentType>(definitionID, did)
  }

  /**
   * Get the record contents for multiple DIDs at once.
   */
  async getMultiple<Key extends Alias, ContentType = DefinitionContentType<ModelTypes, Key>>(
    key: Key,
    dids: Array<string>
  ): Promise<Array<ContentType | null>> {
    const definitionID = this.getDefinitionID(key as string)
    // Create determinitic queries for the IDX streams and add path of the definition
    const queries = await Promise.all(
      dids.map(async (did) => {
        const { genesis, streamId } = await getDeterministicQuery(getIDXMetadata(did))
        return { genesis, streamId: streamId.toString(), paths: [definitionID] }
      })
    )
    const streams = await this.#ceramic.multiQuery(queries)
    const results = []
    for (const query of queries) {
      // Lookup the record ID in the index to access the record contents
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const recordURL = streams[query.streamId]?.content?.[definitionID] as string | undefined
      // Record IDs are set in URL format in the index, but string format in the streams object
      const record = recordURL ? streams[StreamID.fromString(recordURL).toString()] : null
      results.push((record?.content as ContentType) ?? null)
    }
    return results
  }

  /**
   * Set the record contents.
   *
   * **Warning**: calling this method replaces any existing contents in the record, use {@linkcode merge} if you want to only change some fields.
   */
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

  /**
   * Perform a shallow (one level) merge of the record contents.
   */
  async merge<Key extends Alias, ContentType = DefinitionContentType<ModelTypes, Key>>(
    key: Key,
    content: ContentType,
    options: CreateOptions = {}
  ): Promise<StreamID> {
    const definitionID = this.getDefinitionID(key as string)
    const existing = await this.getRecord<ContentType>(definitionID)
    const newContent = existing ? { ...existing, ...content } : content
    return await this.setRecord(definitionID, newContent, options)
  }

  /**
   * Set the contents of multiple records at once.
   * The index only gets updated after all wanted records have been written.
   *
   * **Warning**: calling this method replaces any existing contents in the records.
   */
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

  /**
   * Set the contents of multiple records if they are not already set in the index.
   */
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

  /**
   * Remove a record from the index.
   *
   * **Notice**: this *does not* change the contents of the record itself, only the index.
   */
  async remove(key: Alias, controller = this.id): Promise<void> {
    await this._getIndexProxy(controller).changeContent((index) => {
      if (index != null) {
        delete index[this.getDefinitionID(key as string)]
      }
      return index
    })
  }

  // Identity Index APIs

  /**
   * Load the full index contents.
   */
  async getIndex(did = this.id): Promise<IdentityIndex | null> {
    const rootDoc =
      this.authenticated && did === this.id
        ? await this._getIndexProxy(did).get()
        : await this._getIDXDoc(did)
    return rootDoc ? (rootDoc.content as IdentityIndex) : null
  }

  /**
   * Asynchronously iterate over the entries of the index, loading one record at a time.
   */
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
        const doc = await this.#loader.load(id)
        return { done: false, value: { key, id, record: doc.content } }
      },
    }
  }

  /** @internal */
  async _createIDXDoc(controller: string): Promise<TileDoc> {
    return await this.#loader.deterministic(getIDXMetadata(controller))
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
      await doc.update({}, { schema: CIP11_INDEX_SCHEMA_URL }, { pin: this.#autopin })
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

  /**
   * Get the definition ID for the given alias.
   */
  getDefinitionID(aliasOrID: string): string {
    return this.#model.getDefinitionID(aliasOrID) ?? aliasOrID
  }

  /**
   * Load and validate a definition by its ID.
   */
  async getDefinition(id: StreamID | string): Promise<DefinitionWithID> {
    const doc = await this.#loader.load(id)
    if (doc.metadata.schema !== CIP11_DEFINITION_SCHEMA_URL) {
      throw new Error('Invalid document: schema is not Definition')
    }
    return { ...doc.content, id: doc.id } as DefinitionWithID
  }

  // Record APIs

  /**
   * Load a record ID in the index for the given definition ID.
   */
  async getRecordID(definitionID: string, did?: string): Promise<string | null> {
    const index = await this.getIndex(did ?? this.id)
    return index?.[definitionID] ?? null
  }

  /**
   * Load a record TileDocument for the given definition ID.
   */
  async getRecordDocument(definitionID: string, did?: string): Promise<TileDoc | null> {
    const id = await this.getRecordID(definitionID, did)
    return id ? await this.#loader.load(id) : null
  }

  /**
   * Load a record contents for the given definition ID.
   */
  async getRecord<ContentType = unknown>(
    definitionID: string,
    did?: string
  ): Promise<ContentType | null> {
    const doc = await this.getRecordDocument(definitionID, did)
    return doc ? (doc.content as ContentType) : null
  }

  /**
   * Set the contents of a record for the given definition ID.
   */
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
    options: CreateOptions
  ): Promise<[boolean, StreamID]> {
    const existing = await this.getRecordID(definitionID, options.controller ?? this.id)
    if (existing == null) {
      const definition = await this.getDefinition(definitionID)
      const ref = await this._createRecord(definition, content, options)
      return [true, ref]
    } else {
      const doc = await this.#loader.load(existing)
      await doc.update(content)
      return [false, doc.id]
    }
  }

  /** @internal */
  async _createRecord(
    definition: DefinitionWithID,
    content: Record<string, any>,
    { controller, pin }: CreateOptions
  ): Promise<StreamID> {
    // Doc must first be created in a deterministic way
    const doc = await this.#loader.deterministic({
      controllers: [controller ?? this.id],
      family: definition.id.toString(),
    })
    // Then be updated with content and schema
    await doc.update(content, { schema: definition.schema }, { pin: pin ?? this.#autopin })
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
