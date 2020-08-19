import { DIDDocument } from 'did-resolver'

export function getIDXRoot(doc: DIDDocument): string | undefined {
  const service = (doc.service ?? []).find(s => s.type === 'IdentityIndexRoot')
  return service?.serviceEndpoint
}
