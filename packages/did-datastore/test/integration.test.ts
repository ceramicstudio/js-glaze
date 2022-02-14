/**
 * @jest-environment glaze
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import type { CeramicApi } from '@ceramicnetwork/common'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { ModelManager } from '@glazed/devtools'
import type { ModelTypeAliases, PublishedModel } from '@glazed/types'
import { jest } from '@jest/globals'

// Note: we're using the dist lib here to make sure it behaves as expected
import { DIDDataStore } from '..'

declare global {
  const ceramic: CeramicApi
}

type ModelTypes = ModelTypeAliases<
  { Profile: { name?: string } },
  { profile1: 'Profile'; profile2: 'Profile' }
>

describe('integration', () => {
  jest.setTimeout(20000)

  let model: PublishedModel<ModelTypes>
  beforeAll(async () => {
    const manager = new ModelManager({ ceramic })
    const schemaID = await manager.createSchema('Profile', {
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
    const definition = {
      name: 'Profile',
      description: 'test profile',
      schema: manager.getSchemaURL(schemaID) as string,
    }
    await Promise.all([
      manager.createDefinition('profile1', definition),
      manager.createDefinition('profile2', definition),
    ])
    model = await manager.toPublished()
  })

  test('get and set a record', async () => {
    const writer = new DIDDataStore<ModelTypes>({ ceramic, model })
    // We can use the alias provided in the definitions to identify a resource
    await writer.set('profile1', { name: 'Alice' })

    const reader = new DIDDataStore<ModelTypes>({ ceramic, model })
    // Read from another client using the known writer DID
    const doc = await reader.get('profile1', writer.id)
    expect(doc).toEqual({ name: 'Alice' })
  })

  test('create, update and load record from cache', async () => {
    const cache = new Map<string, Promise<TileDocument>>()
    const store = new DIDDataStore<ModelTypes>({ cache, ceramic, model })

    // Sanity check to ensure record doesn't already exist
    await expect(store.has('profile2')).resolves.toBe(false)
    const recordID = await store.set('profile2', { name: 'Alice' })
    // Check record has been added to the cache
    expect(cache.has(recordID.toString())).toBe(true)

    await store.set('profile2', { name: 'Bob' })
    const cachedRecord = await cache.get(recordID.toString())
    // Cached record should have been updated
    expect(cachedRecord?.content).toEqual({ name: 'Bob' })
    // Check get() method has same content as cache
    await expect(store.get('profile2')).resolves.toEqual({ name: 'Bob' })
  })
})
