import type { CeramicApi } from '@ceramicnetwork/common'
import type { StreamID } from '@ceramicnetwork/streamid'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { Definition } from '@glazed/common'

import { TileProxy } from './proxy'
import type { TileContent, TileDoc } from './proxy'
import { assertDid } from './utils'

export type DefinitionWithID<C extends Record<string, unknown> = Record<string, unknown>> =
  Definition<C> & { id: StreamID }

export type Index = Record<string, string>

export type Entry = {
  key: string
  id: string
  record: unknown
}

export type CreateOptions = {
  pin?: boolean
}

export type DIDDataStoreParams = {
  autopin?: boolean
  ceramic: CeramicApi
}

export class DIDDataStore {
  _autopin: boolean
  _ceramic: CeramicApi
  _indexProxy: TileProxy

  constructor({ autopin, ceramic }: DIDDataStoreParams) {
    this._autopin = autopin !== false
    this._ceramic = ceramic
    this._indexProxy = new TileProxy(this._getOwnIDXDoc.bind(this))
  }

  get authenticated(): boolean {
    return this._ceramic.did != null
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get id(): string {
    if (this._ceramic.did == null) {
      throw new Error('Ceramic instance is not authenticated')
    }
    return this._ceramic.did.id
  }

  // High-level APIs

  async has(definitionID: string, did?: string): Promise<boolean> {
    const ref = await this.getRecordID(definitionID, did)
    return ref != null
  }

  async get<ContentType = unknown>(
    definitionID: string,
    did?: string
  ): Promise<ContentType | null> {
    const doc = await this.getRecordDocument(definitionID, did)
    return doc ? (doc.content as ContentType) : null
  }

  async set(
    definitionID: string,
    content: Record<string, any>,
    options?: CreateOptions
  ): Promise<StreamID> {
    const [created, id] = await this._setRecordOnly(definitionID, content, options)
    if (created) {
      await this._setReference(definitionID, id)
    }
    return id
  }

  async merge<ContentType extends Record<string, unknown> = Record<string, unknown>>(
    definitionID: string,
    content: ContentType,
    options?: CreateOptions
  ): Promise<StreamID> {
    const existing = await this.get<ContentType>(definitionID)
    const newContent = existing ? { ...existing, ...content } : content
    return await this._setRecord(definitionID, newContent, options)
  }

  async setAll(
    contents: Record<string, Record<string, any>>,
    options?: CreateOptions
  ): Promise<Index> {
    const updates = Object.entries(contents).map(async ([definitionID, content]) => {
      const [created, id] = await this._setRecordOnly(definitionID, content, options)
      return [created, definitionID, id]
    }) as Array<Promise<[boolean, string, StreamID]>>
    const changes = await Promise.all(updates)

    const newReferences = changes.reduce((acc, [created, key, id]) => {
      if (created) {
        acc[key] = id.toUrl()
      }
      return acc
    }, {} as Index)
    await this._setReferences(newReferences)

    return newReferences
  }

  async setDefaults(
    contents: Record<string, Record<string, any>>,
    options?: CreateOptions
  ): Promise<Index> {
    const index = (await this.getIndex()) ?? {}

    const updates = Object.entries(contents)
      // This filter returned the type (string | Record<string, any>)[][]
      // we need to add a type guard to get the correct type here.
      .filter((entry): entry is [string, Record<string, any>] => index[entry[0]] == null)
      .map(async ([key, content]) => {
        const definition = await this.getDefinition(key)
        const id = await this._createRecord(definition, content, options)
        return { [key]: id.toUrl() }
      }) as Array<Promise<Index>>
    const changes = await Promise.all(updates)

    const newReferences = changes.reduce((acc, keyToID) => {
      return Object.assign(acc, keyToID)
    }, {} as Index)
    await this._setReferences(newReferences)

    return newReferences
  }

  async remove(definitionID: string): Promise<void> {
    await this._indexProxy.changeContent((index) => {
      if (index) delete index[definitionID]
      return index
    })
  }

  // Identity Index APIs

  async getIndex(did?: string): Promise<Index | null> {
    const rootDoc =
      this.authenticated && (did === this.id || did == null)
        ? await this._indexProxy.get()
        : await this._getIDXDoc(did ?? this.id)
    return rootDoc ? (rootDoc.content as Index) : null
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

  async _createIDXDoc(did: string): Promise<TileDoc> {
    assertDid(did)
    return await TileDocument.create<TileContent>(
      this._ceramic,
      null,
      { deterministic: true, controllers: [did], family: 'IDX' },
      { anchor: false, publish: false }
    )
  }

  async _getIDXDoc(did: string): Promise<TileDoc | null> {
    const doc = await this._createIDXDoc(did)
    return doc.content ? doc : null
  }

  async _getOwnIDXDoc(): Promise<TileDoc> {
    const doc = await this._createIDXDoc(this.id)
    if (doc.content == null) {
      // Doc just got created, set to empty object
      await doc.update({})
      if (this._autopin) {
        await this._ceramic.pin.add(doc.id)
      }
    }
    return doc
  }

  // Definition APIs

  async getDefinition(id: StreamID | string): Promise<DefinitionWithID> {
    const doc = await this._loadDocument(id)
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

  async _setRecord(
    definitionID: string,
    content: Record<string, any>,
    options?: CreateOptions
  ): Promise<StreamID> {
    const [created, id] = await this._setRecordOnly(definitionID, content, options)
    if (created) {
      await this._setReference(definitionID, id)
    }
    return id
  }

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

  async _loadDocument(id: StreamID | string): Promise<TileDoc> {
    return await TileDocument.load(this._ceramic, id)
  }

  async _createRecord(
    definition: DefinitionWithID,
    content: Record<string, any>,
    { pin }: CreateOptions = {}
  ): Promise<StreamID> {
    const metadata = {
      deterministic: true,
      controllers: [this.id],
      family: definition.id.toString(),
    }
    // Doc must first be created in a deterministic way
    const doc = await TileDocument.create<TileContent>(this._ceramic, null, metadata, {
      anchor: false,
      publish: false,
    })
    // Then be updated with content and schema
    const updated = doc.update(content, { ...metadata, schema: definition.schema })
    if (pin ?? this._autopin) {
      await Promise.all([updated, this._ceramic.pin.add(doc.id)])
    } else {
      await updated
    }
    return doc.id
  }

  // References APIs

  async _setReference(definitionID: string, id: StreamID): Promise<void> {
    await this._indexProxy.changeContent((index) => {
      return { ...index, [definitionID]: id.toUrl() }
    })
  }

  async _setReferences(references: Index): Promise<void> {
    if (Object.keys(references).length !== 0) {
      await this._indexProxy.changeContent((index) => {
        return { ...index, ...references }
      })
    }
  }
}
