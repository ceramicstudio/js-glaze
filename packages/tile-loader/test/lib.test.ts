import type { CeramicApi, CeramicSigner, GenesisCommit } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CommitID, StreamID } from '@ceramicnetwork/streamid'

import { TileLoader, keyToQuery, keyToString } from '../src'

describe('tile-loader', () => {
  const testCID = 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a'
  const testCommitID = new CommitID(1, testCID)
  const testStreamID = new StreamID(1, testCID)

  describe('keyToQuery()', () => {
    test('with string key', () => {
      const streamId = testStreamID.toString()
      expect(keyToQuery(streamId)).toEqual({ streamId })
    })

    test('with CommitID key', () => {
      expect(keyToQuery(testCommitID)).toEqual({ streamId: testCommitID })
    })

    test('with StreamID key', () => {
      expect(keyToQuery(testStreamID)).toEqual({ streamId: testStreamID })
    })

    test('with Query key', () => {
      const query = {
        streamId: testStreamID,
        genesis: {} as unknown as GenesisCommit,
        paths: ['foo'],
      }
      expect(keyToQuery(query)).toEqual({ streamId: testStreamID, genesis: {} })
    })
  })

  describe('keyToString()', () => {
    test('with string key', () => {
      const key = testStreamID.toString()
      expect(keyToString(key)).toBe(key)
    })

    test('with CommitID key', () => {
      expect(keyToString(testCommitID)).toBe(testCommitID.toString())
    })

    test('with StreamID key', () => {
      expect(keyToString(testStreamID)).toBe(testStreamID.toString())
    })

    test('with Query key', () => {
      expect(keyToString({ streamId: testStreamID, genesis: {} as unknown as GenesisCommit })).toBe(
        testStreamID.toString()
      )
    })
  })

  describe('TileLoader', () => {
    test('provides batching', async () => {
      const multiQuery = jest.fn(() => ({ one: {}, two: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await Promise.all([loader.load('one'), loader.load('two')])
      expect(multiQuery).toBeCalledTimes(1)
      expect(multiQuery).toBeCalledWith([{ streamId: 'one' }, { streamId: 'two' }])
    })

    test('throws if one of the streams is not found', async () => {
      const multiQuery = jest.fn(() => ({ one: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await expect(Promise.all([loader.load('one'), loader.load('two')])).rejects.toThrow(
        'Failed to load stream: two'
      )
    })

    test('does not throw when using the loadMany() method', async () => {
      const multiQuery = jest.fn(() => ({ one: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await expect(loader.loadMany(['one', 'two'])).resolves.toEqual([
        {},
        new Error('Failed to load stream: two'),
      ])
    })

    test('does not cache by default', async () => {
      const multiQuery = jest.fn(() => ({ one: {}, two: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })

      await loader.load('one')
      expect(multiQuery).toBeCalledTimes(1)

      await Promise.all([loader.load('one'), loader.load('two')])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: 'one' }, { streamId: 'two' }])
    })

    test('has opt-in cache', async () => {
      const multiQuery = jest.fn(() => ({ one: {}, two: {} }))
      const loader = new TileLoader({
        cache: true,
        ceramic: { multiQuery } as unknown as CeramicApi,
      })

      await loader.load('one')
      expect(multiQuery).toBeCalledTimes(1)

      await Promise.all([loader.load('one'), loader.load('two')])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: 'two' }])
    })

    test('use provided cache', async () => {
      const cache = new Map()
      const multiQuery = jest.fn(() => ({ one: {}, two: {} }))
      const loader = new TileLoader({
        cache,
        ceramic: { multiQuery } as unknown as CeramicApi,
      })

      await loader.load('one')
      expect(multiQuery).toBeCalledTimes(1)
      expect(cache.has('one')).toBe(true)
      cache.delete('one')

      await Promise.all([loader.load('one'), loader.load('two')])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: 'one' }, { streamId: 'two' }])
      expect(cache.has('one')).toBe(true)
      expect(cache.has('two')).toBe(true)
    })

    test('has a create() method to prime the cache', async () => {
      const create = jest.fn((_ceramic, content) => ({ id: 'created', content }))
      TileDocument.create = create as unknown as typeof TileDocument.create

      const multiQuery = jest.fn(() => ({}))
      const loader = new TileLoader({
        cache: true,
        ceramic: { multiQuery } as unknown as CeramicApi,
      })

      const content = { foo: 'bar' }
      await loader.create(content)
      expect(create).toBeCalledTimes(1)

      await expect(loader.load('created')).resolves.toEqual({ id: 'created', content })
      expect(multiQuery).not.toBeCalled()
    })

    test('has a deterministic() method to compute the streamID to load', async () => {
      const metadata = { controllers: ['did:test:123'], tags: ['foo'] }
      const genesis = await TileDocument.makeGenesis({} as unknown as CeramicSigner, null, {
        ...metadata,
        deterministic: true,
      })
      const streamId = await StreamID.fromGenesis('tile', genesis)

      const multiQuery = jest.fn(() => ({ [streamId.toString()]: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })

      await loader.deterministic(metadata)
      expect(multiQuery).toBeCalledWith([{ streamId, genesis }])
    })
  })
})
