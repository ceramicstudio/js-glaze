import { Doctype } from '@ceramicnetwork/ceramic-common'

import { DoctypeProxy } from './doctypes'
import { IDX } from './index'
import { DocID, Entry, RootIndexContent } from './types'
export class RootIndex {
  _idx: IDX
  _didCache: Record<string, DocID | null> = {}
  _proxy: DoctypeProxy

  constructor(idx: IDX) {
    this._idx = idx
    this._proxy = new DoctypeProxy(this._getOwnDoc.bind(this))
  }

  async getIndex(did: string): Promise<RootIndexContent | null> {
    const rootDoc =
      this._idx.authenticated && did === this._idx.id
        ? await this._proxy.get()
        : await this._getDoc(did)
    return (rootDoc?.content as RootIndexContent) ?? null
  }

  async get(definitionId: DocID, did: string): Promise<Entry | null> {
    const index = await this.getIndex(did)
    return index?.[definitionId] ?? null
  }

  async set(definitionId: DocID, entry: Entry): Promise<void> {
    await this._proxy.changeContent<RootIndexContent>(content => {
      return { ...content, [definitionId]: entry }
    })
  }

  async remove(definitionId: DocID): Promise<void> {
    await this._proxy.changeContent<RootIndexContent>(({ [definitionId]: _remove, ...content }) => {
      return content
    })
  }

  async _getOwnDoc(): Promise<Doctype> {
    const doc = await this._getDoc(this._idx.id)
    if (doc == null) {
      throw new Error('IDX is not supported by the authenticated DID')
    }
    return doc
  }

  async _getDoc(did: string): Promise<Doctype | null> {
    let rootId
    rootId = this._didCache[did]
    if (rootId === null) {
      return null
    }
    if (rootId == null) {
      rootId = await this._idx.getIDXDocID(did)
      this._didCache[did] = rootId
    }
    return rootId == null ? null : await this._idx.loadDocument(rootId)
  }
}
