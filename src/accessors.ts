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
  } else if (idx.authenticated && id === idx.did.id) {
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
  get: <T = any>(name: string, id?: string) => Promise<T | void>
  set: <T = any>(name: string, content: T, options?: SetOptions) => Promise<string>
  remove: (name: string) => Promise<void>
}

export function createAccessors(docName: IDXDoctypeName, idx: IDX): Accessors {
  async function list(id?: string): Promise<Array<string>> {
    const doc = await loadIDXDoc(idx, docName, id)
    return doc ? Object.keys(doc.content) : []
  }

  async function get<T = any>(name: string, id?: string): Promise<T | void> {
    const parentDoc = await loadIDXDoc(idx, docName, id)
    const docId = parentDoc?.content[name]
    if (docId != null) {
      const doc = await idx.loadCeramicDocument(docId)
      return doc.content
    }
  }

  async function set<T = any>(
    name: string,
    content: T,
    { schema, tags }: SetOptions = {}
  ): Promise<string> {
    const parentDoc = await idx.getOwnDocument(docName)
    const existingId = parentDoc.content[name]
    if (existingId == null) {
      const doctype = await idx.ceramic.createDocument('tile', {
        content,
        metadata: {
          owners: [idx.did.id],
          schema,
          tags
        }
      })
      await idx.changeOwnDocument(docName, (current = {}) => ({ ...current, [name]: doctype.id }))
      return doctype.id
    } else {
      const doc = await idx.loadCeramicDocument(existingId)
      await doc.change({ content })
      return existingId
    }
  }

  async function remove(name: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return await idx.changeOwnDocument(docName, ({ [name]: _exclude, ...content }) => content)
  }

  return { list, get, set, remove }
}
