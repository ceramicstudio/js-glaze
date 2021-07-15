import type { CeramicApi } from '@ceramicnetwork/common'
import type StreamID from '@ceramicnetwork/streamid'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import type { ModelTypes } from '@datamodels/3box-essentials'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'
import type { CreateOptions, DefinitionWithID, Entry } from '@glazed/did-datastore'
import type { IdentityIndex } from '@glazed/did-datastore-model'

import { model } from './model'
import { isCaip10 } from './utils'

export { CreateOptions, DefinitionWithID, Entry } from '@glazed/did-datastore'

export { getLegacy3BoxProfileAsBasicProfile } from './3box'
export * from './utils'

export type Aliases = Record<string, string>
export type Index = IdentityIndex

export interface IDXOptions {
  aliases?: Record<string, string>
  autopin?: boolean
  ceramic: CeramicApi
}

export class IDX {
  _aliases: Aliases
  _ceramic: CeramicApi
  _model: DataModel<ModelTypes>
  _store: DIDDataStore

  constructor({ aliases = {}, autopin, ceramic }: IDXOptions) {
    this._aliases = aliases
    this._ceramic = ceramic
    this._model = new DataModel<ModelTypes>({ ceramic, model })
    this._store = new DIDDataStore({ autopin, ceramic, model: this._model })
  }

  get authenticated(): boolean {
    return this._store.authenticated
  }

  get ceramic(): CeramicApi {
    return this._store.ceramic
  }

  get id(): string {
    return this._store.id
  }

  // High-level APIs

  async has(name: string, id?: string): Promise<boolean> {
    const key = this._toIndexKey(name)
    const did = id && isCaip10(id) ? await this.caip10ToDid(id) : id
    return await this._store.has(key, did)
  }

  async get<T = unknown>(name: string, id?: string): Promise<T | null> {
    const key = this._toIndexKey(name)
    const did = id && isCaip10(id) ? await this.caip10ToDid(id) : id
    return await this._store.get(key, did)
  }

  async set(
    name: string,
    content: Record<string, any>,
    options?: CreateOptions
  ): Promise<StreamID> {
    const key = this._toIndexKey(name)
    return await this._store.set(key, content, options)
  }

  async merge<T extends Record<string, unknown> = Record<string, unknown>>(
    name: string,
    content: T,
    options?: CreateOptions
  ): Promise<StreamID> {
    const key = this._toIndexKey(name)
    return await this._store.merge<string, T>(key, content, options)
  }

  async setAll(
    contents: Record<string, Record<string, any>>,
    options?: CreateOptions
  ): Promise<Index> {
    const contentsByIDs = Object.entries(contents).reduce((acc, [name, content]) => {
      const key = this._toIndexKey(name)
      acc[key] = content
      return acc
    }, {} as Record<string, Record<string, any>>)
    return await this._store.setAll(contentsByIDs, options)
  }

  async setDefaults(
    contents: Record<string, Record<string, any>>,
    options?: CreateOptions
  ): Promise<Index> {
    const contentsByIDs = Object.entries(contents).reduce((acc, [name, content]) => {
      const key = this._toIndexKey(name)
      acc[key] = content
      return acc
    }, {} as Record<string, Record<string, any>>)
    return await this._store.setDefaults(contentsByIDs, options)
  }

  async remove(name: string): Promise<void> {
    const key = this._toIndexKey(name)
    await this._store.remove(key)
  }

  _toIndexKey(name: string): string {
    return this._aliases[name] ?? this._model.getDefinitionID(name as any) ?? name
  }

  // Identity Index APIs

  async getIndex(did?: string): Promise<Index | null> {
    return await this._store.getIndex(did)
  }

  iterator(did?: string): AsyncIterableIterator<Entry> {
    return this._store.iterator(did)
  }

  // Definition APIs

  async getDefinition(id: StreamID | string): Promise<DefinitionWithID> {
    return await this._store.getDefinition(id)
  }

  // Record APIs

  async getRecordID(key: string, did?: string): Promise<string | null> {
    return await this._store.getRecordID(key, did)
  }

  async getRecordDocument(
    key: string,
    did?: string
  ): Promise<TileDocument<Record<string, any> | null> | null> {
    return await this._store.getRecordDocument(key, did)
  }

  // CAIP-10 APIs

  async caip10ToDid(accountId: string): Promise<string> {
    const link = await Caip10Link.fromAccount(this._ceramic, accountId)
    if (link.did == null) {
      throw new Error(`No DID found for ${accountId}`)
    }
    return link.did
  }
}
