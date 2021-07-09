const didRegex = /^did:([A-Za-z0-9]+):([A-Za-z0-9.\-:_]+)$/
export function isDid(did: string): boolean {
  return didRegex.test(did)
}

export function assertDid(did: string): void {
  if (!isDid(did)) {
    throw new Error(`Invalid DID: ${did}`)
  }
}
