import type { CeramicApi, CeramicSigner, GenesisCommit } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CommitID, StreamID } from '@ceramicnetwork/streamid'

import { TileLoader, getDeterministicQuery, keyToQuery, keyToString } from '../src'

describe('tile-loader', () => {
  const testCID = 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a'
  const testCommitID = new CommitID(1, testCID)
  const testStreamID = new StreamID(1, testCID)
  const testID1 = testStreamID.toString()
  const testID2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'

  describe('keyToQuery()', () => {
    test('with string key', () => {
      expect(keyToQuery(testID1)).toEqual({ streamId: testID1 })
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
      expect(keyToString(testID1)).toBe(testID1)
    })

    test('with URL key', () => {
      expect(keyToString(testStreamID.toUrl())).toBe(testID1)
    })

    test('with CommitID key', () => {
      expect(keyToString(testCommitID)).toBe(testCommitID.toString())
    })

    test('with StreamID key', () => {
      expect(keyToString(testStreamID)).toBe(testID1)
    })

    test('with Query key', () => {
      expect(keyToString({ streamId: testStreamID, genesis: {} as unknown as GenesisCommit })).toBe(
        testStreamID.toString()
      )
    })
  })

  describe('getDeterministicQuery()', () => {
    test('creates a TileQuery from the input metadata', async () => {
      const metadata = { controllers: ['did:test:123'], tags: ['test'] }
      const genesis = await TileDocument.makeGenesis({} as unknown as CeramicSigner, null, {
        ...metadata,
        deterministic: true,
      })
      const streamId = await StreamID.fromGenesis('tile', genesis)
      await expect(getDeterministicQuery(metadata)).resolves.toEqual({ genesis, streamId })
    })
  })

  describe('TileLoader', () => {
    test('provides batching', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(1)
      expect(multiQuery).toBeCalledWith([{ streamId: testID1 }, { streamId: testID2 }])
    })

    test('throws if one of the streams is not found', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await expect(Promise.all([loader.load(testID1), loader.load(testID2)])).rejects.toThrow(
        `Failed to load stream: ${testID2}`
      )
    })

    test('does not throw when using the loadMany() method', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await expect(loader.loadMany([testID1, testID2])).resolves.toEqual([
        {},
        new Error(`Failed to load stream: ${testID2}`),
      ])
    })

    test('does not cache by default', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })

      await loader.load(testID1)
      expect(multiQuery).toBeCalledTimes(1)

      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: testID1 }, { streamId: testID2 }])
    })

    test('has opt-in cache', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new TileLoader({
        cache: true,
        ceramic: { multiQuery } as unknown as CeramicApi,
      })

      await loader.load(testID1)
      expect(multiQuery).toBeCalledTimes(1)

      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: testID2 }])
    })

    test('use provided cache', async () => {
      const cache = new Map()
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new TileLoader({
        cache,
        ceramic: { multiQuery } as unknown as CeramicApi,
      })

      await loader.load(testID1)
      expect(multiQuery).toBeCalledTimes(1)
      expect(cache.has(testID1)).toBe(true)
      cache.delete(testID1)

      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: testID1 }, { streamId: testID2 }])
      expect(cache.has(testID1)).toBe(true)
      expect(cache.has(testID2)).toBe(true)
    })

    describe('cache() method allows to add streams to the internal cache', () => {
      test('returns false and does not affect the cache unless enabled', async () => {
        const stream = { id: testStreamID } as TileDocument
        const multiQuery = jest.fn(() => ({}))
        const loader = new TileLoader({ ceramic: { multiQuery } as unknown as CeramicApi })

        expect(loader.cache(stream)).toBe(false)
        await expect(loader.load(testStreamID)).rejects.toThrow(`Failed to load stream: ${testID1}`)
      })

      test('returns true and writes to the cache if enabled', async () => {
        const stream1 = { id: testStreamID, content: { ok: false } } as unknown as TileDocument
        const stream2 = { id: testStreamID, content: { ok: true } } as unknown as TileDocument

        const multiQuery = jest.fn(() => ({}))
        const loader = new TileLoader({
          cache: true,
          ceramic: { multiQuery } as unknown as CeramicApi,
        })

        expect(loader.cache(stream1)).toBe(true)
        // Should replace in cache
        expect(loader.cache(stream2)).toBe(true)

        await expect(loader.load(testStreamID)).resolves.toBe(stream2)
        expect(multiQuery).not.toBeCalled()
      })
    })

    test('create() method add the stream to the cache', async () => {
      const create = jest.fn((_ceramic, content: Record<string, unknown>) => ({
        id: testID1,
        content,
      }))
      TileDocument.create = create as unknown as typeof TileDocument.create

      const multiQuery = jest.fn(() => ({}))
      const loader = new TileLoader({
        cache: true,
        ceramic: { multiQuery } as unknown as CeramicApi,
      })

      const content = { foo: 'bar' }
      await loader.create(content)
      expect(create).toBeCalledTimes(1)

      await expect(loader.load(testID1)).resolves.toEqual({ id: testID1, content })
      expect(multiQuery).not.toBeCalled()
    })

    describe('deterministic() method computes the streamID to load', () => {
      test('returns the existing stream', async () => {
        const metadata = { controllers: ['did:test:123'], tags: ['foo'] }
        const genesis = await TileDocument.makeGenesis({} as unknown as CeramicSigner, null, {
          ...metadata,
          deterministic: true,
        })
        const streamId = await StreamID.fromGenesis('tile', genesis)
        const stream = { id: streamId, content: {} }

        const createStreamFromGenesis = jest.fn()
        const multiQuery = jest.fn(() => ({ [streamId.toString()]: stream }))
        const loader = new TileLoader({
          ceramic: { createStreamFromGenesis, multiQuery } as unknown as CeramicApi,
        })

        await expect(loader.deterministic(metadata)).resolves.toBe(stream)
        expect(multiQuery).toBeCalledWith([{ streamId, genesis }])
        expect(createStreamFromGenesis).not.toBeCalled()
      })

      test('creates the stream if needed', async () => {
        const metadata = { controllers: ['did:test:123'], tags: ['foo'] }
        const genesis = await TileDocument.makeGenesis({} as unknown as CeramicSigner, null, {
          ...metadata,
          deterministic: true,
        })
        const streamId = await StreamID.fromGenesis('tile', genesis)
        const stream = { id: streamId, content: null }

        const createStreamFromGenesis = jest.fn(() => stream)
        const multiQuery = jest.fn(() => ({}))
        const loader = new TileLoader({
          ceramic: { createStreamFromGenesis, multiQuery } as unknown as CeramicApi,
        })

        const options = { anchor: false, pin: true, publish: false, sync: 0 }
        await expect(loader.deterministic(metadata, options)).resolves.toBe(stream)
        expect(multiQuery).toBeCalledWith([{ streamId, genesis }])
        expect(createStreamFromGenesis).toBeCalledWith(
          TileDocument.STREAM_TYPE_ID,
          genesis,
          options
        )
      })
    })
  })
})
