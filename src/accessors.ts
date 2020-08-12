import { Doctype } from '@ceramicnetwork/ceramic-common'

import { IdxDoctypeName } from './doctypes'
import { Idp2p } from './idp2p'

export interface Accessors {
  list: (id: string) => Promise<Array<string>>
  get: <T = any>(id: string, key: string) => Promise<T>
  set: <T = any>(key: string, value: T) => Promise<void>
  remove: (key: string) => Promise<void>
}

export function createAccessors(name: IdxDoctypeName, idp2p: Idp2p): Accessors {
  async function loadDoc(id: string): Promise<Doctype> {
    return id != null && id === idp2p.ceramic.user?.DID
      ? await idp2p.getIdxDocument(name)
      : await idp2p.ceramic.loadDocument(id)
  }

  async function list(id: string): Promise<Array<string>> {
    const doc = await loadDoc(id)
    return Object.keys(doc.content)
  }

  async function get<T = any>(id: string, key: string): Promise<T> {
    const doc = await loadDoc(id)
    return doc.content[key]
  }

  async function set<T = any>(key: string, value: T): Promise<void> {
    return await idp2p.changeIdxDocument(name, content => ({ ...content, [key]: value }))
  }

  async function remove(key: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return await idp2p.changeIdxDocument(name, ({ [key]: _exclude, ...content }) => content)
  }

  return { list, get, set, remove }
}
