import { Doctype } from '@ceramicnetwork/ceramic-common'

import { DoctypeProxy } from './doctypes'
import { IDX } from './index'
import { DocID } from './types'
import { getIDXRoot } from './utils'

type MapIndexData = Record<string, string>

interface IndexOptions {
  idx: IDX
  getId: (did: string) => Promise<DocID | null>
  createOwn: () => Promise<Doctype>
  cache?: boolean
}

export abstract class Index<T = unknown> {
  _idx: IDX
  _getId: (did: string) => Promise<DocID | null>
  _createOwn: () => Promise<Doctype>
  _didCache: Record<string, DocID | null> = {}
  _useCache: boolean
  _proxy: DoctypeProxy

  constructor({ idx, getId, createOwn, cache = false }: IndexOptions) {
    this._idx = idx
    this._getId = getId
    this._createOwn = createOwn
    this._useCache = cache
    this._proxy = new DoctypeProxy(this._getOrCreateOwnDoc.bind(this))
  }

  abstract async _getOrCreateOwnDoc(): Promise<Doctype>

  abstract async getIndex(did: string): Promise<T | null>
}

export abstract class MapIndex<T extends MapIndexData> extends Index<T> {
  async getIndex(did: string): Promise<T | null> {
    const rootDoc =
      this._idx.authenticated && did === this._idx.did.id
        ? await this._proxy.get()
        : await this._getDoc(did)
    return (rootDoc?.content as T) ?? null
  }

  async get(definitionId: DocID, did: string): Promise<DocID | null> {
    const index = await this.getIndex(did)
    return index?.[definitionId] ?? null
  }

  async set(definitionId: DocID, collectionId: DocID): Promise<void> {
    await this._change(content => ({ ...content, [definitionId]: collectionId }))
  }

  async remove(definitionId: DocID): Promise<void> {
    await this._change(({ [definitionId]: _remove, ...content }) => content as T)
  }

  async _change(change: (content: T) => T): Promise<void> {
    const mutation = async (doc: Doctype): Promise<Doctype> => {
      await doc.change({ content: change(doc.content) })
      return doc
    }
    return await this._proxy.change(mutation)
  }

  async _getOrCreateOwnDoc(): Promise<Doctype> {
    const doc = await this._getDoc(this._idx.did.id)
    return doc ?? (await this._createOwnDoc())
  }

  async _getDoc(did: string): Promise<Doctype | null> {
    let rootId
    if (this._useCache) {
      rootId = this._didCache[did]
      if (rootId === null) {
        return null
      }
      if (rootId == null) {
        rootId = await this._getId(did)
        this._didCache[did] = rootId
      }
    } else {
      rootId = await this._getId(did)
    }
    return rootId == null ? null : await this._idx.loadDocument(rootId)
  }

  async _createOwnDoc(): Promise<Doctype> {
    const doctype = await this._createOwn()
    if (this._useCache) {
      this._didCache[this._idx.did.id] = doctype.id
    }
    return doctype
  }
}

export class RootIndex extends MapIndex<MapIndexData> {
  constructor(idx: IDX) {
    super({
      idx,
      cache: true,
      getId: async (did: string) => {
        const userDoc = await idx._resolver.resolve(did)
        return getIDXRoot(userDoc) ?? null
      },
      createOwn: async () => {
        return await idx.createDocument({}, { tags: ['RootIndex', 'DocIdDocIdMap'] })
      }
    })
  }
}
