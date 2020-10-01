/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { publishedSchemas } from '@ceramicstudio/idx-tools'

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
    describe('has', () => {
      test('returns true', async () => {
        const getReference = jest.fn(() => 'docId')
        const idx = new IDX({ definitions: { test: 'docId' } } as any)
        idx._getReference = getReference as any
        await expect(idx.has('test', 'did')).resolves.toBe(true)
        expect(getReference).toBeCalledWith('docId', 'did')
      })

      test('returns false', async () => {
        const getReference = jest.fn(() => null)
        const idx = new IDX({
          ceramic: { did: { id: 'did:test' } },
          definitions: { test: 'docId' }
        } as any)
        idx._getReference = getReference
        await expect(idx.has('test')).resolves.toBe(false)
        expect(getReference).toBeCalledWith('docId', undefined)
      })
    })

    test('get', async () => {
      const content = {}
      const getContent = jest.fn(() => content)
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx._getContent = getContent as any
      await expect(idx.get('test', 'did')).resolves.toBe(content)
      expect(getContent).toBeCalledWith('docId', 'did')
    })

    test('set', async () => {
      const content = {}
      const setContent = jest.fn(() => 'contentId')
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx._setContent = setContent as any
      await expect(idx.set('test', content, { pin: false })).resolves.toBe('contentId')
      expect(setContent).toBeCalledWith('docId', content, { pin: false })
    })

    test('remove', async () => {
      const removeReference = jest.fn()
      const idx = new IDX({ definitions: { test: 'docId' } } as any)
      idx._removeReference = removeReference
      await expect(idx.remove('test')).resolves.toBeUndefined()
      expect(removeReference).toBeCalledWith('docId')
    })

    describe('_toIndexKey', () => {
      test('resolves the existing alias', () => {
        const idx = new IDX({ definitions: { test: 'docId' } } as any)
        expect(idx._toIndexKey('test')).toBe('docId')
      })

      test('converts a doc ID as needed', () => {
        const idx = new IDX({} as any)
        expect(idx._toIndexKey('ceramic://docId')).toBe('docId')
      })

      test('resolves the existing alias and converts from doc ID', () => {
        const idx = new IDX({ definitions: { test: 'ceramic://docId' } } as any)
        expect(idx._toIndexKey('test')).toBe('docId')
      })

      test('returns provided key as-is if not other match', () => {
        const idx = new IDX({} as any)
        expect(idx._toIndexKey('docId')).toBe('docId')
      })
    })
  })

  describe('Ceramic API wrappers', () => {
    describe('_createDocument', () => {
      test('pin by default', async () => {
        const createDocument = jest.fn(() => ({ id: 'test' }))
        const add = jest.fn()
        const idx = new IDX({
          ceramic: { createDocument, did: { id: 'did:test' }, pin: { add } }
        } as any)
        await idx._createDocument({ hello: 'test' }, { tags: ['test'] })
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
        await idx._createDocument({ hello: 'test' })
        expect(createDocument).toBeCalled()
        expect(add).not.toBeCalled()
      })

      test('explicit no pinning', async () => {
        const createDocument = jest.fn()
        const add = jest.fn()
        const idx = new IDX({
          autopin: true,
          ceramic: { createDocument, did: { id: 'did:test' }, pin: { add } }
        } as any)
        await idx._createDocument({ hello: 'test' }, {}, { pin: false })
        expect(createDocument).toBeCalled()
        expect(add).not.toBeCalled()
      })
    })

    test('_loadDocument', async () => {
      const loadDocument = jest.fn()
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await Promise.all([
        idx._loadDocument('one'),
        idx._loadDocument('one'),
        idx._loadDocument('two')
      ])
      expect(loadDocument).toBeCalledTimes(2)
    })
  })

  describe('IdentityIndex APIs', () => {
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

    test('contentIterator', async () => {
      const index = {
        'ceramic://definition1': 'ceramic://doc1',
        'ceramic://definition2': 'ceramic://doc2',
        'ceramic://definition3': 'ceramic://doc3'
      }
      const loadDocument = jest.fn(() => Promise.resolve({ content: 'doc content' }))
      const getIndex = jest.fn(() => Promise.resolve(index))
      const idx = new IDX({ ceramic: { did: { id: 'did:own' } } } as any)
      idx._loadDocument = loadDocument as any
      idx.getIDXContent = getIndex

      const results = []
      for await (const entry of idx.contentIterator()) {
        results.push(entry)
      }
      expect(results).toEqual([
        {
          key: 'ceramic://definition1',
          ref: 'ceramic://doc1',
          content: 'doc content'
        },
        {
          key: 'ceramic://definition2',
          ref: 'ceramic://doc2',
          content: 'doc content'
        },
        {
          key: 'ceramic://definition3',
          ref: 'ceramic://doc3',
          content: 'doc content'
        }
      ])
      expect(loadDocument).toBeCalledTimes(3)
      expect(loadDocument).toHaveBeenNthCalledWith(1, 'ceramic://doc1')
      expect(loadDocument).toHaveBeenNthCalledWith(2, 'ceramic://doc2')
      expect(loadDocument).toHaveBeenNthCalledWith(3, 'ceramic://doc3')
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
        idx._loadDocument = loadDoc

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
        idx._loadDocument = loadDoc as any

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

  describe('getDefinition', () => {
    test('works with the provided schema', async () => {
      const loadDocument = jest.fn(() =>
        Promise.resolve({
          content: { name: 'definition' },
          metadata: { schema: publishedSchemas.Definition }
        })
      )
      const idx = new IDX({ ceramic: { loadDocument } } as any)
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
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await expect(idx.getDefinition('ceramic://test')).rejects.toThrow('Invalid definition')
    })
  })

  describe('Content APIs', () => {
    test('_getContent', async () => {
      const idx = new IDX({} as any)
      idx.getIDXContent = () => Promise.resolve(null)
      await expect(idx._getContent('test', 'did')).resolves.toBeNull()

      const get = jest.fn(() => Promise.resolve({ exists: 'ceramic://test' }))
      idx.getIDXContent = get as any
      const content = { test: true }
      const load = jest.fn(() => Promise.resolve({ content }))
      idx._loadDocument = load as any

      await expect(idx._getContent('exists', 'did')).resolves.toBe(content)
      expect(get).toHaveBeenCalledWith('did')
      expect(load).toHaveBeenCalledWith('ceramic://test')
    })

    describe('_setContent', () => {
      test('existing definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._getReference = (): Promise<any> => Promise.resolve('docId')

        const change = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ change }))
        idx._loadDocument = loadDocument as any

        const content = { test: true }
        await idx._setContent('defId', content)
        expect(loadDocument).toBeCalledWith('docId')
        expect(change).toBeCalledWith({ content })
      })

      test('adding definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._indexProxy = { get: (): Promise<any> => Promise.resolve(null) } as any

        const definition = { name: 'test', schema: 'ceramic://...' }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        idx.getDefinition = getDefinition
        const createContent = jest.fn(() => Promise.resolve('docId'))
        idx._createContent = createContent
        const setReference = jest.fn()
        idx._setReference = setReference

        const content = { test: true }
        await idx._setContent('defId', content, { pin: true })
        expect(getDefinition).toBeCalledWith('defId')
        expect(createContent).toBeCalledWith(definition, content, { pin: true })
        expect(setReference).toBeCalledWith('defId', 'docId')
      })
    })

    test('_createContent', async () => {
      const idx = new IDX({} as any)
      const createDocument = jest.fn(() => Promise.resolve({ id: 'docId' }))
      idx._createDocument = createDocument as any

      const definition = { name: 'test', schema: 'schemaId' }
      const content = { test: true }
      await idx._createContent(definition, content, { pin: true })
      expect(createDocument).toBeCalledWith(content, { schema: 'schemaId' }, { pin: true })
    })
  })

  describe('References APIs', () => {
    describe('_getReference', () => {
      test('with provided DID', async () => {
        const getIDXContent = jest.fn(() => Promise.resolve(null))
        const idx = new IDX({} as any)
        idx.getIDXContent = getIDXContent
        await expect(idx._getReference('testId', 'did:test')).resolves.toBeNull()
        expect(getIDXContent).toBeCalledWith('did:test')
      })

      test('with authenticated DID', async () => {
        const getIDXContent = jest.fn(() => Promise.resolve({ testId: 'docId' }))
        const idx = new IDX({ ceramic: { did: { id: 'did:3:test' } } } as any)
        idx.getIDXContent = getIDXContent
        await expect(idx._getReference('testId')).resolves.toBe('docId')
        expect(getIDXContent).toBeCalledWith('did:3:test')
      })
    })

    test('_setReference', async () => {
      const content = { test: true }
      const changeContent = jest.fn(change => change(content))
      const idx = new IDX({} as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx._setReference('testId', 'test')).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, testId: 'test' })
    })

    test('_removeReference', async () => {
      const content = { test: true, testId: 'test' }
      const changeContent = jest.fn(change => change(content))
      const idx = new IDX({} as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx._removeReference('testId')).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true })
    })
  })
})
