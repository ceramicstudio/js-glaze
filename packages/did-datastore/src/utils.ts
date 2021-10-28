import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

const didRegex = /^did:([A-Za-z0-9]+):([A-Za-z0-9.\-:_]+)$/
export function isDIDstring(did: string): boolean {
  return didRegex.test(did)
}

export function assertDIDstring(did: string): void {
  if (!isDIDstring(did)) {
    throw new Error(`Invalid DID: ${did}`)
  }
}

export function getIDXMetadata(did: string): TileMetadataArgs {
  assertDIDstring(did)
  return { controllers: [did], family: 'IDX' }
}
