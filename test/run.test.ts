import CeramicClient from '@ceramicnetwork/ceramic-http-client'
import { DID } from 'dids'

import { Idp2p } from '../src'

class CustomDID extends DID {
  get DID(): string {
    return 'did:3:bafyreibazdthhbrscyafmtpf4yipj3mfws4l4extia2inwptua2kdroqy4'
  }
}

class CustomCeramicClient extends CeramicClient {
  constructor(apiHost?: string) {
    super(apiHost)
    // @ts-ignore
    this.user = new CustomDID({} as any)
  }
}

describe('run test', () => {
  test('first', async () => {
    const ceramic = new CustomCeramicClient()
    // @ts-ignore
    const idp2p = new Idp2p({ ceramic })

    const accountsId = 'ceramic://bafyreid7gorzqk5siq3muib3qj22ngmtx7bxjb3g3o3irfusg7lhzckkfu'

    await Promise.all([
      idp2p.accounts.set('hello', 'world'),
      idp2p.changeIdxDocument('accounts', content => ({ ...content, other: 'test' })),
      idp2p.changeIdxDocument('accounts', content => ({ ...content, work: 'another' }))
    ])

    const res = await idp2p.ceramic.loadDocument(accountsId)
    console.log('res', res)
  })
})
