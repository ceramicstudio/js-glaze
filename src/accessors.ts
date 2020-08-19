import { Doctype } from '@ceramicnetwork/ceramic-common'

import { IDXDoctypeName } from './doctypes'
import { IDX } from './index'

export async function loadIDXDoc(
  idx: IDX,
  name: IDXDoctypeName,
  id?: string
): Promise<Doctype | null> {
  if (id == null) {
    if (idx.authenticated) {
      return await idx.getOwnDocument(name)
    } else {
      throw new Error('User is not authenticated')
    }
  } else if (idx.authenticated && id === idx.user.DID) {
    return await idx.getOwnDocument(name)
  } else {
    const rootDoc = await idx.getRootDocument(id)
    const docId = rootDoc?.content[name]
    return docId ? await idx.loadCeramicDocument(docId) : null
  }
}

export interface Accessors {
  list: (id?: string) => Promise<Array<string>>
  get: <T = any>(idOrKey: string, key?: string) => Promise<T>
  set: <T = any>(key: string, value: T) => Promise<void>
  remove: (key: string) => Promise<void>
}

export function createAccessors(name: IDXDoctypeName, idx: IDX): Accessors {
  async function list(id?: string): Promise<Array<string>> {
    const doc = await loadIDXDoc(idx, name, id)
    return doc ? Object.keys(doc.content) : []
  }

  async function get<T = any>(idOrKey: string, key?: string): Promise<T> {
    if (key == null) {
      // In this case id is the key
      const doc = await loadIDXDoc(idx, name)
      return doc?.content[idOrKey]
    } else {
      const doc = await loadIDXDoc(idx, name, idOrKey)
      return doc?.content[key]
    }
  }

  async function set<T = any>(key: string, value: T): Promise<void> {
    return await idx.changeOwnDocument(name, content => ({ ...content, [key]: value }))
  }

  async function remove(key: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return await idx.changeOwnDocument(name, ({ [key]: _exclude, ...content }) => content)
  }

  return { list, get, set, remove }
}
