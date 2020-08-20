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

export interface SetOptions {
  schema?: string
  tags?: Array<string>
}

export interface Accessors {
  list: (id?: string) => Promise<Array<string>>
  get: <T = any>(idOrKey: string, key?: string) => Promise<T | void>
  set: <T = any>(key: string, content: T) => Promise<void>
  remove: (key: string) => Promise<void>
}

export function createAccessors(docName: IDXDoctypeName, idx: IDX): Accessors {
  async function list(id?: string): Promise<Array<string>> {
    const doc = await loadIDXDoc(idx, docName, id)
    return doc ? Object.keys(doc.content) : []
  }

  async function get<T = any>(idOrKey: string, key?: string): Promise<T | void> {
    let docId
    if (key == null) {
      // In this case id is the key
      const doc = await loadIDXDoc(idx, docName)
      docId = doc?.content[idOrKey]
    } else {
      const doc = await loadIDXDoc(idx, docName, idOrKey)
      docId = doc?.content[key]
    }
    if (docId != null) {
      const doc = await idx.loadCeramicDocument(docId)
      return doc?.content
    }
  }

  async function set<T = any>(
    key: string,
    content: T,
    { schema, tags }: SetOptions = {}
  ): Promise<void> {
    const doctype = await idx.ceramic.createDocument('tile', {
      content,
      metadata: {
        owners: [idx.user.DID],
        schema,
        tags
      }
    })
    return await idx.changeOwnDocument(docName, (current = {}) => ({
      ...current,
      [key]: doctype.id
    }))
  }

  async function remove(key: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return await idx.changeOwnDocument(docName, ({ [key]: _exclude, ...content }) => content)
  }

  return { list, get, set, remove }
}
