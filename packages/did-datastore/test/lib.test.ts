/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { StreamID } from '@ceramicnetwork/streamid'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { DIDDataStore } from '../src'
jest.mock('@ceramicnetwork/stream-tile')

describe('DIDDataStore', () => {
  const testDocID = StreamID.fromString(
    'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
  )

  describe('properties', () => {
    test('`authenticated` property', () => {
      const ds1 = new DIDDataStore({ ceramic: {} } as any)
      expect(ds1.authenticated).toBe(false)

      const ds2 = new DIDDataStore({ ceramic: { did: {} } } as any)
      expect(ds2.authenticated).toBe(true)
    })

    test('`ceramic` property', () => {
      const ceramic = {}
      const ds = new DIDDataStore({ ceramic } as any)
      expect(ds.ceramic).toBe(ceramic)
    })

    test('`id` property', () => {
      const ds1 = new DIDDataStore({ ceramic: {} } as any)
      expect(() => ds1.id).toThrow('Ceramic instance is not authenticated')

      const ds2 = new DIDDataStore({ ceramic: { did: { id: 'did:test' } } } as any)
      expect(ds2.id).toBe('did:test')
    })
  })

  describe('Main methods', () => {
    describe('has', () => {
      test('returns true', async () => {
        const getRecordID = jest.fn(() => Promise.resolve('streamId'))
        const ds = new DIDDataStore({} as any)
        ds.getRecordID = getRecordID
        await expect(ds.has('test', 'did')).resolves.toBe(true)
        expect(getRecordID).toBeCalledWith('test', 'did')
      })

      test('returns false', async () => {
        const getRecordID = jest.fn(() => Promise.resolve(null))
        const ds = new DIDDataStore({} as any)
        ds.getRecordID = getRecordID
        await expect(ds.has('test', 'did')).resolves.toBe(false)
        expect(getRecordID).toBeCalledWith('test', 'did')
      })
    })

    test('get', async () => {
      const content = {}
      const getRecordDocument = jest.fn(() => ({ content }))
      const ds = new DIDDataStore({} as any)
      ds.getRecordDocument = getRecordDocument as any
      await expect(ds.get('streamId', 'did')).resolves.toBe(content)
      expect(getRecordDocument).toBeCalledWith('streamId', 'did')
    })

    describe('set', () => {
      test('does not set the index key if it already exists', async () => {
        const ds = new DIDDataStore({} as any)
        const setRecord = jest.fn(() => Promise.resolve([false, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds._setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, undefined)
        expect(setReference).not.toBeCalled()
      })

      test('adds the new index key', async () => {
        const ds = new DIDDataStore({} as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds._setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, undefined)
        expect(setReference).toBeCalledWith('defId', 'streamId')
      })
    })

    describe('merge', () => {
      test('with existing contents', async () => {
        const content = { hello: 'test', foo: 'bar' }
        const getRecord = jest.fn(() => content)
        const setRecord = jest.fn(() => 'contentId')
        const ds = new DIDDataStore({} as any)
        ds.get = getRecord as any
        ds._setRecord = setRecord as any
        await expect(ds.merge('streamId', { hello: 'world', added: 'value' })).resolves.toBe(
          'contentId'
        )
        expect(setRecord).toBeCalledWith(
          'streamId',
          { hello: 'world', foo: 'bar', added: 'value' },
          undefined
        )
      })

      test('without existing contents', async () => {
        const content = { hello: 'test', foo: 'bar' }
        const getRecord = jest.fn(() => null)
        const setRecord = jest.fn(() => 'contentId')
        const ds = new DIDDataStore({} as any)
        ds.get = getRecord as any
        ds._setRecord = setRecord as any
        await expect(ds.merge('streamId', content)).resolves.toBe('contentId')
        expect(setRecord).toBeCalledWith('streamId', content, undefined)
      })
    })

    test('setAll', async () => {
      const ref1 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
      const ref2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpbbb'
      const setRecordOnly = jest.fn((key) => {
        return key === 'first'
          ? [true, StreamID.fromString(ref1)]
          : [false, StreamID.fromString(ref2)]
      })
      const setReferences = jest.fn()

      const ds = new DIDDataStore({} as any)
      ds._setRecordOnly = setRecordOnly as any
      ds._setReferences = setReferences as any

      const refs = { first: `ceramic://${ref1}` }
      await expect(ds.setAll({ first: { foo: 'foo' }, second: { bar: 'bar' } })).resolves.toEqual(
        refs
      )
      expect(setRecordOnly).toBeCalledTimes(2)
      expect(setReferences).toBeCalledWith(refs)
    })

    test('setDefaults', async () => {
      const newID = StreamID.fromString(
        'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
      )
      const definition = {}
      const getDefinition = jest.fn(() => definition)
      const getIndex = jest.fn(() => ({ def1: 'ref1', def2: 'ref2' }))
      const createRecord = jest.fn(() => newID)
      const setReferences = jest.fn()

      const ds = new DIDDataStore({} as any)
      ds.getDefinition = getDefinition as any
      ds.getIndex = getIndex as any
      ds._createRecord = createRecord as any
      ds._setReferences = setReferences as any

      const refs = { def3: newID.toUrl() }
      await expect(
        ds.setDefaults({ def1: { hello: 'world' }, def3: { added: 'value' } })
      ).resolves.toEqual(refs)
      expect(getDefinition).toBeCalledWith('def3')
      expect(createRecord).toBeCalledWith(definition, { added: 'value' }, undefined)
      expect(setReferences).toBeCalledWith(refs)
    })

    test('remove', async () => {
      const remove = jest.fn(() => Promise.resolve())
      const ds = new DIDDataStore({} as any)
      ds.remove = remove
      await expect(ds.remove('streamId')).resolves.toBeUndefined()
      expect(remove).toBeCalledWith('streamId')
    })
  })

  describe('Index methods', () => {
    test('getIndex with provided DID', async () => {
      const get = jest.fn()
      const ds = new DIDDataStore({ ceramic: { did: {} } } as any)
      ds._getIDXDoc = get
      await ds.getIndex('did:test')
      expect(get).toBeCalledWith('did:test')
    })

    test('getIndex with own DID', async () => {
      const get = jest.fn()
      const ds = new DIDDataStore({ ceramic: { did: { id: 'did:test' } } } as any)
      ds._indexProxy = { get } as any
      await ds.getIndex()
      expect(get).toBeCalled()
    })

    test('iterator', async () => {
      const index = {
        'ceramic://definition1': 'ceramic://doc1',
        'ceramic://definition2': 'ceramic://doc2',
        'ceramic://definition3': 'ceramic://doc3',
      }
      const loadDocument = jest.fn(() => Promise.resolve({ content: 'doc content' }))
      const getIndex = jest.fn(() => Promise.resolve(index))
      const ds = new DIDDataStore({ ceramic: { did: { id: 'did:own' } } } as any)
      ds._loadDocument = loadDocument as any
      ds.getIndex = getIndex

      const results = []
      for await (const entry of ds.iterator()) {
        results.push(entry)
      }
      expect(results).toEqual([
        {
          key: 'ceramic://definition1',
          id: 'ceramic://doc1',
          record: 'doc content',
        },
        {
          key: 'ceramic://definition2',
          id: 'ceramic://doc2',
          record: 'doc content',
        },
        {
          key: 'ceramic://definition3',
          id: 'ceramic://doc3',
          record: 'doc content',
        },
      ])
      expect(loadDocument).toBeCalledTimes(3)
      expect(loadDocument).toHaveBeenNthCalledWith(1, 'ceramic://doc1')
      expect(loadDocument).toHaveBeenNthCalledWith(2, 'ceramic://doc2')
      expect(loadDocument).toHaveBeenNthCalledWith(3, 'ceramic://doc3')
    })

    test('_createIDXDoc', async () => {
      const ceramic = {}
      const doc = { id: 'streamId' }
      TileDocument.create.mockImplementationOnce(jest.fn(() => Promise.resolve(doc)) as any)
      const ds = new DIDDataStore({ ceramic } as any)

      await expect(ds._createIDXDoc('did:test:123')).resolves.toBe(doc)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(TileDocument.create).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(TileDocument.create).toHaveBeenCalledWith(
        ceramic,
        null,
        { deterministic: true, controllers: ['did:test:123'], family: 'IDX' },
        { anchor: false, publish: false }
      )
    })

    describe('_getIDXDoc', () => {
      test('calls _createIDXDoc and check the contents are set', async () => {
        const doc = { content: {} } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({} as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getIDXDoc('did:test:123')).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })

      test('returns null if the contents are not set', async () => {
        const doc = { content: null } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({} as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getIDXDoc('did:test:123')).resolves.toBeNull()
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })
    })

    describe('_getOwnIDXDoc', () => {
      test('creates and sets schema in update', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX' }
        const update = jest.fn()
        const add = jest.fn()
        const doc = { id: 'streamId', update, metadata } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ ceramic: { did: { id }, pin: { add } } } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getOwnIDXDoc()).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).toHaveBeenCalledWith({})
        expect(add).toBeCalledWith('streamId')
      })

      test('returns the doc if valid', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX' }
        const update = jest.fn()
        const doc = { update, metadata, content: {} } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ ceramic: { did: { id } } } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getOwnIDXDoc()).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).not.toHaveBeenCalled()
      })
    })
  })

  describe('Metadata methods', () => {
    test('getDefinition', async () => {
      const ceramic = {}
      const load = jest.fn(() => Promise.resolve({ content: { name: 'definition' } }))
      TileDocument.load.mockImplementationOnce(load)
      const ds = new DIDDataStore({ ceramic } as any)
      await expect(ds.getDefinition('ceramic://test')).resolves.toEqual({
        name: 'definition',
      })
      expect(load).toBeCalledWith(ceramic, 'ceramic://test')
    })
  })

  describe('Records methods', () => {
    test('_loadDocument', async () => {
      const load = jest.fn()
      TileDocument.load.mockImplementation(load)
      const ds = new DIDDataStore({} as any)
      await Promise.all([ds._loadDocument('one'), ds._loadDocument('one'), ds._loadDocument('two')])
      expect(load).toBeCalledTimes(3)
    })

    test('getRecordID', async () => {
      const ds = new DIDDataStore({} as any)
      ds.getIndex = () => Promise.resolve(null)
      await expect(ds.getRecordID('test', 'did')).resolves.toBeNull()

      const get = jest.fn(() => Promise.resolve({ exists: 'ceramic://test' }))
      ds.getIndex = get as any
      await expect(ds.getRecordID('exists', 'did')).resolves.toBe('ceramic://test')
      expect(get).toHaveBeenCalledWith('did')
    })

    test('getRecordDocument', async () => {
      const ds = new DIDDataStore({} as any)
      ds.getRecordID = () => Promise.resolve(null)
      await expect(ds.getRecordDocument('test', 'did')).resolves.toBeNull()

      const getRecordID = jest.fn(() => Promise.resolve('ceramic://test'))
      ds.getRecordID = getRecordID
      const doc = { content: { test: true } }
      const load = jest.fn(() => Promise.resolve(doc))
      ds._loadDocument = load as any

      await expect(ds.getRecordDocument('exists', 'did')).resolves.toBe(doc)
      expect(getRecordID).toHaveBeenCalledWith('exists', 'did')
      expect(load).toHaveBeenCalledWith('ceramic://test')
    })

    describe('_setRecordOnly', () => {
      test('existing definition ID', async () => {
        const ds = new DIDDataStore({ ceramic: { did: { id: 'did:foo:123' } } } as any)
        const getRecordID = jest.fn(() => Promise.resolve('streamId'))
        const update = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ update, id: 'streamId' }))
        ds._loadDocument = loadDocument as any
        ds.getRecordID = getRecordID

        const content = { test: true }
        await expect(ds._setRecordOnly('defId', content)).resolves.toEqual([false, 'streamId'])
        expect(getRecordID).toBeCalledWith('defId', 'did:foo:123')
        expect(loadDocument).toBeCalledWith('streamId')
        expect(update).toBeCalledWith(content)
      })

      test('adding definition ID', async () => {
        const ds = new DIDDataStore({ ceramic: { did: { id: 'did' } } } as any)
        ds._indexProxy = { get: (): Promise<any> => Promise.resolve(null) } as any

        const definition = { name: 'test', schema: 'ceramic://...' }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        ds.getDefinition = getDefinition as any
        const createRecord = jest.fn(() => Promise.resolve('streamId'))
        ds._createRecord = createRecord as any

        const content = { test: true }
        await expect(ds._setRecordOnly('defId', content, { pin: true })).resolves.toEqual([
          true,
          'streamId',
        ])
        expect(getDefinition).toBeCalledWith('defId')
        expect(createRecord).toBeCalledWith(definition, content, { pin: true })
      })
    })

    describe('_setRecord', () => {
      test('does not set the index key if it already exists', async () => {
        const ds = new DIDDataStore({} as any)
        const setRecord = jest.fn(() => Promise.resolve([false, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds._setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, undefined)
        expect(setReference).not.toBeCalled()
      })

      test('adds the new index key', async () => {
        const ds = new DIDDataStore({} as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds._setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, undefined)
        expect(setReference).toBeCalledWith('defId', 'streamId')
      })
    })

    describe('_createRecord', () => {
      test('creates the deterministic doc and updates it', async () => {
        const id = 'did:test:123'
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(
          jest.fn((_ceramic, _content, metadata, _opts) => {
            return Promise.resolve({ id: 'streamId', update, metadata })
          })
        )
        const ceramic = { did: { id }, pin: { add } }
        const ds = new DIDDataStore({ ceramic } as any)

        const definition = {
          id: { toString: () => 'defId' },
          name: 'test',
          schema: 'schemaId',
        } as any
        const content = { test: true }
        await expect(ds._createRecord(definition, content, { pin: true })).resolves.toBe('streamId')
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(TileDocument.create).toBeCalledWith(
          ceramic,
          null,
          { deterministic: true, controllers: [id], family: 'defId' },
          { anchor: false, publish: false }
        )
        expect(update).toBeCalledWith(content, {
          deterministic: true,
          controllers: [id],
          family: 'defId',
          schema: 'schemaId',
        })
        expect(add).toBeCalledWith('streamId')
      })

      test('pin by default', async () => {
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(
          jest.fn((_ceramic, _content, metadata) => {
            return Promise.resolve({ id: 'streamId', update, metadata })
          })
        )
        const ds = new DIDDataStore({
          ceramic: { did: { id: 'did:test:123' }, pin: { add } },
        } as any)

        await ds._createRecord({ id: { toString: () => 'defId' } } as any, {})
        expect(update).toBeCalled()
        expect(add).toBeCalledWith('streamId')
      })

      test('no pinning by setting instance option', async () => {
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(
          jest.fn((_ceramic, _content, metadata) => {
            return Promise.resolve({ id: 'streamId', update, metadata })
          })
        )
        const ds = new DIDDataStore({
          autopin: false,
          ceramic: { did: { id: 'did:test:123' }, pin: { add } },
        } as any)
        await ds._createRecord({ id: { toString: () => 'defId' } } as any, {})
        expect(update).toBeCalled()
        expect(add).not.toBeCalled()
      })

      test('explicit no pinning', async () => {
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(
          jest.fn((_ceramic, _content, metadata) => {
            return Promise.resolve({ id: 'streamId', update, metadata })
          })
        )
        const ds = new DIDDataStore({
          autopin: true,
          ceramic: { did: { id: 'did:test:123' }, pin: { add } },
        } as any)
        await ds._createRecord({ id: { toString: () => 'defId' } } as any, {}, { pin: false })
        expect(update).toBeCalled()
        expect(add).not.toBeCalled()
      })
    })
  })

  describe('References methods', () => {
    test('_setReference', async () => {
      const content = { test: true }
      const changeContent = jest.fn((change) => change(content))
      const ds = new DIDDataStore({} as any)
      ds._indexProxy = { changeContent } as any
      await expect(ds._setReference('testId', testDocID)).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, testId: testDocID.toUrl() })
    })

    test('_setReferences', async () => {
      const content = { test: true }
      const changeContent = jest.fn((change) => change(content))
      const ds = new DIDDataStore({} as any)
      ds._indexProxy = { changeContent } as any
      await expect(ds._setReferences({ one: 'one', two: 'two' })).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, one: 'one', two: 'two' })
    })
  })
})
