/**
 * @jest-environment glaze
 */

import { CeramicApi } from '@ceramicnetwork/common'
import { ModelManager } from '@glazed/devtools'
import type { ModelTypeAliases } from '@glazed/types'

// Note: we're using the dist lib here to make sure it behaves as expected
import { DIDDataStore } from '../dist'

declare global {
  const ceramic: CeramicApi
}

type ModelTypes = ModelTypeAliases<{ Profile: { name?: string } }, { profile: 'Profile' }>

describe('integration', () => {
  jest.setTimeout(20000)

  test('get and set a definition', async () => {
    const manager = new ModelManager(ceramic)
    await manager.useCoreModel()

    const schemaRef = await manager.addSchema('Profile', {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Profile',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          maxLength: 150,
        },
      },
    } as any)
    const definitionRef = await manager.addDefinition('profile', {
      name: 'Profile',
      description: 'test profile',
      schema: schemaRef.toUrl(),
    })

    const model = await manager.toPublished()

    const writer = new DIDDataStore<ModelTypes>({ ceramic, model })
    // We can use the alias provided in the definitions to identify a resource
    await writer.set('profile', { name: 'Alice' })

    const reader = new DIDDataStore<ModelTypes>({ ceramic, model })
    // The definition StreamID can also be used to identify a known resource
    const doc = await reader.get(definitionRef.toString(), writer.id)
    expect(doc).toEqual({ name: 'Alice' })
  })
})
