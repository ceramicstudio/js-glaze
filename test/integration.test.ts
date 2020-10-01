/**
 * @jest-environment ceramic
 */

import { CeramicApi } from '@ceramicnetwork/ceramic-common'
import { publishIDXConfig, publishedDefinitions } from '@ceramicstudio/idx-tools'

// Note: we're using the dist lib here to make sure it behaves as expected
import { IDX } from '..'

declare global {
  const ceramic: CeramicApi
}

describe('integration', () => {
  beforeAll(async () => {
    await publishIDXConfig(ceramic)
  })

  test('get and set an IDX definition', async () => {
    const profileID = publishedDefinitions.basicProfile

    const writer = new IDX({
      ceramic,
      definitions: { profile: profileID }
    })
    // We can use the alias provided in the definitions to identify a resource
    await writer.set('profile', { name: 'Alice' })

    const reader = new IDX({ ceramic })
    // The definition DocID can also be used to identify a known resource
    const doc = await reader.get<{ name: string }>(profileID, writer.id)
    expect(doc).toEqual({ name: 'Alice' })
  })
})
