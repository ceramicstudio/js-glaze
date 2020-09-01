/**
 * @jest-environment ceramic
 */

import { CeramicApi } from '@ceramicnetwork/ceramic-common'
import { schemasList, publishSchemas } from '@ceramicstudio/idx-schemas'

import { IDX } from '../src/index'

declare global {
  const ceramic: CeramicApi
}

describe('integration', () => {
  test('get and set a custom definition', async () => {
    const schemas = await publishSchemas({ ceramic, schemas: schemasList })
    const idx = new IDX({ ceramic })
    const definitions = {
      'test:profile': await idx.createDefinition({
        name: 'test profile',
        schema: schemas.BasicProfile
      })
    }

    const alice = new IDX({ ceramic, definitions })
    await alice.set('test:profile', { name: 'Alice' })

    const bob = new IDX({ ceramic, definitions })
    const doc = await bob.get<{ name: string }>('test:profile', alice.id)
    expect(doc).toEqual({ name: 'Alice' })
  })
})
