import type { CeramicApi, StreamState } from '@ceramicnetwork/common'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { jest } from '@jest/globals'

import {
  createModelInstance,
  queryConnection,
  querySingle,
  toIndexQuery,
  toRelayPageInfo,
} from '../src/query'

describe('query', () => {
  const testState = {
    type: ModelInstanceDocument.STREAM_TYPE_ID,
    log: [{ cid: 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a' }],
  } as unknown as StreamState

  describe('createModelInstance()', () => {
    test('throws if the type does not match ModelInstanceDocument', () => {
      expect(() => {
        createModelInstance({ type: 0 } as unknown as StreamState)
      }).toThrow('Unexpected stream type: 0')
    })

    test('creates a ModelInstanceDocument instance', () => {
      expect(createModelInstance(testState)).toBeInstanceOf(ModelInstanceDocument)
    })
  })

  describe('toIndexQuery()', () => {
    test('throws if invalid parameters are provided', () => {
      expect(() => {
        // @ts-expect-error invalid parameters
        toIndexQuery({ foo: 'bar' })
      }).toThrow('Missing "first" or "last" connection argument')
    })

    test('creates a forward pagination object by default', () => {
      expect(toIndexQuery({ model: 'test', first: 10, last: 10, before: 'cursor' })).toEqual({
        model: 'test',
        first: 10,
        after: undefined,
      })
    })

    test('creates a backward pagination object', () => {
      expect(toIndexQuery({ model: 'test', last: 10, before: 'cursor' })).toEqual({
        model: 'test',
        last: 10,
        before: 'cursor',
      })
    })
  })

  test('toRelayPageInfo()', () => {
    expect(toRelayPageInfo({ hasNextPage: true, hasPreviousPage: false })).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    })
  })

  test('queryConnection()', async () => {
    const queryIndex = jest.fn(() => ({
      entries: [testState, testState, testState],
      pageInfo: { hasNextPage: true, hasPreviousPage: false },
    }))
    const ceramic = { index: { queryIndex } } as unknown as CeramicApi

    const { edges, pageInfo } = await queryConnection(ceramic, { model: 'test', first: 3 })
    expect(edges).toHaveLength(3)
    expect(pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    })

    expect(queryIndex).toBeCalledWith({ model: 'test', first: 3, after: undefined })
  })

  describe('querySingle()', () => {
    test('with result', async () => {
      const queryIndex = jest.fn(() => ({
        entries: [testState],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      }))
      const ceramic = { index: { queryIndex } } as unknown as CeramicApi

      await expect(querySingle(ceramic, { model: 'test' })).resolves.toBeInstanceOf(
        ModelInstanceDocument
      )
      expect(queryIndex).toBeCalledWith({ model: 'test', last: 1 })
    })

    test('with no result', async () => {
      const queryIndex = jest.fn(() => ({
        entries: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      }))
      const ceramic = { index: { queryIndex } } as unknown as CeramicApi
      await expect(querySingle(ceramic, { model: 'test' })).resolves.toBeNull()
    })
  })
})
