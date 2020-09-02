/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { IDX } from '../src/index'

describe('IDX', () => {
  test('`authenticated` property', () => {
    const idx1 = new IDX({ ceramic: {} } as any)
    expect(idx1.authenticated).toBe(false)

    const idx2 = new IDX({ ceramic: { did: {} } } as any)
    expect(idx2.authenticated).toBe(true)
  })

  test('`ceramic` property', () => {
    const ceramic = {}
    const idx = new IDX({ ceramic } as any)
    expect(idx.ceramic).toBe(ceramic)
  })

  test('`did` property', () => {
    const idx1 = new IDX({ ceramic: {} } as any)
    expect(() => idx1.did).toThrow('Ceramic instance is not authenticated')

    const did = {}
    const idx2 = new IDX({ ceramic: { did } } as any)
    expect(idx2.did).toBe(did)
  })

  test('`id` property', () => {
    const idx1 = new IDX({ ceramic: {} } as any)
    expect(() => idx1.id).toThrow('Ceramic instance is not authenticated')

    const idx2 = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
    expect(idx2.id).toBe('did:test')
  })

  test('`resolver` property', async () => {
    const registry = {
      test: jest.fn(() => Promise.resolve({}))
    } as any
    const idx = new IDX({ ceramic: {}, resolver: { registry } } as any)
    await idx.resolver.resolve('did:test:123')
    expect(registry.test).toHaveBeenCalledTimes(1)
  })

  describe('authenticate', () => {
    test('does nothing if the ceramic instance already has a DID', async () => {
      const setDIDProvider = jest.fn()
      const idx = new IDX({ ceramic: { setDIDProvider, did: {} } } as any)
      await idx.authenticate({ provider: {} as any })
      expect(setDIDProvider).toHaveBeenCalledTimes(0)
    })

    test('attaches the provider to the ceramic instance', async () => {
      const provider = {} as any
      const setDIDProvider = jest.fn()
      const idx = new IDX({ ceramic: { setDIDProvider } } as any)
      await idx.authenticate({ provider })
      expect(setDIDProvider).toHaveBeenCalledTimes(1)
      expect(setDIDProvider).toHaveBeenCalledWith(provider)
    })

    test('throws an error if there is no DID and provider', async () => {
      const idx = new IDX({ ceramic: {} } as any)
      await expect(idx.authenticate()).rejects.toThrow('Not provider available')
    })
  })

  describe('Ceramic API wrappers', () => {
    test('createDocument', async () => {
      const createDocument = jest.fn()
      const idx = new IDX({ ceramic: { createDocument, did: { id: 'did:test' } } } as any)
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
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await Promise.all([idx.loadDocument('one'), idx.loadDocument('one'), idx.loadDocument('two')])
      expect(loadDocument).toBeCalledTimes(2)
    })
  })

  describe('Definition APIs', () => {
    test('createDefinition', async () => {
      const createDocument = jest.fn(() => Promise.resolve({ id: 'ceramic://test' }))
      const idx = new IDX({
        ceramic: { createDocument, did: { id: 'did:test' } },
        schemas: { Definition: 'ceramic://definition' }
      } as any)
      await expect(idx.createDefinition({ name: 'test', schema: 'test' })).resolves.toBe(
        'ceramic://test'
      )
      expect(createDocument).toBeCalledTimes(1)
    })

    test('getDefinition', async () => {
      const loadDocument = jest.fn(() =>
        Promise.resolve({
          content: { name: 'definition' },
          metadata: { schema: 'ceramic://definition' }
        })
      )
      const idx = new IDX({
        ceramic: { loadDocument },
        schemas: { Definition: 'ceramic://definition' }
      } as any)
      await expect(idx.getDefinition('ceramic://test')).resolves.toEqual({
        name: 'definition'
      })
      expect(loadDocument).toBeCalledWith('ceramic://test')
    })
  })

  describe('Entry APIs', () => {
    test('getEntryId', async () => {
      const idx = new IDX({} as any)

      idx._rootIndex = { get: (): Promise<any> => Promise.resolve(null) } as any
      await expect(idx.getEntryId('test', 'did')).resolves.toBeNull()

      const get = jest.fn(() => Promise.resolve('docId'))
      idx._rootIndex = { get } as any
      await expect(idx.getEntryId('exists', 'did')).resolves.toBe('docId')
      expect(get).toHaveBeenCalledWith('exists', 'did')
    })

    test('getEntry', async () => {
      const idx = new IDX({} as any)

      idx.getEntryId = (): Promise<null> => Promise.resolve(null)
      await expect(idx.getEntry('test', 'did')).resolves.toBeNull()

      const doc = { content: {} }
      const loadDocument = jest.fn(() => Promise.resolve(doc))
      idx.loadDocument = loadDocument
      const getEntryId = jest.fn(() => Promise.resolve('ceramic://test'))
      idx.getEntryId = getEntryId
      await expect(idx.getEntry('test', 'did')).resolves.toBe(doc.content)
      expect(getEntryId).toBeCalledWith('test', 'did')
      expect(loadDocument).toBeCalledWith('ceramic://test')
    })

    test('_setEntryId', async () => {
      const set = jest.fn()
      const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
      idx._rootIndex = { set } as any

      await expect(idx._setEntryId('defId', 'docId')).resolves.toBeUndefined()
      expect(set).toBeCalledWith('defId', 'docId')
    })

    describe('setEntry', () => {
      test('existing definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._rootIndex = { get: (): Promise<any> => Promise.resolve('docId') } as any

        const change = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ change }))
        idx.loadDocument = loadDocument

        const content = { test: true }
        await idx.setEntry('defId', content)
        expect(loadDocument).toBeCalledWith('docId')
        expect(change).toBeCalledWith({ content })
      })

      test('adding definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._rootIndex = { get: (): Promise<any> => Promise.resolve(null) } as any

        const definition = { name: 'test', schema: 'ceramic://...' }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        idx.getDefinition = getDefinition
        const createEntry = jest.fn(() => Promise.resolve('docId'))
        idx._createEntry = createEntry
        const setEntryId = jest.fn()
        idx._setEntryId = setEntryId

        const content = { test: true }
        await idx.setEntry('defId', content)
        expect(getDefinition).toBeCalledWith('defId')
        expect(createEntry).toBeCalledWith(definition, content)
        expect(setEntryId).toBeCalledWith('defId', 'docId')
      })
    })

    test('addEntry', async () => {
      const idx = new IDX({} as any)
      const createDefinition = jest.fn(() => Promise.resolve('defId'))
      idx.createDefinition = createDefinition
      const createEntry = jest.fn(() => Promise.resolve('docId'))
      idx._createEntry = createEntry
      const setEntryId = jest.fn()
      idx._setEntryId = setEntryId

      const definition = { name: 'test', schema: 'docId' }
      const content = { test: true }
      await expect(idx.addEntry(definition, content)).resolves.toBe('defId')
      expect(createDefinition).toBeCalledWith(definition)
      expect(createEntry).toBeCalledWith(definition, content)
      expect(setEntryId).toBeCalledWith('defId', 'docId')
    })

    test('removeEntry', async () => {
      const remove = jest.fn()
      const idx = new IDX({} as any)
      idx._rootIndex = { remove } as any

      await expect(idx.removeEntry('defId')).resolves.toBeUndefined()
      expect(remove).toBeCalledWith('defId')
    })

    test('_createEntry', async () => {
      const idx = new IDX({} as any)
      const createDocument = jest.fn(() => Promise.resolve({ id: 'docId' }))
      idx.createDocument = createDocument

      const definition = { name: 'test', schema: 'schemaId' }
      const content = { test: true }
      await idx._createEntry(definition, content)
      expect(createDocument).toBeCalledWith(content, { schema: 'schemaId' })
    })
  })

  describe('accessor APIs', () => {
    test.todo('has')
    test.todo('get')
    test.todo('set')
    test.todo('remove')
    test.todo('_toDefinitionId')
  })
})
