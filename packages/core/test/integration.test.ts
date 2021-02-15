/**
 * @jest-environment idx
 */

import { CeramicApi } from '@ceramicnetwork/common'
import { definitions } from '@ceramicstudio/idx-constants'

// Note: we're using the dist lib here to make sure it behaves as expected
import { IDX } from '../dist'

declare global {
  const ceramic: CeramicApi
}

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
})
