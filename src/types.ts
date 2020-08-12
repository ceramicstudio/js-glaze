import { CeramicApi, DIDProvider } from '@ceramicnetwork/ceramic-common'
import { DID } from 'dids'

// TODO
export type AuthProvider = any

export interface NewCeramicApi extends CeramicApi {
  getDIDProvider(): DIDProvider
  user: DID | undefined
  setUser(did: DID): void
}
