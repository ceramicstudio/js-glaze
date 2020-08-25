import { Doctype } from '@ceramicnetwork/ceramic-common'

import { IDX_DOCTYPE_CONFIGS, DoctypeProxy } from '../src/doctypes'
import { IDX } from '../src/index'

describe('IDX', () => {
  test('`authenticated` property', () => {
    const idx1 = new IDX({ ceramic: {} as any })
    expect(idx1.authenticated).toBe(false)

    const idx2 = new IDX({ ceramic: { user: {} } as any })
    expect(idx2.authenticated).toBe(true)
  })

  test('`ceramic` property', () => {
    const ceramic = {} as any
    const idx = new IDX({ ceramic })
    expect(idx.ceramic).toBe(ceramic)
  })

  test('`did` property', () => {
    const idx1 = new IDX({ ceramic: {} as any })
    expect(() => idx1.did).toThrow('Ceramic instance is not authenticated')

    const did = {}
    const idx2 = new IDX({ ceramic: { user: did } as any })
    expect(idx2.did).toBe(did)
  })

  test('`resolver` property', async () => {
    const registry = {
      test: jest.fn(() => Promise.resolve({}))
    } as any
    const idx = new IDX({ ceramic: {} as any, resolver: { registry } })
    await idx.resolver.resolve('did:test:123')
    expect(registry.test).toHaveBeenCalledTimes(1)
  })

  describe('authenticate', () => {
    test('does nothing if the ceramic instance already has a user', async () => {
      const setDIDProvider = jest.fn()
      const idx = new IDX({ ceramic: { setDIDProvider, user: {} } as any })
      await idx.authenticate({ provider: {} as any })
      expect(setDIDProvider).toHaveBeenCalledTimes(0)
    })

    test('attaches the provider to the ceramic instance', async () => {
      const provider = {} as any
      const setDIDProvider = jest.fn()
      const idx = new IDX({ ceramic: { setDIDProvider } as any })
      await idx.authenticate({ provider })
      expect(setDIDProvider).toHaveBeenCalledTimes(1)
      expect(setDIDProvider).toHaveBeenCalledWith(provider)
    })

    test('throws an error if there is no user and provider', async () => {
      const idx = new IDX({ ceramic: {} as any })
      await expect(idx.authenticate()).rejects.toThrow('Not provider available')
    })
  })

  test('loadCeramicDocument', async () => {
    const loadDocument = jest.fn()
    const idx = new IDX({ ceramic: { loadDocument } as any })
    await Promise.all([
      idx.loadCeramicDocument('one'),
      idx.loadCeramicDocument('one'),
      idx.loadCeramicDocument('two')
    ])
    expect(loadDocument).toBeCalledTimes(2)
  })

  test('getUserDocument', async () => {
    const loadDocument = jest.fn()
    const idx = new IDX({ ceramic: { loadDocument } as any })
    await Promise.all([
      idx.loadCeramicDocument('one'),
      idx.loadCeramicDocument('one'),
      idx.loadCeramicDocument('two')
    ])
    expect(loadDocument).toBeCalledTimes(2)
  })

  describe('getRootDocument', () => {
    test('returns `null` if there is an existing mapping set to `null`', async () => {
      const idx = new IDX({ ceramic: {} as any })
      idx._did2rootId['did:test:456'] = null
      await expect(idx.getRootDocument('did:test:456')).resolves.toBeNull()
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
      // @ts-expect-error
      idx._resolver.resolve = resolve
      idx.loadCeramicDocument = loadDoc

      await expect(idx.getRootDocument('did:test:123')).resolves.toBe(doc)
      expect(resolve).toHaveBeenCalledTimes(1)
      expect(resolve).toHaveBeenCalledWith('did:test:123')
      expect(loadDoc).toHaveBeenCalledTimes(1)
      expect(loadDoc).toHaveBeenCalledWith('ceramic://test')
      expect(idx._did2rootId['did:test:123']).toBe('ceramic://test')
    })

    test('calls the resolver and sets the root ID to null if not available', async () => {
      const resolve = jest.fn(() => {
        return Promise.resolve({
          service: [{ type: 'unknown', serviceEndpoint: 'ceramic://test' }]
        })
      })
      const loadDoc = jest.fn(() => Promise.resolve())

      const idx = new IDX({ ceramic: {} as any })
      // @ts-expect-error
      idx._resolver.resolve = resolve
      // @ts-expect-error
      idx.loadCeramicDocument = loadDoc

      await expect(idx.getRootDocument('did:test:123')).resolves.toBeNull()
      expect(resolve).toHaveBeenCalledTimes(1)
      expect(resolve).toHaveBeenCalledWith('did:test:123')
      expect(loadDoc).toHaveBeenCalledTimes(0)
      expect(idx._did2rootId['did:test:123']).toBeNull()
    })
  })

  test('getOwnDocument', async () => {
    const doc = { content: { test: 'hello' } }
    const getRemote = jest.fn(() => Promise.resolve(doc))
    const idx = new IDX({ ceramic: {} as any })
    // @ts-expect-error
    idx._docProxy['accounts'] = new DoctypeProxy(getRemote)

    await expect(idx.getOwnDocument('accounts')).resolves.toBe(doc)
    expect(getRemote).toHaveBeenCalledTimes(1)
  })

  test('changeOwnDocument', async () => {
    const doc = { content: { test: 'hello' }, change: jest.fn(value => Promise.resolve(value)) }
    const getRemote = jest.fn(() => Promise.resolve(doc))
    const idx = new IDX({ ceramic: {} as any })
    // @ts-expect-error
    idx._docProxy['accounts'] = new DoctypeProxy(getRemote)

    const newContent = { test: 'test' }
    const changeFunc = jest.fn(() => newContent)
    await idx.changeOwnDocument('accounts', changeFunc)

    expect(getRemote).toHaveBeenCalledTimes(1)
    expect(changeFunc).toHaveBeenCalledTimes(1)
    expect(changeFunc).toHaveBeenCalledWith(doc.content)
    expect(doc.change).toHaveBeenCalledTimes(1)
    expect(doc.change).toHaveBeenCalledWith({ content: newContent })
  })

  describe('_getProxy', () => {
    test('returns the proxy if already created', () => {
      const idx = new IDX({ ceramic: {} as any })
      const proxy = jest.fn()
      // @ts-expect-error
      idx._docProxy.test = proxy
      expect(idx._getProxy('test')).toBe(proxy)
    })

    test('creates the root proxy', async () => {
      const doc = {} as Doctype
      const getOrCreate = jest.fn(() => Promise.resolve(doc))
      const getOrCreateRoot = jest.fn(() => Promise.resolve(doc))
      const idx = new IDX({ ceramic: {} as any })
      idx._getOrCreateOwnDoc = getOrCreate
      idx._getOrCreateOwnRootDoc = getOrCreateRoot

      const rootProxy = idx._getProxy('root')
      await rootProxy.get()
      expect(getOrCreate).toHaveBeenCalledTimes(0)
      expect(getOrCreateRoot).toHaveBeenCalledTimes(1)
    })

    test('creates non-root proxies', async () => {
      const doc = {} as Doctype
      const getOrCreate = jest.fn(() => Promise.resolve(doc))
      const getOrCreateRoot = jest.fn(() => Promise.resolve(doc))
      const idx = new IDX({ ceramic: {} as any })
      idx._getOrCreateOwnDoc = getOrCreate
      idx._getOrCreateOwnRootDoc = getOrCreateRoot

      const testProxy1 = idx._getProxy('test1')
      await testProxy1.get()
      expect(getOrCreate).toHaveBeenCalledTimes(1)
      expect(getOrCreate).toHaveBeenCalledWith('test1')
      const testProxy2 = idx._getProxy('test2')
      await testProxy2.get()
      expect(getOrCreate).toHaveBeenCalledTimes(2)
      expect(getOrCreate).toHaveBeenLastCalledWith('test2')
      expect(getOrCreateRoot).toHaveBeenCalledTimes(0)
    })
  })

  test('_getOrCreateOwnRootDoc', async () => {
    const doc = {} as Doctype
    const createDoc = jest.fn(() => Promise.resolve(doc))
    const getDoc = jest.fn(() => Promise.resolve(null))

    const idx = new IDX({ ceramic: {} as any })
    idx._getOwnRootDoc = getDoc
    idx._createOwnRootDoc = createDoc

    await expect(idx._getOrCreateOwnRootDoc()).resolves.toBe(doc)
    expect(getDoc).toBeCalledTimes(1)
    expect(createDoc).toBeCalledTimes(1)
  })

  test('_getOwnRootDoc', async () => {
    const getRootDocument = jest.fn()
    const idx = new IDX({ ceramic: { user: { id: 'did:test:user' } } as any })
    idx.getRootDocument = getRootDocument
    await idx._getOwnRootDoc()
    expect(getRootDocument).toHaveBeenCalledTimes(1)
    expect(getRootDocument).toHaveBeenCalledWith('did:test:user')
  })

  test('_createOwnRootDoc', async () => {
    const doctype = { id: 'rootDocId' }
    const createDocument = jest.fn(() => Promise.resolve(doctype))
    const idx = new IDX({ ceramic: { createDocument, user: { id: 'did:test:user' } } as any })

    const content = { root: true }
    const config = IDX_DOCTYPE_CONFIGS.root
    await expect(idx._createOwnRootDoc(content)).resolves.toBe(doctype)
    expect(createDocument).toHaveBeenCalledTimes(1)
    expect(createDocument).toHaveBeenCalledWith('tile', {
      content,
      metadata: {
        owners: ['did:test:user'],
        schema: config.schema,
        tags: config.tags
      }
    })
    expect(idx._did2rootId['did:test:user']).toBe('rootDocId')
  })

  test('_getOrCreateOwnDoc', async () => {
    const doc = {} as Doctype
    const createDoc = jest.fn(() => Promise.resolve(doc))
    const getDoc = jest.fn(() => Promise.resolve(null))

    const idx = new IDX({ ceramic: {} as any })
    idx._getOwnDoc = getDoc
    idx._createOwnDoc = createDoc

    await expect(idx._getOrCreateOwnDoc('accounts')).resolves.toBe(doc)
    expect(getDoc).toBeCalledTimes(1)
    expect(getDoc).toBeCalledWith('accounts')
    expect(createDoc).toBeCalledTimes(1)
    expect(createDoc).toBeCalledWith('accounts')
  })

  test('_getOwnDoc', async () => {
    const docId = 'ceramic://accountsId'
    const doc = { id: docId }
    const loadDocument = jest.fn(id => {
      return id === docId ? Promise.resolve(doc) : Promise.reject(new Error('Invalid id'))
    })
    const idx = new IDX({ ceramic: { loadDocument } as any })
    const getRemote = jest.fn(() => Promise.resolve({ content: { accounts: docId } }))
    // @ts-expect-error
    idx._docProxy.root = new DoctypeProxy(getRemote)

    await expect(idx._getOwnDoc('profiles')).resolves.toBeNull()
    await expect(idx._getOwnDoc('accounts')).resolves.toBe(doc)
    expect(getRemote).toHaveBeenCalledTimes(2)
    expect(loadDocument).toHaveBeenCalledTimes(1)
    expect(loadDocument).toHaveBeenCalledWith(docId)
  })

  describe('_createOwnDoc', () => {
    test('throws an error if called with an unknown doctype name', async () => {
      const idx = new IDX({ ceramic: {} as any })
      await expect(idx._createOwnDoc('test')).rejects.toThrow('Unsupported IDX name: test')
    })

    test('creates the document and set it to the root doc', async () => {
      const doctype = { id: 'testDocId' }
      const createDocument = jest.fn(() => Promise.resolve(doctype))
      const idx = new IDX({ ceramic: { createDocument, user: { id: 'did:test:user' } } as any })

      const changeRoot = jest.fn()
      // @ts-expect-error
      idx._docProxy.root = { change: changeRoot }

      const content = { test: 'test' }
      const config = IDX_DOCTYPE_CONFIGS['accounts']
      await expect(idx._createOwnDoc('accounts', content)).resolves.toBe(doctype)
      expect(createDocument).toHaveBeenCalledTimes(1)
      expect(createDocument).toHaveBeenCalledWith('tile', {
        content,
        metadata: {
          owners: ['did:test:user'],
          schema: config.schema,
          tags: config.tags
        }
      })
      expect(changeRoot).toBeCalledTimes(1)
    })
  })
})
