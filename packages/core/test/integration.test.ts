/**
 * @jest-environment idx
 */

import { CeramicApi } from '@ceramicnetwork/common'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { Wallet as EthereumWallet } from '@ethersproject/wallet'
import { definitions } from '@ceramicstudio/idx-constants'
import * as u8a from 'uint8arrays'

// Note: we're using the dist lib here to make sure it behaves as expected
import { IDX } from '../dist'

declare global {
  const ceramic: CeramicApi
}

const createEthProvider = (wallet: EthereumWallet) => ({
  send: (
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
  ) => {
    if (request.method === 'eth_chainId') {
      callback(null, { result: '0x0539' })
    } else if (request.method === 'personal_sign') {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = u8a.toString(u8a.fromString(message.slice(2), 'base16'))
      }
      callback(null, { result: wallet.signMessage(message) })
    } else {
      callback(new Error(`Unsupported method: ${request.method}`))
    }
  },
})

describe('integration', () => {
  test('get and set an IDX definition', async () => {
    const profileID = definitions.basicProfile

    const writer = new IDX({ ceramic })
    // We can use the alias provided in the definitions to identify a resource
    await writer.set('basicProfile', { name: 'Alice' })

    const reader = new IDX({ ceramic })
    // The definition DocID can also be used to identify a known resource
    const doc = await reader.get<{ name: string }>(profileID, writer.id)
    expect(doc).toEqual({ name: 'Alice' })
  })

  test('get an invalid DID should fail', async () => {
    const invalidDid = 'did:f2_invalid'
    const reader = new IDX({ ceramic })
    await expect(reader.get<{ name: string }>('basicProfile', invalidDid)).rejects.toEqual(
      new Error('Invalid DID: ' + invalidDid)
    )
  })

  test('get using a caip10-link', async () => {
    // Create the IDX
    const writer = new IDX({ ceramic })
    await writer.set('basicProfile', { name: 'Bob' })

    // Create caip10-link
    const wallet = EthereumWallet.createRandom()

    const authProvider = new EthereumAuthProvider(createEthProvider(wallet), wallet.address)
    const accountId = (await authProvider.accountId()).toString().toLowerCase()
    const linkProof = await authProvider.createLink(writer.id)
    const caip10Doc = await ceramic.createDocument(
      'caip10-link',
      {
        metadata: { controllers: [accountId] },
      },
      { anchor: false }
    )
    await caip10Doc.change({ content: linkProof })

    // Read the record from idx using the caip10 account id
    const reader = new IDX({ ceramic })
    const doc = await reader.get<{ name: string }>('basicProfile', accountId)
    expect(doc).toEqual({ name: 'Bob' })
  })

  test('get using non existing caip10-link should throw', async () => {
    const accountId = '0xabc123@eip155:1337'

    // Read the record from idx using the caip10 account id
    const reader = new IDX({ ceramic })
    await expect(reader.get<{ name: string }>('basicProfile', accountId)).rejects.toEqual(
      new Error('No DID found for ' + accountId)
    )
  })
})
