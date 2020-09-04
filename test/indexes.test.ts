/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import { Doctype } from '@ceramicnetwork/ceramic-common'

import { RootIndex } from '../src/indexes'
import { IDX } from '../src/index'

describe('indexes', () => {
  describe('RootIndex', () => {
    describe('getIndex', () => {
      test('for authenticated DID', async () => {
        const content = {}
        const get = jest.fn(() => Promise.resolve({ content }))
        const index = new RootIndex({ authenticated: true, id: 'did:test' } as any)
        index._proxy = { get } as any
        await expect(index.getIndex('did:test')).resolves.toBe(content)
        expect(get).toBeCalled()
      })

      test('for another DID', async () => {
        const content = {}
        const get = jest.fn(() => Promise.resolve({ content }))
        const index = new RootIndex({ authenticated: true, id: 'did:other' } as any)
        index._getDoc = get as any
        await expect(index.getIndex('did:test')).resolves.toBe(content)
        expect(get).toBeCalledWith('did:test')
      })

      test('when not authenticated', async () => {
        const content = {}
        const get = jest.fn(() => Promise.resolve({ content }))
        const index = new RootIndex({ authenticated: false } as any)
        index._getDoc = get as any
        await expect(index.getIndex('did:test')).resolves.toBe(content)
        expect(get).toBeCalledWith('did:test')
      })
    })

    describe('get', () => {
      test('returns `null` if the index is not found', async () => {
        const index = new RootIndex({} as any)
        const getIndex = jest.fn(() => Promise.resolve(null))
        index.getIndex = getIndex
        await expect(index.get('ceramic://test', 'did:test')).resolves.toBeNull()
        expect(getIndex).toBeCalledWith('did:test')
      })

      test('returns `null` if the definition ID is not set', async () => {
        const index = new RootIndex({} as any)
        const getIndex = jest.fn(() => Promise.resolve({}))
        index.getIndex = getIndex
        await expect(index.get('ceramic://test', 'did:test')).resolves.toBeNull()
        expect(getIndex).toBeCalledWith('did:test')
      })

      test('returns the existing entry', async () => {
        const index = new RootIndex({} as any)
        const entry = { ref: 'test', tags: [] }
        const getIndex = jest.fn(() => Promise.resolve({ 'ceramic://test': entry }))
        index.getIndex = getIndex
        await expect(index.get('ceramic://test', 'did:test')).resolves.toBe(entry)
        expect(getIndex).toBeCalledWith('did:test')
      })
    })

    test('set', async () => {
      const content = { test: true }
      const changeContent = jest.fn(change => change(content))
      const index = new RootIndex({} as any)
      index._proxy = { changeContent } as any
      await index.set('testId', { ref: 'test', tags: [] })
      expect(changeContent).toReturnWith({ test: true, testId: { ref: 'test', tags: [] } })
    })

    test('remove', async () => {
      const content = { test: true, testId: { ref: 'test', tags: [] } }
      const changeContent = jest.fn(change => change(content))
      const index = new RootIndex({} as any)
      index._proxy = { changeContent } as any
      await index.remove('testId')
      expect(changeContent).toReturnWith({ test: true })
    })

    describe('_getDoc', () => {
      test('returns `null` if there is an existing mapping set to `null`', async () => {
        const idx = new IDX({ ceramic: {} } as any)
        const index = new RootIndex(idx)
        index._didCache['did:test:456'] = null
        await expect(index._getDoc('did:test:456')).resolves.toBeNull()
      })

      test('calls the resolver and extract the root ID', async () => {
        const doc = {} as Doctype
        const resolve = jest.fn(() => {
          return Promise.resolve({
            service: [{ type: 'IdentityIndexRoot', serviceEndpoint: 'ceramic://test' }]
          })
        })
        const loadDoc = jest.fn(() => Promise.resolve(doc))

        const idx = new IDX({ ceramic: {} } as any)
        idx._resolver.resolve = resolve
        idx.loadDocument = loadDoc

        const index = new RootIndex(idx)
        await expect(index._getDoc('did:test:123')).resolves.toBe(doc)
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith('did:test:123')
        expect(loadDoc).toHaveBeenCalledTimes(1)
        expect(loadDoc).toHaveBeenCalledWith('ceramic://test')
        expect(index._didCache['did:test:123']).toBe('ceramic://test')
      })

      test('calls the resolver and sets the root ID to null if not available', async () => {
        const resolve = jest.fn(() => {
          return Promise.resolve({
            service: [{ type: 'unknown', serviceEndpoint: 'ceramic://test' }]
          })
        })
        const loadDoc = jest.fn(() => Promise.resolve())

        const idx = new IDX({ ceramic: {} } as any)
        idx._resolver.resolve = resolve
        idx.loadDocument = loadDoc

        const index = new RootIndex(idx)
        await expect(index._getDoc('did:test:123')).resolves.toBeNull()
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith('did:test:123')
        expect(loadDoc).toHaveBeenCalledTimes(0)
        expect(index._didCache['did:test:123']).toBeNull()
      })
    })

    test('_getOrCreateOwnDoc', async () => {
      const doc = {} as Doctype
      const createDoc = jest.fn(() => Promise.resolve(doc))
      const getDoc = jest.fn(() => Promise.resolve(null))

      const idx = new IDX({ ceramic: { did: { id: 'did:test:user' } } } as any)
      const index = new RootIndex(idx)
      index._getDoc = getDoc
      index._createOwnDoc = createDoc

      await expect(index._getOrCreateOwnDoc()).resolves.toBe(doc)
      expect(getDoc).toBeCalledTimes(1)
      expect(createDoc).toBeCalledTimes(1)
    })

    test('_createOwnDoc', async () => {
      const doctype = { id: 'rootDocId' }
      const createDocument = jest.fn(() => Promise.resolve(doctype))
      const idx = new IDX({
        ceramic: { createDocument, did: { id: 'did:test:user' } },
        schemas: { Index: 'schemaId' }
      } as any)
      const index = new RootIndex(idx)

      await expect(index._createOwnDoc()).resolves.toBe(doctype)
      expect(createDocument).toHaveBeenCalledTimes(1)
      expect(createDocument).toHaveBeenCalledWith('tile', {
        content: {},
        metadata: {
          owners: ['did:test:user'],
          schema: 'schemaId',
          tags: ['RootIndex']
        }
      })
      expect(index._didCache['did:test:user']).toBe('rootDocId')
    })
  })
})
