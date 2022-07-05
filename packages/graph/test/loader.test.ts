import type { CeramicApi } from '@ceramicnetwork/common'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { CommitID, StreamID } from '@ceramicnetwork/streamid'
import { jest } from '@jest/globals'

import { type DocumentCache, DocumentLoader, idToString } from '../src/loader'

const multiqueryTimeout = 2000

describe('loader', () => {
  const testCID = 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a'
  const testCommitID = new CommitID(1, testCID)
  const testStreamID = new StreamID(1, testCID)
  const testID1 = testStreamID.toString()
  const testID2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'

  describe('idToString()', () => {
    test('with string key', () => {
      expect(idToString(testID1)).toBe(testID1)
    })

    test('with URL key', () => {
      expect(idToString(testStreamID.toUrl())).toBe(testID1)
    })

    test('with CommitID key', () => {
      expect(idToString(testCommitID)).toBe(testCommitID.toString())
    })

    test('with StreamID key', () => {
      expect(idToString(testStreamID)).toBe(testID1)
    })
  })

  describe('DocumentLoader', () => {
    test('provides batching', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new DocumentLoader({
        ceramic: { multiQuery } as unknown as CeramicApi,
        multiqueryTimeout,
      })
      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(1)
      expect(multiQuery).toBeCalledWith(
        [{ streamId: testID1 }, { streamId: testID2 }],
        multiqueryTimeout
      )
    })

    test('throws if one of the streams is not found', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {} }))
      const loader = new DocumentLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await expect(Promise.all([loader.load(testID1), loader.load(testID2)])).rejects.toThrow(
        `Failed to load document: ${testID2}`
      )
    })

    test('does not throw when using the loadMany() method', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {} }))
      const loader = new DocumentLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
      await expect(loader.loadMany([testID1, testID2])).resolves.toEqual([
        {},
        new Error(`Failed to load document: ${testID2}`),
      ])
    })

    test('does not cache by default', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new DocumentLoader({
        ceramic: { multiQuery } as unknown as CeramicApi,
        multiqueryTimeout,
      })

      await loader.load(testID1)
      expect(multiQuery).toBeCalledTimes(1)

      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith(
        [{ streamId: testID1 }, { streamId: testID2 }],
        multiqueryTimeout
      )
    })

    test('has opt-in cache', async () => {
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new DocumentLoader({
        cache: true,
        ceramic: { multiQuery } as unknown as CeramicApi,
        multiqueryTimeout,
      })

      await loader.load(testID1)
      expect(multiQuery).toBeCalledTimes(1)

      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith([{ streamId: testID2 }], multiqueryTimeout)
    })

    test('use provided cache', async () => {
      const cache = new Map()
      const multiQuery = jest.fn(() => ({ [testID1]: {}, [testID2]: {} }))
      const loader = new DocumentLoader({
        cache,
        ceramic: { multiQuery } as unknown as CeramicApi,
        multiqueryTimeout,
      })

      await loader.load(testID1)
      expect(multiQuery).toBeCalledTimes(1)
      expect(cache.has(testID1)).toBe(true)
      cache.delete(testID1)

      await Promise.all([loader.load(testID1), loader.load(testID2)])
      expect(multiQuery).toBeCalledTimes(2)
      expect(multiQuery).toHaveBeenLastCalledWith(
        [{ streamId: testID1 }, { streamId: testID2 }],
        multiqueryTimeout
      )
      expect(cache.has(testID1)).toBe(true)
      expect(cache.has(testID2)).toBe(true)
    })

    describe('cache() method allows to add streams to the internal cache', () => {
      test('returns false and does not affect the cache unless enabled', async () => {
        const stream = { id: testStreamID } as ModelInstanceDocument
        const multiQuery = jest.fn(() => ({}))
        const loader = new DocumentLoader({ ceramic: { multiQuery } as unknown as CeramicApi })

        expect(loader.cache(stream)).toBe(false)
        await expect(loader.load(testStreamID)).rejects.toThrow(
          `Failed to load document: ${testID1}`
        )
      })

      test('returns true and writes to the cache if enabled', async () => {
        const stream1 = {
          id: testStreamID,
          content: { ok: false },
        } as unknown as ModelInstanceDocument
        const stream2 = {
          id: testStreamID,
          content: { ok: true },
        } as unknown as ModelInstanceDocument

        const multiQuery = jest.fn(() => ({}))
        const loader = new DocumentLoader({
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
        id: testStreamID,
        content,
      }))
      ModelInstanceDocument.create = create as unknown as typeof ModelInstanceDocument.create

      const multiQuery = jest.fn(() => ({}))
      const ceramic = { multiQuery } as unknown as CeramicApi
      const loader = new DocumentLoader({ cache: true, ceramic })

      const content = { foo: 'bar' }
      await loader.create(testStreamID, content)
      expect(create).toBeCalledTimes(1)
      expect(create).toBeCalledWith(
        ceramic,
        content,
        { controller: undefined, model: testStreamID },
        {}
      )

      await expect(loader.load(testStreamID)).resolves.toEqual({ id: testStreamID, content })
      expect(multiQuery).not.toBeCalled()
    })

    describe('update() method', () => {
      test('removes the stream from the cache before loading and updating', async () => {
        const cacheMap = new Map<string, Promise<ModelInstanceDocument>>()
        const cacheDelete = jest.fn((key: string) => cacheMap.delete(key))
        const cacheSet = jest.fn(
          (key: string, value: Promise<ModelInstanceDocument<Record<string, any>>>) => {
            return cacheMap.set(key, value)
          }
        )
        const cache: DocumentCache = {
          clear: () => cacheMap.clear(),
          get: (key) => cacheMap.get(key),
          delete: cacheDelete,
          set: cacheSet,
        }

        const replace = jest.fn()
        const multiQuery = jest.fn(() => ({
          [testID1]: { content: { foo: 'bar', test: false }, replace },
        }))

        const loader = new DocumentLoader({
          cache,
          ceramic: { multiQuery } as unknown as CeramicApi,
        })

        await loader.load(testID1)
        expect(cacheDelete).not.toBeCalled()
        expect(cacheMap.has(testID1)).toBe(true)
        expect(cacheSet).toBeCalledTimes(1)

        await loader.update(testID1, { test: true }, { pin: true })
        expect(replace).toBeCalledWith({ foo: 'bar', test: true }, { pin: true })
        expect(cacheDelete).toBeCalledWith(testID1)
        expect(cacheMap.has(testID1)).toBe(true)
        expect(cacheSet).toBeCalledTimes(2)
      })

      test('fails if the provided version does not match the loaded one', async () => {
        const replace = jest.fn()
        const multiQuery = jest.fn(() => ({
          [testID1]: { commitId: testCommitID, replace },
        }))

        const loader = new DocumentLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
        await expect(loader.update(testID1, { test: true }, { version: 'test' })).rejects.toThrow(
          'Stream version mismatch'
        )
        expect(replace).not.toBeCalled()
      })

      test('applies the update if the provided version matches the loaded one', async () => {
        const replace = jest.fn()
        const multiQuery = jest.fn(() => ({
          [testID1]: { commitId: testCommitID, content: { foo: 'bar', test: false }, replace },
        }))

        const loader = new DocumentLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
        await loader.update(testID1, { test: true }, { version: testCommitID.toString() })
        expect(replace).toBeCalledWith({ foo: 'bar', test: true }, {})
      })

      test('performs a full replacement if the option is set', async () => {
        const replace = jest.fn()
        const multiQuery = jest.fn(() => ({
          [testID1]: { commitId: testCommitID, content: { foo: 'bar', test: false }, replace },
        }))

        const loader = new DocumentLoader({ ceramic: { multiQuery } as unknown as CeramicApi })
        await loader.update(testID1, { test: true }, { replace: true })
        expect(replace).toBeCalledWith({ test: true }, {})
      })
    })
  })
})
