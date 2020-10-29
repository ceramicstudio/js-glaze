import DocID from '@ceramicnetwork/docid'
import { DIDDocument } from 'did-resolver'

export function getIDXRoot(doc: DIDDocument): string | undefined {
  const service = (doc.service ?? []).find(s => s.type === 'IdentityIndexRoot')
  return service?.serviceEndpoint
}

export function toDocIDString(id: DocID | string): string {
  return typeof id === 'string' ? id : id.toString()
}
