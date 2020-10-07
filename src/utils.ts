import { DIDDocument } from 'did-resolver'

const CERAMIC_PREFIX = 'ceramic://'

export function getIDXRoot(doc: DIDDocument): string | undefined {
  const service = (doc.service ?? []).find(s => s.type === 'IdentityIndexRoot')
  return service?.serviceEndpoint
}

export function toCeramicString(value = ''): string {
  return value.startsWith(CERAMIC_PREFIX) ? value.slice(CERAMIC_PREFIX.length) : value
}

export function toCeramicURL(value = ''): string {
  return value.startsWith(CERAMIC_PREFIX) ? value : CERAMIC_PREFIX + value
}
