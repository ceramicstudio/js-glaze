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

  describe('Main APIs', () => {
    test('has - returns true', async () => {
      const getEntry = jest.fn(() => ({}))
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx._getEntry = getEntry as any
      await expect(idx.has('test', 'did')).resolves.toBe(true)
      expect(getEntry).toBeCalledWith('docId', 'did')
    })

    test('has - returns false', async () => {
      const getEntry = jest.fn(() => null)
      const idx = new IDX({
        ceramic: { did: { id: 'did:test' } },
        definitions: { test: 'docId' }
      } as any)
      idx._getEntry = getEntry as any
      await expect(idx.has('test')).resolves.toBe(false)
      expect(getEntry).toBeCalledWith('docId', undefined)
    })

    test('get', async () => {
      const content = {}
      const getEntryContent = jest.fn(() => content)
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx.getEntryContent = getEntryContent as any
      await expect(idx.get('test', 'did')).resolves.toBe(content)
      expect(getEntryContent).toBeCalledWith('docId', 'did')
    })

    test('getTags', async () => {
      const tags = ['test']
      const getEntryTags = jest.fn(() => tags)
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx.getEntryTags = getEntryTags as any
      await expect(idx.getTags('test', 'did')).resolves.toBe(tags)
      expect(getEntryTags).toBeCalledWith('docId', 'did')
    })

    test('set', async () => {
      const content = {}
      const setEntryContent = jest.fn(() => 'contentId')
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx.setEntryContent = setEntryContent as any
      await expect(idx.set('test', content)).resolves.toBe('contentId')
      expect(setEntryContent).toBeCalledWith('docId', content)
    })

    test('addTag', async () => {
      const tags = ['new']
      const addEntryTag = jest.fn(() => Promise.resolve(tags))
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx.addEntryTag = addEntryTag as any
      await expect(idx.addTag('test', 'new')).resolves.toEqual(tags)
      expect(addEntryTag).toBeCalledWith('docId', 'new')
    })

    test('removeTag', async () => {
      const tags = ['other']
      const removeEntryTag = jest.fn(() => Promise.resolve(tags))
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx.removeEntryTag = removeEntryTag as any
      await expect(idx.removeTag('test', 'new')).resolves.toEqual(tags)
      expect(removeEntryTag).toBeCalledWith('docId', 'new')
    })

    test('remove', async () => {
      const removeEntry = jest.fn()
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx.removeEntry = removeEntry
      await expect(idx.remove('test')).resolves.toBeUndefined()
      expect(removeEntry).toBeCalledWith('docId')
    })

    describe('_toDefinitionId', () => {
      test('resolves the existing alias', () => {
        const idx = new IDX({ definitions: { test: 'docId' } } as any)
        expect(idx._toDefinitionId('test')).toBe('docId')
      })

      test('resolves the existing alias with `idx:` prefix', () => {
        const idx = new IDX({ definitions: { 'idx:test': 'docId' } } as any)
        expect(idx._toDefinitionId('test')).toBe('docId')
      })

      test('returns the doc ID if valid', () => {
        const idx = new IDX({} as any)
        expect(idx._toDefinitionId('ceramic://docId')).toBe('ceramic://docId')
      })

      test('throws an error if invalid name or doc ID', () => {
        const idx = new IDX({} as any)
        expect(() => idx._toDefinitionId('test')).toThrow('Invalid name: test')
      })
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

  describe('Root Index APIs', () => {
    test('getRoot with provided DID', async () => {
      const getIndex = jest.fn()
      const idx = new IDX({} as any)
      idx._rootIndex = { getIndex } as any
      await idx.getRoot('did:test')
      expect(getIndex).toBeCalledWith('did:test')
    })

    test('getRoot with own DID', async () => {
      const getIndex = jest.fn()
      const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
      idx._rootIndex = { getIndex } as any
      await idx.getRoot()
      expect(getIndex).toBeCalledWith('did:test')
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
    test('_getEntry', async () => {
      const idx = new IDX({} as any)

      idx._rootIndex = { get: (): Promise<any> => Promise.resolve(null) } as any
      await expect(idx._getEntry('test', 'did')).resolves.toBeNull()

      const entry = { tags: [], ref: 'ceramic://' }
      const get = jest.fn(() => Promise.resolve(entry))
      idx._rootIndex = { get } as any
      await expect(idx._getEntry('exists', 'did')).resolves.toBe(entry)
      expect(get).toHaveBeenCalledWith('exists', 'did')
    })

    test('getEntryContent', async () => {
      const idx = new IDX({} as any)

      idx._getEntry = (): Promise<null> => Promise.resolve(null)
      await expect(idx.getEntryContent('test', 'did')).resolves.toBeNull()

      const doc = { content: {} }
      const entry = { tags: [], ref: 'ceramic://test' }
      const loadDocument = jest.fn(() => Promise.resolve(doc))
      idx.loadDocument = loadDocument
      const getEntry = jest.fn(() => Promise.resolve(entry))
      idx._getEntry = getEntry
      await expect(idx.getEntryContent('test', 'did')).resolves.toBe(doc.content)
      expect(getEntry).toBeCalledWith('test', 'did')
      expect(loadDocument).toBeCalledWith('ceramic://test')
    })

    describe('getEntryTags', () => {
      test('with non-existing entry', async () => {
        const getEntry = jest.fn(() => Promise.resolve(null))
        const idx = new IDX({} as any)
        idx._getEntry = getEntry
        await expect(idx.getEntryTags('docId', 'did:test')).resolves.toEqual([])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
      })

      test('with existing entry', async () => {
        const getEntry = jest.fn(() => Promise.resolve({ ref: 'id', tags: ['test', 'other'] }))
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        await expect(idx.getEntryTags('docId')).resolves.toEqual(['test', 'other'])
        expect(getEntry).toBeCalledWith('docId', undefined)
      })
    })

    test('_setEntry', async () => {
      const set = jest.fn()
      const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
      idx._rootIndex = { set } as any

      const entry = { tags: [], ref: 'ceramic://' }
      await expect(idx._setEntry('defId', entry)).resolves.toBeUndefined()
      expect(set).toBeCalledWith('defId', entry)
    })

    describe('setEntryContent', () => {
      test('existing definition ID', async () => {
        const entry = { tags: [], ref: 'docId' }
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._rootIndex = { get: (): Promise<any> => Promise.resolve(entry) } as any

        const change = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ change }))
        idx.loadDocument = loadDocument

        const content = { test: true }
        await idx.setEntryContent('defId', content)
        expect(loadDocument).toBeCalledWith('docId')
        expect(change).toBeCalledWith({ content })
      })

      test('adding definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._rootIndex = { get: (): Promise<any> => Promise.resolve(null) } as any

        const definition = { name: 'test', schema: 'ceramic://...' }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        idx.getDefinition = getDefinition
        const createReference = jest.fn(() => Promise.resolve('docId'))
        idx._createReference = createReference
        const setEntry = jest.fn()
        idx._setEntry = setEntry

        const content = { test: true }
        await idx.setEntryContent('defId', content)
        expect(getDefinition).toBeCalledWith('defId')
        expect(createReference).toBeCalledWith(definition, content)
        expect(setEntry).toBeCalledWith('defId', { ref: 'docId', tags: [] })
      })
    })

    describe('addEntryTag', () => {
      test('with non-existing entry', async () => {
        const getEntry = jest.fn(() => Promise.resolve(null))
        const setEntry = jest.fn()
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        idx._setEntry = setEntry
        await expect(idx.addEntryTag('docId', 'test')).resolves.toEqual([])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
        expect(setEntry).not.toBeCalled()
      })

      test('with existing tag', async () => {
        const getEntry = jest.fn(() => Promise.resolve({ ref: 'id', tags: ['test', 'other'] }))
        const setEntry = jest.fn()
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        idx._setEntry = setEntry
        await expect(idx.addEntryTag('docId', 'test')).resolves.toEqual(['test', 'other'])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
        expect(setEntry).not.toBeCalled()
      })

      test('with non-existing tag', async () => {
        const getEntry = jest.fn(() => Promise.resolve({ ref: 'id', tags: ['other'] }))
        const setEntry = jest.fn()
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        idx._setEntry = setEntry
        await expect(idx.addEntryTag('docId', 'test')).resolves.toEqual(['other', 'test'])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
        expect(setEntry).toBeCalledWith('docId', { ref: 'id', tags: ['other', 'test'] })
      })
    })

    describe('removeEntryTag', () => {
      test('with non-existing entry', async () => {
        const getEntry = jest.fn(() => Promise.resolve(null))
        const setEntry = jest.fn()
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        idx._setEntry = setEntry
        await expect(idx.removeEntryTag('docId', 'test')).resolves.toEqual([])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
        expect(setEntry).not.toBeCalled()
      })

      test('with existing tag', async () => {
        const getEntry = jest.fn(() => Promise.resolve({ ref: 'id', tags: ['test', 'other'] }))
        const setEntry = jest.fn()
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        idx._setEntry = setEntry
        await expect(idx.removeEntryTag('docId', 'test')).resolves.toEqual(['other'])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
        expect(setEntry).toBeCalledWith('docId', { ref: 'id', tags: ['other'] })
      })

      test('with non-existing tag', async () => {
        const getEntry = jest.fn(() => Promise.resolve({ ref: 'id', tags: ['other'] }))
        const setEntry = jest.fn()
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._getEntry = getEntry
        idx._setEntry = setEntry
        await expect(idx.removeEntryTag('docId', 'test')).resolves.toEqual(['other'])
        expect(getEntry).toBeCalledWith('docId', 'did:test')
        expect(setEntry).not.toBeCalled()
      })
    })

    test('removeEntry', async () => {
      const remove = jest.fn()
      const idx = new IDX({} as any)
      idx._rootIndex = { remove } as any

      await expect(idx.removeEntry('defId')).resolves.toBeUndefined()
      expect(remove).toBeCalledWith('defId')
    })

    test('_createReference', async () => {
      const idx = new IDX({} as any)
      const createDocument = jest.fn(() => Promise.resolve({ id: 'docId' }))
      idx.createDocument = createDocument

      const definition = { name: 'test', schema: 'schemaId' }
      const content = { test: true }
      await idx._createReference(definition, content)
      expect(createDocument).toBeCalledWith(content, { schema: 'schemaId' })
    })
  })
})
