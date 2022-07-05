import type { CeramicApi, StreamState } from '@ceramicnetwork/common'
import { jest } from '@jest/globals'

import { queryConnection, querySingle, toIndexQuery, toRelayConnection } from '../src/query'

describe('query', () => {
  const testState = {} as unknown as StreamState

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

  test('toRelayConnection()', () => {
    const expectedNode = {}
    const buildStreamFromState = jest.fn(() => expectedNode)
    expect(
      toRelayConnection({ buildStreamFromState } as unknown as CeramicApi, {
        edges: [
          { cursor: 'cursor1', node: testState },
          { cursor: 'cursor2', node: testState },
        ],
        pageInfo: { hasNextPage: true, hasPreviousPage: false },
      })
    ).toEqual({
      edges: [
        { cursor: 'cursor1', node: expectedNode },
        { cursor: 'cursor2', node: expectedNode },
      ],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    })
    expect(buildStreamFromState).toBeCalledTimes(2)
  })

  test('queryConnection()', async () => {
    const expectedNode = {}
    const buildStreamFromState = jest.fn(() => expectedNode)
    const queryIndex = jest.fn(() => ({
      edges: [
        { cursor: 'cursor1', node: testState },
        { cursor: 'cursor2', node: testState },
        { cursor: 'cursor3', node: testState },
      ],
      pageInfo: { hasNextPage: true, hasPreviousPage: false },
    }))
    const ceramic = { buildStreamFromState, index: { queryIndex } } as unknown as CeramicApi

    await expect(queryConnection(ceramic, { model: 'test', first: 3 })).resolves.toEqual({
      edges: [
        { cursor: 'cursor1', node: expectedNode },
        { cursor: 'cursor2', node: expectedNode },
        { cursor: 'cursor3', node: expectedNode },
      ],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    })
    expect(queryIndex).toBeCalledWith({ model: 'test', first: 3, after: undefined })
  })

  describe('querySingle()', () => {
    test('with result', async () => {
      const expectedNode = {}
      const buildStreamFromState = jest.fn(() => expectedNode)
      const queryIndex = jest.fn(() => ({
        edges: [{ cursor: 'cursor1', node: testState }],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      }))
      const ceramic = { buildStreamFromState, index: { queryIndex } } as unknown as CeramicApi

      await expect(querySingle(ceramic, { model: 'test' })).resolves.toBe(expectedNode)
      expect(queryIndex).toBeCalledWith({ model: 'test', last: 1 })
    })

    test('with no result', async () => {
      const queryIndex = jest.fn(() => ({
        edges: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      }))
      const ceramic = { index: { queryIndex } } as unknown as CeramicApi
      await expect(querySingle(ceramic, { model: 'test' })).resolves.toBeNull()
    })
  })
})
