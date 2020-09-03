import { Doctype } from '@ceramicnetwork/ceramic-common'

import { DoctypeProxy } from './doctypes'
import { IDX } from './index'
import { DocID, Entry, RootIndexContent } from './types'
import { getIDXRoot } from './utils'
export class RootIndex {
  _idx: IDX
  _didCache: Record<string, DocID | null> = {}
  _proxy: DoctypeProxy

  constructor(idx: IDX) {
    this._idx = idx
    this._proxy = new DoctypeProxy(this._getOrCreateOwnDoc.bind(this))
  }

  async getIndex(did: string): Promise<RootIndexContent | null> {
    const rootDoc =
      this._idx.authenticated && did === this._idx.did.id
        ? await this._proxy.get()
        : await this._getDoc(did)
    return (rootDoc?.content as RootIndexContent) ?? null
  }

  async get(definitionId: DocID, did: string): Promise<Entry | null> {
    const index = await this.getIndex(did)
    return index?.[definitionId] ?? null
  }

  async set(definitionId: DocID, entry: Entry): Promise<void> {
    await this._proxy.changeContent<RootIndexContent>(content => ({
      ...content,
      [definitionId]: entry
    }))
  }

  async remove(definitionId: DocID): Promise<void> {
    await this._proxy.changeContent<RootIndexContent>(
      ({ [definitionId]: _remove, ...content }) => content
    )
  }

  async _getOrCreateOwnDoc(): Promise<Doctype> {
    const doc = await this._getDoc(this._idx.did.id)
    return doc ?? (await this._createOwnDoc())
  }

  async _getDoc(did: string): Promise<Doctype | null> {
    let rootId
    rootId = this._didCache[did]
    if (rootId === null) {
      return null
    }
    if (rootId == null) {
      rootId = await this._getId(did)
      this._didCache[did] = rootId
    }
    return rootId == null ? null : await this._idx.loadDocument(rootId)
  }

  async _getId(did: string): Promise<DocID | null> {
    const userDoc = await this._idx._resolver.resolve(did)
    return getIDXRoot(userDoc) ?? null
  }

  async _createOwnDoc(): Promise<Doctype> {
    // TODO: schema
    const doctype = await this._idx.createDocument({}, { tags: ['RootIndex'] })
    this._didCache[this._idx.id] = doctype.id
    return doctype
  }
}
