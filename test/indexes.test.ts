/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Doctype } from '@ceramicnetwork/ceramic-common'

import { DoctypeProxy } from '../src/doctypes'
import { RootIndex } from '../src/indexes'
import { IDX } from '../src/index'

describe('indexes', () => {
  describe('RootIndex', () => {
    test.todo('get')
    test.todo('set')
    test.todo('remove')

    describe('_getDoc', () => {
      test('returns `null` if there is an existing mapping set to `null`', async () => {
        const idx = new IDX({ ceramic: {} as any })
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

        const idx = new IDX({ ceramic: {} as any })
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

        const idx = new IDX({ ceramic: {} as any })
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

      const idx = new IDX({ ceramic: { did: { id: 'did:test:user' } } as any })
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
      const idx = new IDX({ ceramic: { createDocument, did: { id: 'did:test:user' } } as any })
      const index = new RootIndex(idx)

      await expect(index._createOwnDoc()).resolves.toBe(doctype)
      expect(createDocument).toHaveBeenCalledTimes(1)
      expect(createDocument).toHaveBeenCalledWith('tile', {
        content: {},
        metadata: {
          owners: ['did:test:user'],
          tags: ['RootIndex', 'DocIdDocIdMap']
        }
      })
      expect(index._didCache['did:test:user']).toBe('rootDocId')
    })

    test('_change', async () => {
      const doc = { content: { test: 'hello' }, change: jest.fn(value => Promise.resolve(value)) }
      const getRemote = jest.fn(() => Promise.resolve(doc))
      const idx = new IDX({ ceramic: {} as any })
      const index = new RootIndex(idx)
      index._proxy = new DoctypeProxy(getRemote)

      const newContent = { test: 'test' }
      const changeFunc = jest.fn(() => newContent)
      await index._change(changeFunc)

      expect(getRemote).toHaveBeenCalledTimes(1)
      expect(changeFunc).toHaveBeenCalledTimes(1)
      expect(changeFunc).toHaveBeenCalledWith(doc.content)
      expect(doc.change).toHaveBeenCalledTimes(1)
      expect(doc.change).toHaveBeenCalledWith({ content: newContent })
    })
  })
})
