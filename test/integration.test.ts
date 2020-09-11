/**
 * @jest-environment ceramic
 */

import { CeramicApi } from '@ceramicnetwork/ceramic-common'
import { schemasList, publishSchemas } from '@ceramicstudio/idx-schemas'

// Note: we're using the dist lib here to make sure it behaves as expected
import { IDX } from '..'

declare global {
  const ceramic: CeramicApi
}

describe('integration', () => {
  let schemas: Record<string, string>

  beforeAll(async () => {
    schemas = await publishSchemas({ ceramic, schemas: schemasList })
  })

  test('get and set a custom definition', async () => {
    const idx = new IDX({ ceramic, schemas })

    // During development flow: create definitions used by the app
    const profileID = await idx.createDefinition({
      name: 'test profile',
      schema: schemas.BasicProfile
    })

    const writer = new IDX({
      ceramic,
      definitions: { profile: profileID },
      schemas
    })
    // We can use the alias provided in the definitions to identify a resource
    await writer.set('profile', { name: 'Alice' })

    const reader = new IDX({ ceramic, schemas })
    // The definition DocID can also be used to identify a known resource
    const doc = await reader.get<{ name: string }>(profileID, writer.id)
    expect(doc).toEqual({ name: 'Alice' })
  })
})
