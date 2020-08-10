import { CeramicApi, DIDProvider } from '@ceramicnetwork/ceramic-common'
import { DID } from 'dids'

// TODO
type AuthProvider = any

interface NewCeramicApi extends CeramicApi {
  getDIDProvider(): DIDProvider
  user: DID | undefined
  setUser(did: DID): void
}

export interface Idp2pOptions {
  ceramicApi: NewCeramicApi
}

export interface AuthenticateOptions {
  provider?: AuthProvider
}

export class Idp2p {
  _ceramicApi: NewCeramicApi

  constructor({ ceramicApi }: Idp2pOptions) {
    this._ceramicApi = ceramicApi
  }

  async _authenticateUser(provider: AuthProvider, paths: Array<string>): Promise<string> {
    const user = new DID(provider)
    // @ts-ignore: need to add support for paths in js-did
    const did = await user.authenticate(paths)
    this._ceramicApi.setUser(user)
    return did
  }

  async authenticate(paths: Array<string>, options: AuthenticateOptions = {}): Promise<string> {
    const provider = this._ceramicApi.getDIDProvider()
    const user = this._ceramicApi.user

    if (options.provider == null) {
      if (user == null) {
        return await this._authenticateUser(provider, paths)
      } else {
        // @ts-ignore: need to add support for paths in js-did
        return await user.authenticate(paths)
      }
    } else if (options.provider === provider) {
      // @ts-ignore: need to add support for paths in js-did
      return await user.authenticate(paths)
    } else {
      return await this._authenticateUser(options.provider, paths)
    }
  }

  get ceramic(): NewCeramicApi {
    return this._ceramicApi
  }

  get user(): DID {
    if (this._ceramicApi.user == null) {
      throw new Error('User is not authenticated')
    }
    return this._ceramicApi.user
  }
}
