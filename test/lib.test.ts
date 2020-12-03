/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import DocID from '@ceramicnetwork/docid'
import { schemas } from '@ceramicstudio/idx-constants'

import { IDX } from '../src/index'

describe('IDX', () => {
  const testDocID = DocID.fromString(
    'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
  )

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
        const idx = new IDX({ aliases: { test: 'docId' } } as any)
        idx._getReference = getReference as any
        await expect(idx.has('test', 'did')).resolves.toBe(true)
        expect(getReference).toBeCalledWith('docId', 'did')
      })

      test('returns false', async () => {
        const getReference = jest.fn(() => null)
        const idx = new IDX({
          ceramic: { did: { id: 'did:test' } },
          aliases: { test: 'docId' },
        } as any)
        idx._getReference = getReference
        await expect(idx.has('test')).resolves.toBe(false)
        expect(getReference).toBeCalledWith('docId', undefined)
      })
    })

    test('get', async () => {
      const content = {}
      const getContent = jest.fn(() => content)
      const idx = new IDX({ aliases: { test: 'docId' } } as any)
      idx._getContent = getContent as any
      await expect(idx.get('test', 'did')).resolves.toBe(content)
      expect(getContent).toBeCalledWith('docId', 'did')
    })

    test('set', async () => {
      const content = {}
      const setContent = jest.fn(() => 'contentId')
      const idx = new IDX({ aliases: { test: 'docId' } } as any)
      idx._setContent = setContent as any
      await expect(idx.set('test', content, { pin: false })).resolves.toBe('contentId')
      expect(setContent).toBeCalledWith('docId', content, { pin: false })
    })

    describe('merge', () => {
      test('with existing contents', async () => {
        const content = { hello: 'test', foo: 'bar' }
        const getContent = jest.fn(() => content)
        const setContent = jest.fn(() => 'contentId')
        const idx = new IDX({ aliases: { test: 'docId' } } as any)
        idx._getContent = getContent as any
        idx._setContent = setContent as any
        await expect(idx.merge('test', { hello: 'world', added: 'value' })).resolves.toBe(
          'contentId'
        )
        expect(setContent).toBeCalledWith(
          'docId',
          { hello: 'world', foo: 'bar', added: 'value' },
          undefined
        )
      })

      test('without existing contents', async () => {
        const content = { hello: 'test', foo: 'bar' }
        const getContent = jest.fn(() => null)
        const setContent = jest.fn(() => 'contentId')
        const idx = new IDX({ aliases: { test: 'docId' } } as any)
        idx._getContent = getContent as any
        idx._setContent = setContent as any
        await expect(idx.merge('test', content)).resolves.toBe('contentId')
        expect(setContent).toBeCalledWith('docId', content, undefined)
      })
    })

    test('setAll', async () => {
      const ref1 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
      const ref2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpbbb'
      const setContentOnly = jest.fn((key) => {
        return key === 'first' ? [true, DocID.fromString(ref1)] : [false, DocID.fromString(ref2)]
      })
      const setReferences = jest.fn()

      const idx = new IDX({} as any)
      idx._setContentOnly = setContentOnly as any
      idx._setReferences = setReferences as any

      const refs = { first: `ceramic://${ref1}` }
      await expect(idx.setAll({ first: 'foo', second: 'bar' })).resolves.toEqual(refs)
      expect(setContentOnly).toBeCalledTimes(2)
      expect(setReferences).toBeCalledWith(refs)
    })

    test('setDefaults', async () => {
      const newID = DocID.fromString(
        'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
      )
      const definition = {}
      const getDefinition = jest.fn(() => definition)
      const getIDXContent = jest.fn(() => ({ def1: 'ref1', def2: 'ref2' }))
      const createContent = jest.fn(() => newID)
      const setReferences = jest.fn()

      const idx = new IDX({} as any)
      idx.getDefinition = getDefinition as any
      idx.getIDXContent = getIDXContent as any
      idx._createContent = createContent as any
      idx._setReferences = setReferences as any

      const refs = { def3: newID.toUrl() }
      await expect(
        idx.setDefaults({ def1: { hello: 'world' }, def3: { added: 'value' } })
      ).resolves.toEqual(refs)
      expect(getDefinition).toBeCalledWith('def3')
      expect(createContent).toBeCalledWith(definition, { added: 'value' }, undefined)
      expect(setReferences).toBeCalledWith(refs)
    })

    test('remove', async () => {
      const removeReference = jest.fn()
      const idx = new IDX({ aliases: { test: 'docId' } } as any)
      idx._removeReference = removeReference
      await expect(idx.remove('test')).resolves.toBeUndefined()
      expect(removeReference).toBeCalledWith('docId')
    })

    describe('_toIndexKey', () => {
      test('resolves the existing alias', () => {
        const idx = new IDX({ aliases: { test: 'docId' } } as any)
        expect(idx._toIndexKey('test')).toBe('docId')
      })

      test('returns provided key as-is if not other match', () => {
        const idx = new IDX({} as any)
        expect(idx._toIndexKey('docId')).toBe('docId')
      })
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

    test('contentIterator', async () => {
      const index = {
        'ceramic://definition1': 'ceramic://doc1',
        'ceramic://definition2': 'ceramic://doc2',
        'ceramic://definition3': 'ceramic://doc3',
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
          content: 'doc content',
        },
        {
          key: 'ceramic://definition2',
          ref: 'ceramic://doc2',
          content: 'doc content',
        },
        {
          key: 'ceramic://definition3',
          ref: 'ceramic://doc3',
          content: 'doc content',
        },
      ])
      expect(loadDocument).toBeCalledTimes(3)
      expect(loadDocument).toHaveBeenNthCalledWith(1, 'ceramic://doc1')
      expect(loadDocument).toHaveBeenNthCalledWith(2, 'ceramic://doc2')
      expect(loadDocument).toHaveBeenNthCalledWith(3, 'ceramic://doc3')
    })

    test('_createIDXDoc', async () => {
      const doc = {}
      const createDocument = jest.fn(() => Promise.resolve(doc)) as any
      const idx = new IDX({ ceramic: { createDocument } } as any)

      await expect(idx._createIDXDoc('did:test:123')).resolves.toBe(doc)
      expect(createDocument).toHaveBeenCalledTimes(1)
      expect(createDocument).toHaveBeenCalledWith(
        'tile',
        {
          deterministic: true,
          metadata: { controllers: ['did:test:123'], family: 'IDX' },
        },
        { anchor: false, publish: false }
      )
    })

    describe('_getIDXDoc', () => {
      test('calls _createIDXDoc and check the schema', async () => {
        const doc = { metadata: { schema: schemas.IdentityIndex } } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({} as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getIDXDoc('did:test:123')).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })

      test('returns null if the schema is not set', async () => {
        const doc = { metadata: {} } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({} as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getIDXDoc('did:test:123')).resolves.toBeNull()
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })

      test('throws an error if the document is not a valid IdentityIndex', async () => {
        const doc = { metadata: { schema: 'ceramic://other' } } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({} as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getIDXDoc('did:test:123')).rejects.toThrow(
          'Invalid document: schema is not IdentityIndex'
        )
        expect(createDoc).toHaveBeenCalledTimes(1)
      })
    })

    describe('_getOwnIDXDoc', () => {
      test('creates and sets schema in update', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX' }
        const change = jest.fn()
        const doc = { change, metadata } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({ ceramic: { did: { id } } } as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getOwnIDXDoc()).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(change).toHaveBeenCalledWith({
          metadata: { ...metadata, schema: schemas.IdentityIndex },
        })
      })

      test('throws an error if the schema is not a valid IdentityIndex', async () => {
        const doc = { metadata: { schema: 'ceramic://other' } } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({ ceramic: { did: { id: 'did:test:123' } } } as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getOwnIDXDoc()).rejects.toThrow(
          'Invalid document: schema is not IdentityIndex'
        )
        expect(createDoc).toHaveBeenCalledTimes(1)
      })

      test('returns the doc if valid', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX', schema: schemas.IdentityIndex }
        const change = jest.fn()
        const doc = { change, metadata } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({ ceramic: { did: { id } } } as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getOwnIDXDoc()).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(change).not.toHaveBeenCalled()
      })
    })
  })

  describe('getDefinition', () => {
    test('works with the provided schema', async () => {
      const loadDocument = jest.fn(() =>
        Promise.resolve({
          content: { name: 'definition' },
          metadata: { schema: schemas.Definition },
        })
      )
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await expect(idx.getDefinition('ceramic://test')).resolves.toEqual({
        name: 'definition',
      })
      expect(loadDocument).toBeCalledWith('ceramic://test')
    })

    test('throws an error if the definition does not use the right schema', async () => {
      const loadDocument = jest.fn(() =>
        Promise.resolve({
          content: { name: 'definition' },
          metadata: { schema: 'ceramic://other' },
        })
      )
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await expect(idx.getDefinition('ceramic://test')).rejects.toThrow(
        'Invalid document: schema is not Definition'
      )
    })
  })

  describe('Content APIs', () => {
    test('_loadDocument', async () => {
      const loadDocument = jest.fn()
      const idx = new IDX({ ceramic: { loadDocument } } as any)
      await Promise.all([
        idx._loadDocument('one'),
        idx._loadDocument('one'),
        idx._loadDocument('two'),
      ])
      expect(loadDocument).toBeCalledTimes(2)
    })

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

    describe('_setContentOnly', () => {
      test('existing definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._getReference = (): Promise<any> => Promise.resolve('docId')

        const change = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ change, id: 'docId' }))
        idx._loadDocument = loadDocument as any

        const content = { test: true }
        await expect(idx._setContentOnly('defId', content)).resolves.toEqual([false, 'docId'])
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
        idx._createContent = createContent as any

        const content = { test: true }
        await expect(idx._setContentOnly('defId', content, { pin: true })).resolves.toEqual([
          true,
          'docId',
        ])
        expect(getDefinition).toBeCalledWith('defId')
        expect(createContent).toBeCalledWith(definition, content, { pin: true })
      })
    })

    describe('_setContent', () => {
      test('does not set the index key if it already exists', async () => {
        const idx = new IDX({} as any)
        const setContent = jest.fn(() => Promise.resolve([false, 'docId']))
        idx._setContentOnly = setContent as any
        const setReference = jest.fn()
        idx._setReference = setReference

        const content = { test: true }
        await idx._setContent('defId', content)
        expect(setContent).toBeCalledWith('defId', content, undefined)
        expect(setReference).not.toBeCalled()
      })

      test('adds the new index key', async () => {
        const idx = new IDX({} as any)
        const setContent = jest.fn(() => Promise.resolve([true, 'docId']))
        idx._setContentOnly = setContent as any
        const setReference = jest.fn()
        idx._setReference = setReference

        const content = { test: true }
        await idx._setContent('defId', content)
        expect(setContent).toBeCalledWith('defId', content, undefined)
        expect(setReference).toBeCalledWith('defId', 'docId')
      })
    })

    describe('_createContent', () => {
      test('creates the deterministic doc and updates it', async () => {
        const id = 'did:test:123'
        const add = jest.fn()
        const change = jest.fn()
        const createDocument = jest.fn((_doctype, { metadata }, _opts) => {
          return Promise.resolve({ id: 'docId', change, metadata })
        })
        const idx = new IDX({ ceramic: { createDocument, did: { id }, pin: { add } } } as any)

        const definition = {
          id: { toString: () => 'defId' },
          name: 'test',
          schema: 'schemaId',
        } as any
        const content = { test: true }
        await expect(idx._createContent(definition, content, { pin: true })).resolves.toBe('docId')
        expect(createDocument).toBeCalledWith(
          'tile',
          {
            deterministic: true,
            metadata: { controllers: [id], family: 'defId' },
          },
          { anchor: false, publish: false }
        )
        expect(change).toBeCalledWith({
          content,
          metadata: { controllers: [id], family: 'defId', schema: 'schemaId' },
        })
        expect(add).toBeCalledWith('docId')
      })

      test('pin by default', async () => {
        const add = jest.fn()
        const change = jest.fn()
        const createDocument = jest.fn((_doctype, { metadata }) => {
          return Promise.resolve({ id: 'docId', change, metadata })
        })
        const idx = new IDX({
          ceramic: { createDocument, did: { id: 'did:test:123' }, pin: { add } },
        } as any)

        await idx._createContent({ id: { toString: () => 'defId' } } as any, {})
        expect(change).toBeCalled()
        expect(add).toBeCalledWith('docId')
      })

      test('no pinning by setting instance option', async () => {
        const add = jest.fn()
        const change = jest.fn()
        const createDocument = jest.fn((_doctype, { metadata }) => {
          return Promise.resolve({ id: 'docId', change, metadata })
        })
        const idx = new IDX({
          autopin: false,
          ceramic: { createDocument, did: { id: 'did:test:123' }, pin: { add } },
        } as any)
        await idx._createContent({ id: { toString: () => 'defId' } } as any, {})
        expect(change).toBeCalled()
        expect(add).not.toBeCalled()
      })

      test('explicit no pinning', async () => {
        const add = jest.fn()
        const change = jest.fn()
        const createDocument = jest.fn((_doctype, { metadata }) => {
          return Promise.resolve({ id: 'docId', change, metadata })
        })
        const idx = new IDX({
          autopin: true,
          ceramic: { createDocument, did: { id: 'did:test:123' }, pin: { add } },
        } as any)
        await idx._createContent({ id: { toString: () => 'defId' } } as any, {}, { pin: false })
        expect(change).toBeCalled()
        expect(add).not.toBeCalled()
      })
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
      const changeContent = jest.fn((change) => change(content))
      const idx = new IDX({} as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx._setReference('testId', testDocID)).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, testId: testDocID.toUrl() })
    })

    test('_setReferences', async () => {
      const content = { test: true }
      const changeContent = jest.fn((change) => change(content))
      const idx = new IDX({} as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx._setReferences({ one: 'one', two: 'two' })).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, one: 'one', two: 'two' })
    })

    test('_removeReference', async () => {
      const content = { test: true, testId: 'test' }
      const changeContent = jest.fn((change) => change(content))
      const idx = new IDX({} as any)
      idx._indexProxy = { changeContent } as any
      await expect(idx._removeReference('testId')).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true })
    })
  })
})
