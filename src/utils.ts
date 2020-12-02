import type DocID from '@ceramicnetwork/docid'

export function toDocIDString(id: DocID | string): string {
  return typeof id === 'string' ? id : id.toString()
}
