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
    const idx = new IDX({ ceramic, schemas })
    const definitions = {
      'test:profile': await idx.createDefinition({
        name: 'test profile',
        schema: schemas.BasicProfile
      })
    }

    const alice = new IDX({ ceramic, definitions, schemas })
    await alice.set('test:profile', { name: 'Alice' })

    const bob = new IDX({ ceramic, schemas })
    const doc = await bob.get<{ name: string }>(definitions['test:profile'], alice.id)
    expect(doc).toEqual({ name: 'Alice' })
  })
})
