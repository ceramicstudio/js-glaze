import { Doctype } from '@ceramicnetwork/ceramic-common'

import { DoctypeProxy } from '../src/doctypes'
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

  describe('Ceramic API wrappers', () => {
    test('createDocument', async () => {
      const createDocument = jest.fn()
      const idx = new IDX({ ceramic: { createDocument, user: { id: 'did:test' } } as any })
      await idx.createDocument({ hello: 'test' }, { tags: ['test'] })
      expect(createDocument).toBeCalledWith('tile', {
        content: { hello: 'test' },
        metadata: {
          owners: ['did:test'],
          tags: ['test']
        }
      })
    })

    test('loadDocument', async () => {
      const loadDocument = jest.fn()
      const idx = new IDX({ ceramic: { loadDocument } as any })
      await Promise.all([idx.loadDocument('one'), idx.loadDocument('one'), idx.loadDocument('two')])
      expect(loadDocument).toBeCalledTimes(2)
    })
  })

  describe('Collection definitions APIs', () => {
    test('createCollectionDefinition', async () => {
      const createDocument = jest.fn(() => Promise.resolve({ id: 'ceramic://test' }))
      const idx = new IDX({ ceramic: { createDocument, user: { id: 'did:test' } } as any })
      await expect(idx.createCollectionDefinition({ name: 'test', schema: 'test' })).resolves.toBe(
        'ceramic://test'
      )
      expect(createDocument).toBeCalledTimes(1)
    })

    test('getCollectionDefinition', async () => {
      const loadDocument = jest.fn(() => Promise.resolve({ content: { name: 'definition' } }))
      const idx = new IDX({ ceramic: { loadDocument } as any })
      await expect(idx.getCollectionDefinition('ceramic://test')).resolves.toEqual({
        name: 'definition'
      })
      expect(loadDocument).toBeCalledWith('ceramic://test')
    })
  })

  describe('Collection APIs', () => {
    test('getCollectionId', async () => {
      const idx = new IDX({} as any)

      // No root doc
      idx.getRootDocument = (): Promise<any> => Promise.resolve(null)
      await expect(idx.getCollectionId('test', 'did')).resolves.toBeNull()

      // No matching collection ID
      idx.getRootDocument = (): Promise<any> => Promise.resolve({ content: {} })
      await expect(idx.getCollectionId('test', 'did')).resolves.toBeNull()

      const getRootDocument = jest.fn(() => Promise.resolve({ content: { exists: 'docId' } }))
      // @ts-expect-error
      idx.getRootDocument = getRootDocument
      await expect(idx.getCollectionId('exists', 'did')).resolves.toBe('docId')
      expect(getRootDocument).toHaveBeenCalledWith('did')
    })

    test('getCollection', async () => {
      const idx = new IDX({} as any)

      idx.getCollectionId = (): Promise<null> => Promise.resolve(null)
      await expect(idx.getCollection('test', 'did')).resolves.toBeNull()

      const doc = { content: {} }
      const loadDocument = jest.fn(() => Promise.resolve(doc))
      // @ts-expect-error
      idx.loadDocument = loadDocument
      const getCollectionId = jest.fn(() => Promise.resolve('ceramic://test'))
      idx.getCollectionId = getCollectionId
      await expect(idx.getCollection('test', 'did')).resolves.toBe(doc.content)
      expect(getCollectionId).toBeCalledWith('test', 'did')
      expect(loadDocument).toBeCalledWith('ceramic://test')
    })

    test('setCollectionId', async () => {
      const content = { test: true }
      const change = jest.fn(changeFunc => changeFunc(content))

      const idx = new IDX({} as any)
      idx._changeRootIndex = change

      await expect(idx.setCollectionId('defId', 'docId')).resolves.toBeUndefined()
      expect(change).toBeCalledTimes(1)
      expect(change).toReturnWith({ test: true, defId: 'docId' })
    })

    describe('setCollection', () => {
      test('existing collection ID', async () => {
        const rootDoc = { content: { defId: 'docId' } }

        const idx = new IDX({} as any)
        // @ts-expect-error
        idx._rootDocProxy = { get: (): Promise<any> => Promise.resolve(rootDoc) }

        const change = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ change }))
        // @ts-expect-error
        idx.loadDocument = loadDocument

        const content = { test: true }
        await idx.setCollection('defId', content)
        expect(loadDocument).toBeCalledWith('docId')
        expect(change).toBeCalledWith({ content })
      })

      test('adding collection ID', async () => {
        const idx = new IDX({} as any)
        // @ts-expect-error
        idx._rootDocProxy = { get: (): Promise<any> => Promise.resolve({ content: {} }) }

        const definition = { definition: true }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        // @ts-expect-error
        idx.getCollectionDefinition = getDefinition
        const createCollection = jest.fn(() => Promise.resolve('docId'))
        idx._createCollection = createCollection
        const setCollectionId = jest.fn()
        idx.setCollectionId = setCollectionId

        const content = { test: true }
        await idx.setCollection('defId', content)
        expect(getDefinition).toBeCalledWith('defId')
        expect(createCollection).toBeCalledWith(definition, content)
        expect(setCollectionId).toBeCalledWith('defId', 'docId')
      })
    })

    test('addCollection', async () => {
      const idx = new IDX({} as any)
      const createDefinition = jest.fn(() => Promise.resolve('defId'))
      idx.createCollectionDefinition = createDefinition
      const createCollection = jest.fn(() => Promise.resolve('docId'))
      idx._createCollection = createCollection
      const setCollectionId = jest.fn()
      idx.setCollectionId = setCollectionId

      const definition = { name: 'test', schema: 'docId' }
      const content = { test: true }
      await idx.addCollection(definition, content)
      expect(createDefinition).toBeCalledWith(definition)
      expect(createCollection).toBeCalledWith(definition, content)
      expect(setCollectionId).toBeCalledWith('defId', 'docId')
    })

    test('removeCollection', async () => {
      const content = { test: true, defId: 'docId' }
      const change = jest.fn(changeFunc => changeFunc(content))

      const idx = new IDX({} as any)
      idx._changeRootIndex = change

      await expect(idx.removeCollection('defId')).resolves.toBeUndefined()
      expect(change).toBeCalledTimes(1)
      expect(change).toReturnWith({ test: true })
    })

    test('_createCollection', async () => {
      const idx = new IDX({} as any)
      const createDocument = jest.fn(() => Promise.resolve({ id: 'docId' }))
      // @ts-expect-error
      idx.createDocument = createDocument

      const definition = { name: 'test', schema: 'schemaId' }
      const content = { test: true }
      await idx._createCollection(definition, content)
      expect(createDocument).toBeCalledWith(content, { schema: 'schemaId' })
    })
  })

  describe('accessor APIs', () => {
    test.todo('has')
    test.todo('get')
    test.todo('set')
    test.todo('remove')
    test.todo('_toCollectionId')
  })

  describe('Root document interactions', () => {
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
        idx.loadDocument = loadDoc

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
      await expect(idx._createOwnRootDoc(content)).resolves.toBe(doctype)
      expect(createDocument).toHaveBeenCalledTimes(1)
      expect(createDocument).toHaveBeenCalledWith('tile', {
        content,
        metadata: {
          owners: ['did:test:user'],
          tags: ['RootIndex', 'DocIdMap']
        }
      })
      expect(idx._did2rootId['did:test:user']).toBe('rootDocId')
    })

    test('_changeRootIndex', async () => {
      const doc = { content: { test: 'hello' }, change: jest.fn(value => Promise.resolve(value)) }
      const getRemote = jest.fn(() => Promise.resolve(doc))
      const idx = new IDX({ ceramic: {} as any })
      // @ts-expect-error
      idx._rootDocProxy = new DoctypeProxy(getRemote)

      const newContent = { test: 'test' }
      const changeFunc = jest.fn(() => newContent)
      await idx._changeRootIndex(changeFunc)

      expect(getRemote).toHaveBeenCalledTimes(1)
      expect(changeFunc).toHaveBeenCalledTimes(1)
      expect(changeFunc).toHaveBeenCalledWith(doc.content)
      expect(doc.change).toHaveBeenCalledTimes(1)
      expect(doc.change).toHaveBeenCalledWith({ content: newContent })
    })
  })
})
