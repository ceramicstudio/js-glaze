import type { CeramicApi, StreamState } from '@ceramicnetwork/common'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { jest } from '@jest/globals'
import type { DID } from 'dids'

import { Context } from '../src'
import { DocumentLoader } from '../src/loader'

describe('context', () => {
  const testState = {
    type: ModelInstanceDocument.STREAM_TYPE_ID,
    log: [{ cid: 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a' }],
  } as unknown as StreamState

  test('authenticated getter', () => {
    const ceramic = {} as unknown as CeramicApi
    const context = new Context({ ceramic })
    expect(context.authenticated).toBe(false)

    ceramic.did = { authenticated: true } as unknown as DID
    expect(context.authenticated).toBe(true)
  })

  test('ceramic getter', () => {
    const ceramic = {} as unknown as CeramicApi
    const context = new Context({ ceramic })
    expect(context.ceramic).toBe(ceramic)
  })

  test('loader getter', () => {
    const ceramic = {} as unknown as CeramicApi
    const context = new Context({ ceramic })
    expect(context.loader).toBeInstanceOf(DocumentLoader)
  })

  test('viewerID getter', () => {
    const ceramic = {} as unknown as CeramicApi
    const context = new Context({ ceramic })
    expect(context.viewerID).toBeNull()

    ceramic.did = { id: 'did:test:123' } as unknown as DID
    expect(context.viewerID).toBe('did:test:123')
  })

  describe('loadDoc()', () => {
    const ceramic = {} as unknown as CeramicApi

    test('calls the load() method of the loader', async () => {
      const expectedDoc = {}
      const load = jest.fn(() => expectedDoc)
      const loader = { load } as unknown as DocumentLoader
      const context = new Context({ ceramic, loader })

      await expect(context.loadDoc('testID')).resolves.toBe(expectedDoc)
      expect(load).toBeCalledWith('testID')
    })

    test('calls the clear() method of the loader if the fresh parameter is set', async () => {
      const clear = jest.fn()
      const load = jest.fn()
      const loader = { clear, load } as unknown as DocumentLoader
      const context = new Context({ ceramic, loader })

      await context.loadDoc('testID', true)
      expect(clear).toBeCalledWith('testID')
      expect(load).toBeCalledWith('testID')
    })
  })

  test('createDoc()', async () => {
    const expectedDoc = {}
    const create = jest.fn(() => expectedDoc)
    const loader = { create } as unknown as DocumentLoader
    const ceramic = {} as unknown as CeramicApi
    const context = new Context({ ceramic, loader })

    const content = {}
    await expect(context.createDoc('testID', content)).resolves.toBe(expectedDoc)
    expect(create).toBeCalledWith('testID', content)
  })

  test('updateDoc()', async () => {
    const expectedDoc = {}
    const update = jest.fn(() => expectedDoc)
    const loader = { update } as unknown as DocumentLoader
    const ceramic = {} as unknown as CeramicApi
    const context = new Context({ ceramic, loader })

    const content = {}
    await expect(context.updateDoc('testID', content)).resolves.toBe(expectedDoc)
    expect(update).toBeCalledWith('testID', content, undefined)
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
    const context = new Context({ ceramic })

    await expect(context.queryConnection({ model: 'test', first: 3 })).resolves.toEqual({
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

  test('querySingle()', async () => {
    const expectedNode = {}
    const buildStreamFromState = jest.fn(() => expectedNode)
    const queryIndex = jest.fn(() => ({
      edges: [{ cursor: 'cursor1', node: testState }],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    }))
    const ceramic = { buildStreamFromState, index: { queryIndex } } as unknown as CeramicApi
    const context = new Context({ ceramic })

    await expect(context.querySingle({ model: 'test' })).resolves.toBe(expectedNode)
    expect(queryIndex).toBeCalledWith({ model: 'test', last: 1 })
  })
})
