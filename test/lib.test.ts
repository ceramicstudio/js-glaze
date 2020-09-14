/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

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
    describe('createDocument', () => {
      test('pin by default', async () => {
        const createDocument = jest.fn(() => ({ id: 'test' }))
        const add = jest.fn()
        const idx = new IDX({
          ceramic: { createDocument, did: { id: 'did:test' }, pin: { add } }
        } as any)
        await idx.createDocument({ hello: 'test' }, { tags: ['test'] })
        expect(createDocument).toBeCalledWith('tile', {
          content: { hello: 'test' },
          metadata: {
            owners: ['did:test'],
            tags: ['test']
          }
        })
        expect(add).toBeCalledWith('test')
      })

      test('no pinning by setting instance option', async () => {
        const createDocument = jest.fn()
        const add = jest.fn()
        const idx = new IDX({
          autopin: false,
          ceramic: { createDocument, did: { id: 'did:test' }, pin: { add } }
        } as any)
        await idx.createDocument({ hello: 'test' })
        expect(createDocument).toBeCalled()
        expect(add).not.toBeCalledWith('test')
      })

      test('explicit no pinning', async () => {
        const createDocument = jest.fn()
        const add = jest.fn()
        const idx = new IDX({
          autopin: true,
          ceramic: { createDocument, did: { id: 'did:test' }, pin: { add } }
        } as any)
        await idx.createDocument({ hello: 'test' }, {}, { pin: false })
        expect(createDocument).toBeCalled()
        expect(add).not.toBeCalled()
      })
    })

    test('loadDocument', async () => {
      const loadDocument = jest.fn()
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await Promise.all([idx.loadDocument('one'), idx.loadDocument('one'), idx.loadDocument('two')])
      expect(loadDocument).toBeCalledTimes(2)
    })
  })

  describe('Identity Index APIs', () => {
    test('getIDXContent with provided DID', async () => {
      const get = jest.fn()
      const idx = new IDX({ ceramic: { did: {} } } as any)
      idx._getIDXDoc = get
      await idx.getIDXContent('did:test')
      expect(get).toBeCalledWith('did:test')
    })

    test('getIDXContent with own DID', async () => {
      const get = jest.fn()
      const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
      idx._indexProxy = { get } as any
      await idx.getIDXContent()
      expect(get).toBeCalled()
    })

    describe('isSupported', () => {
      test('authenticated DID, not supported', async () => {
        const resolve = jest.fn(() => Promise.resolve({}))
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._resolver.resolve = resolve as any
        await expect(idx.isSupported()).resolves.toBe(false)
        expect(resolve).toBeCalledWith('did:test')
      })

      test('authenticated DID, supported', async () => {
        const resolve = jest.fn(() => {
          return Promise.resolve({
            service: [{ type: 'IdentityIndexRoot', serviceEndpoint: 'ceramic://test' }]
          })
        })
        const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
        idx._resolver.resolve = resolve as any
        await expect(idx.isSupported()).resolves.toBe(true)
        expect(resolve).toBeCalledWith('did:test')
      })

      test('provided DID, not supported', async () => {
        const resolve = jest.fn(() => Promise.resolve({}))
        const idx = new IDX({} as any)
        idx._resolver.resolve = resolve as any
        await expect(idx.isSupported('did:test')).resolves.toBe(false)
        expect(resolve).toBeCalledWith('did:test')
      })

      test('provided DID, supported', async () => {
        const resolve = jest.fn(() => {
          return Promise.resolve({
            service: [{ type: 'IdentityIndexRoot', serviceEndpoint: 'ceramic://test' }]
          })
        })
        const idx = new IDX({} as any)
        idx._resolver.resolve = resolve as any
        await expect(idx.isSupported('did:test')).resolves.toBe(true)
        expect(resolve).toBeCalledWith('did:test')
      })
    })

    describe('_getIDXDoc', () => {
      test('returns `null` if there is an existing mapping set to `null`', async () => {
        const idx = new IDX({ ceramic: {} } as any)
        idx._didCache['did:test:456'] = null
        await expect(idx._getIDXDoc('did:test:456')).resolves.toBeNull()
      })

      test('calls the resolver and extract the root ID', async () => {
        const doc = {} as any
        const resolve = jest.fn(() => {
          return Promise.resolve({
            service: [{ type: 'IdentityIndexRoot', serviceEndpoint: 'ceramic://test' }]
          })
        })
        const loadDoc = jest.fn(() => Promise.resolve(doc))

        const idx = new IDX({ ceramic: {} } as any)
        idx._resolver.resolve = resolve as any
        idx.loadDocument = loadDoc

        await expect(idx._getIDXDoc('did:test:123')).resolves.toBe(doc)
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith('did:test:123')
        expect(loadDoc).toHaveBeenCalledTimes(1)
        expect(loadDoc).toHaveBeenCalledWith('ceramic://test')
        expect(idx._didCache['did:test:123']).toBe('ceramic://test')
      })

      test('calls the resolver and sets the root ID to null if not available', async () => {
        const resolve = jest.fn(() => {
          return Promise.resolve({
            service: [{ type: 'unknown', serviceEndpoint: 'ceramic://test' }]
          })
        })
        const loadDoc = jest.fn(() => Promise.resolve())

        const idx = new IDX({ ceramic: {} } as any)
        idx._resolver.resolve = resolve as any
        idx.loadDocument = loadDoc as any

        await expect(idx._getIDXDoc('did:test:123')).resolves.toBeNull()
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith('did:test:123')
        expect(loadDoc).toHaveBeenCalledTimes(0)
        expect(idx._didCache['did:test:123']).toBeNull()
      })
    })

    describe('_getOwnIDXDoc', () => {
      test('returns the existing doc', async () => {
        const doc = {} as any
        const getDoc = jest.fn(() => Promise.resolve(doc))

        const idx = new IDX({ ceramic: { did: { id: 'did:test:user' } } } as any)
        idx._getIDXDoc = getDoc

        await expect(idx._getOwnIDXDoc()).resolves.toBe(doc)
        expect(getDoc).toBeCalledTimes(1)
      })

      test('throws an error if the doc does not exist', async () => {
        const getDoc = jest.fn(() => Promise.resolve(null))
        const idx = new IDX({ ceramic: { did: { id: 'did:test:user' } } } as any)
        idx._getIDXDoc = getDoc

        await expect(idx._getOwnIDXDoc()).rejects.toThrow(
          'IDX is not supported by the authenticated DID'
        )
        expect(getDoc).toBeCalledTimes(1)
      })
    })
  })

  describe('Definition APIs', () => {
    test('createDefinition', async () => {
      const createDocument = jest.fn(() => Promise.resolve({ id: 'ceramic://test' }))
      const idx = new IDX({
        ceramic: { createDocument, did: { id: 'did:test' } },
        schemas: { Definition: 'ceramic://definition' }
      } as any)
      await expect(
        idx.createDefinition({ name: 'test', schema: 'test' }, { pin: false })
      ).resolves.toBe('ceramic://test')
      expect(createDocument).toBeCalledTimes(1)
    })

    describe('getDefinition', () => {
      test('works with the provided schema', async () => {
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

      test('throws an error if the definition does not use the right schema', async () => {
        const loadDocument = jest.fn(() =>
          Promise.resolve({
            content: { name: 'definition' },
            metadata: { schema: 'ceramic://other' }
          })
        )
        const idx = new IDX({
          ceramic: { loadDocument },
          schemas: { Definition: 'ceramic://definition' }
        } as any)
        await expect(idx.getDefinition('ceramic://test')).rejects.toThrow('Invalid definition')
      })
    })
  })

  describe('Entry APIs', () => {
    test('_getEntry', async () => {
      const idx = new IDX({} as any)
      idx.getIDXContent = () => Promise.resolve(null)
      await expect(idx._getEntry('test', 'did')).resolves.toBeNull()

      const entry = { tags: [], ref: 'ceramic://' }
      const get = jest.fn(() => Promise.resolve({ exists: entry }))
      idx.getIDXContent = get as any
      await expect(idx._getEntry('exists', 'did')).resolves.toBe(entry)
      expect(get).toHaveBeenCalledWith('did')
    })

    test('getEntryContent', async () => {
      const idx = new IDX({} as any)

      idx._getEntry = (): Promise<null> => Promise.resolve(null)
      await expect(idx.getEntryContent('test', 'did')).resolves.toBeNull()

      const doc = { content: {} }
      const entry = { tags: [], ref: 'ceramic://test' }
      const loadDocument = jest.fn(() => Promise.resolve(doc))
      idx.loadDocument = loadDocument as any
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
      const content = { test: true }
      const changeContent = jest.fn(change => change(content))
      const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx._setEntry('testId', { tags: [], ref: 'test' })).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, testId: { ref: 'test', tags: [] } })
    })

    describe('setEntryContent', () => {
      test('existing definition ID', async () => {
        const entry = { tags: [], ref: 'docId' }
        const idx = new IDX({
          ceramic: { did: { id: 'did' } }
        } as any)
        idx._getEntry = (): Promise<any> => Promise.resolve(entry)

        const change = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ change }))
        idx.loadDocument = loadDocument as any

        const content = { test: true }
        await idx.setEntryContent('defId', content)
        expect(loadDocument).toBeCalledWith('docId')
        expect(change).toBeCalledWith({ content })
      })

      test('adding definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._indexProxy = { get: (): Promise<any> => Promise.resolve(null) } as any

        const definition = { name: 'test', schema: 'ceramic://...' }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        idx.getDefinition = getDefinition
        const createReference = jest.fn(() => Promise.resolve('docId'))
        idx._createReference = createReference
        const setEntry = jest.fn()
        idx._setEntry = setEntry

        const content = { test: true }
        await idx.setEntryContent('defId', content, { pin: true })
        expect(getDefinition).toBeCalledWith('defId')
        expect(createReference).toBeCalledWith(definition, content, { pin: true })
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
      const content = { test: true, testId: { ref: 'test', tags: [] } }
      const changeContent = jest.fn(change => change(content))
      const idx = new IDX({} as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx.removeEntry('testId')).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true })
    })

    test('getEntries', async () => {
      const index = {
        'ceramic://definition1': {
          ref: 'ceramic://doc1',
          tags: []
        },
        'ceramic://definition2': {
          ref: 'ceramic://doc2',
          tags: []
        }
      }
      const getIndex = jest.fn(() => Promise.resolve(index))
      const idx = new IDX({} as any)
      idx.getIDXContent = getIndex

      await expect(idx.getEntries('did:test')).resolves.toEqual([
        {
          def: 'ceramic://definition1',
          ref: 'ceramic://doc1',
          tags: []
        },
        {
          def: 'ceramic://definition2',
          ref: 'ceramic://doc2',
          tags: []
        }
      ])
      expect(getIndex).toBeCalledWith('did:test')
    })

    describe('getTagEntries', () => {
      const index = {
        'ceramic://definition1': {
          ref: 'ceramic://doc1',
          tags: ['foo']
        },
        'ceramic://definition2': {
          ref: 'ceramic://doc2',
          tags: ['foo', 'bar']
        },
        'ceramic://definition3': {
          ref: 'ceramic://doc3',
          tags: ['bar', 'baz']
        }
      }

      test('with no match', async () => {
        const getIndex = jest.fn(() => Promise.resolve(index))
        const idx = new IDX({ ceramic: { did: { id: 'did:own' } } } as any)
        idx.getIDXContent = getIndex
        await expect(idx.getTagEntries('test')).resolves.toEqual([])
        expect(getIndex).toBeCalled()
      })

      test('with matches', async () => {
        const getIndex = jest.fn(() => Promise.resolve(index))
        const idx = new IDX({ ceramic: { did: { id: 'did:own' } } } as any)
        idx.getIDXContent = getIndex
        await expect(idx.getTagEntries('bar')).resolves.toEqual([
          {
            def: 'ceramic://definition2',
            ref: 'ceramic://doc2',
            tags: ['foo', 'bar']
          },
          {
            def: 'ceramic://definition3',
            ref: 'ceramic://doc3',
            tags: ['bar', 'baz']
          }
        ])
        expect(getIndex).toBeCalled()
      })
    })

    describe('contentIterator', () => {
      const index = {
        'ceramic://definition1': {
          ref: 'ceramic://doc1',
          tags: ['foo']
        },
        'ceramic://definition2': {
          ref: 'ceramic://doc2',
          tags: ['foo', 'bar']
        },
        'ceramic://definition3': {
          ref: 'ceramic://doc3',
          tags: ['bar', 'baz']
        }
      }

      test('with no tag', async () => {
        const loadDocument = jest.fn(() => Promise.resolve({ content: 'doc content' }))
        const getIndex = jest.fn(() => Promise.resolve(index))
        const idx = new IDX({ ceramic: { did: { id: 'did:own' } } } as any)
        idx.loadDocument = loadDocument as any
        idx.getIDXContent = getIndex

        const results = []
        for await (const entry of idx.contentIterator()) {
          results.push(entry)
        }
        expect(results).toEqual([
          {
            def: 'ceramic://definition1',
            ref: 'ceramic://doc1',
            tags: ['foo'],
            content: 'doc content'
          },
          {
            def: 'ceramic://definition2',
            ref: 'ceramic://doc2',
            tags: ['foo', 'bar'],
            content: 'doc content'
          },
          {
            def: 'ceramic://definition3',
            ref: 'ceramic://doc3',
            tags: ['bar', 'baz'],
            content: 'doc content'
          }
        ])
        expect(loadDocument).toBeCalledTimes(3)
        expect(loadDocument).toHaveBeenNthCalledWith(1, 'ceramic://doc1')
        expect(loadDocument).toHaveBeenNthCalledWith(2, 'ceramic://doc2')
        expect(loadDocument).toHaveBeenNthCalledWith(3, 'ceramic://doc3')
      })

      test('with tag but no match', async () => {
        const loadDocument = jest.fn(() => Promise.resolve({ content: 'doc content' }))
        const getIndex = jest.fn(() => Promise.resolve(index))
        const idx = new IDX({} as any)
        idx.loadDocument = loadDocument as any
        idx.getIDXContent = getIndex

        const results = []
        for await (const entry of idx.contentIterator({ did: 'did:test', tag: 'test' })) {
          results.push(entry)
        }
        expect(results).toEqual([])
        expect(loadDocument).not.toHaveBeenCalled()
      })

      test('with tag matches', async () => {
        const loadDocument = jest.fn(() => Promise.resolve({ content: 'doc content' }))
        const getIndex = jest.fn(() => Promise.resolve(index))
        const idx = new IDX({ ceramic: { did: { id: 'did:own' } } } as any)
        idx.loadDocument = loadDocument as any
        idx.getIDXContent = getIndex

        const results = []
        for await (const entry of idx.contentIterator({ tag: 'foo' })) {
          results.push(entry)
        }
        expect(results).toEqual([
          {
            def: 'ceramic://definition1',
            ref: 'ceramic://doc1',
            tags: ['foo'],
            content: 'doc content'
          },
          {
            def: 'ceramic://definition2',
            ref: 'ceramic://doc2',
            tags: ['foo', 'bar'],
            content: 'doc content'
          }
        ])
        expect(loadDocument).toBeCalledTimes(2)
        expect(loadDocument).toHaveBeenNthCalledWith(1, 'ceramic://doc1')
        expect(loadDocument).toHaveBeenNthCalledWith(2, 'ceramic://doc2')
      })
    })

    test('_createReference', async () => {
      const idx = new IDX({} as any)
      const createDocument = jest.fn(() => Promise.resolve({ id: 'docId' }))
      idx.createDocument = createDocument as any

      const definition = { name: 'test', schema: 'schemaId' }
      const content = { test: true }
      await idx._createReference(definition, content, { pin: true })
      expect(createDocument).toBeCalledWith(content, { schema: 'schemaId' }, { pin: true })
    })
  })
})
