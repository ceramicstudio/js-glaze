/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { StreamID } from '@ceramicnetwork/streamid'
import { CIP11_DEFINITION_SCHEMA_URL, CIP11_INDEX_SCHEMA_URL } from '@glazed/constants'
import { DataModel } from '@glazed/datamodel'
import { TileLoader } from '@glazed/tile-loader'

import { DIDDataStore } from '../src'

jest.mock('@glazed/tile-loader')

const Loader = TileLoader as jest.MockedClass<typeof TileLoader>

describe('DIDDataStore', () => {
  const model = {
    schemas: {},
    definitions: {},
    tiles: {},
  }

  const testDocID = StreamID.fromString(
    'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
  )

  describe('properties', () => {
    test('`authenticated` property', () => {
      const ds1 = new DIDDataStore({ ceramic: {}, model } as any)
      expect(ds1.authenticated).toBe(false)

      const ds2 = new DIDDataStore({ ceramic: { did: {} }, model } as any)
      expect(ds2.authenticated).toBe(true)
    })

    test('`ceramic` property', () => {
      const ceramic = {}
      const ds = new DIDDataStore({ ceramic, model } as any)
      expect(ds.ceramic).toBe(ceramic)
    })

    test('`id` property', () => {
      const ds1 = new DIDDataStore({ ceramic: {}, model } as any)
      expect(() => ds1.id).toThrow('Ceramic instance is not authenticated')

      const ds2 = new DIDDataStore({
        ceramic: { did: { id: 'did:test' } },
        id: 'did:123',
        model,
      } as any)
      expect(ds2.id).toBe('did:123')

      const ds3 = new DIDDataStore({ ceramic: { did: { id: 'did:test' } }, model } as any)
      expect(ds3.id).toBe('did:test')
    })

    test('`model` property', () => {
      const ds = new DIDDataStore({ ceramic: {}, model } as any)
      expect(ds.model).toBeInstanceOf(DataModel)
    })
  })

  describe('Main methods', () => {
    describe('has()', () => {
      test('returns true', async () => {
        const getRecordID = jest.fn(() => Promise.resolve('streamId'))
        const ds = new DIDDataStore({ model } as any)
        ds.getRecordID = getRecordID
        await expect(ds.has('test', 'did')).resolves.toBe(true)
        expect(getRecordID).toBeCalledWith('test', 'did')
      })

      test('returns false', async () => {
        const getRecordID = jest.fn(() => Promise.resolve(null))
        const ds = new DIDDataStore({ model } as any)
        ds.getRecordID = getRecordID
        await expect(ds.has('test', 'did')).resolves.toBe(false)
        expect(getRecordID).toBeCalledWith('test', 'did')
      })
    })

    test('get()', async () => {
      const content = {}
      const getRecordDocument = jest.fn(() => ({ content }))
      const ds = new DIDDataStore({ model } as any)
      ds.getRecordDocument = getRecordDocument as any
      await expect(ds.get('streamId', 'did')).resolves.toBe(content)
      expect(getRecordDocument).toBeCalledWith('streamId', 'did')
    })

    describe('set()', () => {
      test('does not set the index key if it already exists', async () => {
        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        const setRecord = jest.fn(() => Promise.resolve([false, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds.setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, {})
        expect(setReference).not.toBeCalled()
      })

      test('adds the new index key', async () => {
        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds.setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, {})
        expect(setReference).toBeCalledWith('did:test', 'defId', 'streamId')
      })

      test('uses the ID attached to the instance', async () => {
        const ds = new DIDDataStore({ model, id: 'did:test' } as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference
        await ds.setRecord('defId', { test: true })
        expect(setReference).toBeCalledWith('did:test', 'defId', 'streamId')
      })

      test('uses the provided controller', async () => {
        const ds = new DIDDataStore({ model, id: 'did:test' } as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference
        await ds.setRecord('defId', { test: true }, { controller: 'did:123' })
        expect(setReference).toBeCalledWith('did:123', 'defId', 'streamId')
      })
    })

    describe('merge()', () => {
      test('with existing contents', async () => {
        const content = { hello: 'test', foo: 'bar' }
        const getRecord = jest.fn(() => content)
        const setRecord = jest.fn(() => 'contentId')
        const ds = new DIDDataStore({ ceramic: { did: { id: 'did:test:123' } }, model } as any)
        ds.getRecord = getRecord as any
        ds.setRecord = setRecord as any
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
        const ds = new DIDDataStore({ ceramic: { did: { id: 'did:test:123' } }, model } as any)
        ds.getRecord = getRecord as any
        ds.setRecord = setRecord as any
        await expect(ds.merge('streamId', content)).resolves.toBe('contentId')
        expect(setRecord).toBeCalledWith('streamId', content, undefined)
      })
    })

    describe('setAll()', () => {
      test('uses the ID attached to the instance', async () => {
        const ref1 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
        const ref2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpbbb'
        const setRecordOnly = jest.fn((key) => {
          return key === 'first'
            ? [true, StreamID.fromString(ref1)]
            : [false, StreamID.fromString(ref2)]
        })
        const setReferences = jest.fn()

        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        ds._setRecordOnly = setRecordOnly as any
        ds._setReferences = setReferences as any

        const refs = { first: `ceramic://${ref1}` }
        await expect(ds.setAll({ first: { foo: 'foo' }, second: { bar: 'bar' } })).resolves.toEqual(
          refs
        )
        expect(setRecordOnly).toBeCalledTimes(2)
        expect(setReferences).toBeCalledWith('did:test', refs)
      })

      test('uses the provided controller', async () => {
        const ref1 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
        const ref2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpbbb'
        const setRecordOnly = jest.fn((key) => {
          return key === 'first'
            ? [true, StreamID.fromString(ref1)]
            : [false, StreamID.fromString(ref2)]
        })
        const setReferences = jest.fn()

        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        ds._setRecordOnly = setRecordOnly as any
        ds._setReferences = setReferences as any

        const refs = { first: `ceramic://${ref1}` }
        await expect(
          ds.setAll({ first: { foo: 'foo' }, second: { bar: 'bar' } }, { controller: 'did:123' })
        ).resolves.toEqual(refs)
        expect(setRecordOnly).toBeCalledTimes(2)
        expect(setReferences).toBeCalledWith('did:123', refs)
      })
    })

    describe('setDefaults()', () => {
      test('uses the ID attached to the instance', async () => {
        const newID = StreamID.fromString(
          'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
        )
        const definition = {}
        const getDefinition = jest.fn(() => definition)
        const getIndex = jest.fn(() => ({ def1: 'ref1', def2: 'ref2' }))
        const createRecord = jest.fn(() => newID)
        const setReferences = jest.fn()

        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        ds.getDefinition = getDefinition as any
        ds.getIndex = getIndex as any
        ds._createRecord = createRecord as any
        ds._setReferences = setReferences as any

        const refs = { def3: newID.toUrl() }
        await expect(
          ds.setDefaults({ def1: { hello: 'world' }, def3: { added: 'value' } })
        ).resolves.toEqual(refs)
        expect(getDefinition).toBeCalledWith('def3')
        expect(createRecord).toBeCalledWith(definition, { added: 'value' }, {})
        expect(setReferences).toBeCalledWith('did:test', refs)
      })

      test('uses the provided controller', async () => {
        const newID = StreamID.fromString(
          'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
        )
        const definition = {}
        const getDefinition = jest.fn(() => definition)
        const getIndex = jest.fn(() => ({ def1: 'ref1', def2: 'ref2' }))
        const createRecord = jest.fn(() => newID)
        const setReferences = jest.fn()

        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        ds.getDefinition = getDefinition as any
        ds.getIndex = getIndex as any
        ds._createRecord = createRecord as any
        ds._setReferences = setReferences as any

        const refs = { def3: newID.toUrl() }
        await expect(
          ds.setDefaults(
            { def1: { hello: 'world' }, def3: { added: 'value' } },
            { controller: 'did:123' }
          )
        ).resolves.toEqual(refs)
        expect(getDefinition).toBeCalledWith('def3')
        expect(createRecord).toBeCalledWith(
          definition,
          { added: 'value' },
          { controller: 'did:123' }
        )
        expect(setReferences).toBeCalledWith('did:123', refs)
      })
    })

    describe('remove()', () => {
      test('uses the ID attached to the instance', async () => {
        const getIndexProxy = jest.fn(() => ({
          changeContent: (input: unknown) => Promise.resolve(input),
        }))
        const ds = new DIDDataStore({ model, id: 'did:test' } as any)
        ds._getIndexProxy = getIndexProxy as any
        await expect(ds.remove('streamId')).resolves.toBeUndefined()
        expect(getIndexProxy).toBeCalledWith('did:test')
      })

      test('uses the provided controller', async () => {
        const getIndexProxy = jest.fn(() => ({
          changeContent: (input: unknown) => Promise.resolve(input),
        }))
        const ds = new DIDDataStore({ model, id: 'did:test' } as any)
        ds._getIndexProxy = getIndexProxy as any
        await expect(ds.remove('streamId', 'did:123')).resolves.toBeUndefined()
        expect(getIndexProxy).toBeCalledWith('did:123')
      })
    })
  })

  describe('Index methods', () => {
    test('getIndex() with provided DID', async () => {
      const get = jest.fn()
      const getIndexProxy = jest.fn()
      const ds = new DIDDataStore({ ceramic: { did: {} }, model } as any)
      ds._getIDXDoc = get
      ds._getIndexProxy = getIndexProxy as any
      await ds.getIndex('did:test')
      expect(get).toBeCalledWith('did:test')
      expect(getIndexProxy).not.toBeCalled()
    })

    test('getIndex() with own DID', async () => {
      const get = jest.fn(() => ({}))
      const getIndexProxy = jest.fn(() => ({ get }))
      const ds = new DIDDataStore({ model, id: 'did:test:123', ceramic: { did: {} } } as any)
      ds._getIndexProxy = getIndexProxy as any
      await ds.getIndex('did:test:123')
      expect(getIndexProxy).toBeCalledWith('did:test:123')
      expect(get).toBeCalled()
    })

    test('iterator()', async () => {
      const index = {
        'ceramic://definition1': 'ceramic://doc1',
        'ceramic://definition2': 'ceramic://doc2',
        'ceramic://definition3': 'ceramic://doc3',
      }
      const load = jest.fn(() => Promise.resolve({ content: 'doc content' }))
      Loader.mockImplementationOnce(() => ({ load } as unknown as TileLoader))
      const getIndex = jest.fn(() => Promise.resolve(index))
      const ds = new DIDDataStore({ ceramic: { did: { id: 'did:own' } }, model } as any)
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
      expect(load).toBeCalledTimes(3)
      expect(load).toHaveBeenNthCalledWith(1, 'ceramic://doc1')
      expect(load).toHaveBeenNthCalledWith(2, 'ceramic://doc2')
      expect(load).toHaveBeenNthCalledWith(3, 'ceramic://doc3')
    })

    test('_createIDXDoc()', async () => {
      const ceramic = {}
      const doc = { id: 'streamId' }
      const deterministic = jest.fn(() => Promise.resolve(doc))
      Loader.mockImplementationOnce(() => ({ deterministic } as unknown as TileLoader))
      const ds = new DIDDataStore({ ceramic, model } as any)

      await expect(ds._createIDXDoc('did:test:123')).resolves.toBe(doc)
      expect(deterministic).toHaveBeenCalledTimes(1)
      expect(deterministic).toHaveBeenCalledWith({ controllers: ['did:test:123'], family: 'IDX' })
    })

    describe('_getIDXDoc()', () => {
      test('calls _createIDXDoc() and check the contents and schema are set', async () => {
        const doc = { content: {}, metadata: { schema: CIP11_INDEX_SCHEMA_URL } } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getIDXDoc('did:test:123')).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })

      test('returns null if the contents are not set', async () => {
        const doc = { content: null, metadata: { schema: CIP11_INDEX_SCHEMA_URL } } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getIDXDoc('did:test:123')).resolves.toBeNull()
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })

      test('returns null if the schema is not set', async () => {
        const doc = { content: {}, metadata: {} } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getIDXDoc('did:test:123')).resolves.toBeNull()
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })

      test('throws if the schema is invalid', async () => {
        const doc = { content: {}, metadata: { schema: 'OtherSchemaURL' } } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getIDXDoc('did:test:123')).rejects.toThrow(
          'Invalid document: schema is not IdentityIndex'
        )
        expect(createDoc).toHaveBeenCalledWith('did:test:123')
      })
    })

    describe('_getOwnIDXDoc()', () => {
      test('creates and sets schema in update', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX' }
        const update = jest.fn()
        const doc = { id: 'streamId', update, metadata } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ ceramic: { did: { id } }, model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getOwnIDXDoc(id)).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).toHaveBeenCalledWith({}, { schema: CIP11_INDEX_SCHEMA_URL }, { pin: true })
      })

      test('returns the doc if valid', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX', schema: CIP11_INDEX_SCHEMA_URL }
        const update = jest.fn()
        const doc = { update, metadata, content: {} } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ id, model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getOwnIDXDoc(id)).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).not.toHaveBeenCalled()
      })

      test('throws if the schema is invalid', async () => {
        const id = 'did:test:123'
        const metadata = { controllers: [id], family: 'IDX', schema: 'OtherSchemaURL' }
        const update = jest.fn()
        const doc = { update, metadata, content: {} } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const ds = new DIDDataStore({ id, model } as any)
        ds._createIDXDoc = createDoc

        await expect(ds._getOwnIDXDoc(id)).rejects.toThrow(
          'Invalid document: schema is not IdentityIndex'
        )
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).not.toHaveBeenCalled()
      })
    })

    test('_getIndexProxy()', () => {
      const ds = new DIDDataStore({ model } as any)
      const proxy1 = ds._getIndexProxy('did:123')
      const proxy1again = ds._getIndexProxy('did:123')
      expect(proxy1again).toBe(proxy1)
      const proxy2 = ds._getIndexProxy('did:456')
      expect(proxy2).not.toBe(proxy1)
    })
  })

  describe('Metadata methods', () => {
    describe('getDefinitionID()', () => {
      test('with alias in model', () => {
        const ds = new DIDDataStore({
          ceramic: {},
          model: { ...model, definitions: { foo: 'bar' } },
        } as any)
        expect(ds.getDefinitionID('foo')).toBe('bar')
      })

      test('without alias in model', () => {
        const ds = new DIDDataStore({ ceramic: {}, model } as any)
        expect(ds.getDefinitionID('foo')).toBe('foo')
      })
    })

    describe('getDefinition()', () => {
      test('returns valid definition', async () => {
        const load = jest.fn(() => {
          return Promise.resolve({
            content: { name: 'definition' },
            metadata: { schema: CIP11_DEFINITION_SCHEMA_URL },
          } as unknown as TileDocument)
        })
        Loader.mockImplementationOnce(() => ({ load } as unknown as TileLoader))
        const ds = new DIDDataStore({ ceramic: {}, model } as any)
        await expect(ds.getDefinition('ceramic://test')).resolves.toEqual({
          name: 'definition',
        })
        expect(load).toBeCalledWith('ceramic://test')
      })

      test('throws on invalid definition schema', async () => {
        const load = jest.fn(() => {
          return Promise.resolve({
            content: { name: 'definition' },
            metadata: { schema: 'OtherSchemaURL' },
          } as unknown as TileDocument)
        })
        Loader.mockImplementationOnce(() => ({ load } as unknown as TileLoader))
        const ds = new DIDDataStore({ ceramic: {}, model } as any)
        await expect(ds.getDefinition('ceramic://test')).rejects.toThrow(
          'Invalid document: schema is not Definition'
        )
        expect(load).toBeCalledWith('ceramic://test')
      })
    })
  })

  describe('Records methods', () => {
    test('getRecordID()', async () => {
      const ds = new DIDDataStore({ model } as any)
      ds.getIndex = () => Promise.resolve(null)
      await expect(ds.getRecordID('test', 'did')).resolves.toBeNull()

      const get = jest.fn(() => Promise.resolve({ exists: 'ceramic://test' }))
      ds.getIndex = get as any
      await expect(ds.getRecordID('exists', 'did')).resolves.toBe('ceramic://test')
      expect(get).toHaveBeenCalledWith('did')
    })

    describe('getRecordDocument()', () => {
      test('with no record ID', async () => {
        const ds = new DIDDataStore({ model } as any)
        ds.getRecordID = () => Promise.resolve(null)
        await expect(ds.getRecordDocument('test', 'did')).resolves.toBeNull()
      })

      test('with existing record doc', async () => {
        const load = jest.fn(() => Promise.resolve(doc))
        Loader.mockImplementationOnce(() => ({ load } as unknown as TileLoader))
        const ds = new DIDDataStore({ model } as any)
        const getRecordID = jest.fn(() => Promise.resolve('ceramic://test'))
        ds.getRecordID = getRecordID
        const doc = { content: { test: true } }

        await expect(ds.getRecordDocument('exists', 'did')).resolves.toBe(doc)
        expect(getRecordID).toHaveBeenCalledWith('exists', 'did')
        expect(load).toHaveBeenCalledWith('ceramic://test')
      })
    })

    test('getRecord()', async () => {
      const content = {}
      const getRecordDocument = jest.fn(() => ({ content }))
      const ds = new DIDDataStore({ model } as any)
      ds.getRecordDocument = getRecordDocument as any
      await expect(ds.getRecord('streamId', 'did')).resolves.toBe(content)
      expect(getRecordDocument).toBeCalledWith('streamId', 'did')
    })

    describe('_setRecordOnly()', () => {
      test('existing definition ID', async () => {
        const update = jest.fn()
        const load = jest.fn(() => Promise.resolve({ update, id: 'streamId' }))
        Loader.mockImplementationOnce(() => ({ load } as unknown as TileLoader))

        const ds = new DIDDataStore({ ceramic: { did: { id: 'did:foo:123' } }, model } as any)
        const getRecordID = jest.fn(() => Promise.resolve('streamId'))
        ds.getRecordID = getRecordID
        const content = { test: true }

        await expect(ds._setRecordOnly('defId', content)).resolves.toEqual([false, 'streamId'])
        expect(getRecordID).toBeCalledWith('defId', 'did:foo:123')
        expect(load).toBeCalledWith('streamId')
        expect(update).toBeCalledWith(content)
      })

      test('adding definition ID', async () => {
        const ds = new DIDDataStore({ ceramic: { did: { id: 'did' } }, model } as any)
        ds._getIndexProxy = () => ({ get: (): Promise<any> => Promise.resolve(null) } as any)

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

    describe('setRecord()', () => {
      test('does not set the index key if it already exists', async () => {
        const ds = new DIDDataStore({ model } as any)
        const setRecord = jest.fn(() => Promise.resolve([false, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds.setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, {})
        expect(setReference).not.toBeCalled()
      })

      test('adds the new index key', async () => {
        const ds = new DIDDataStore({ id: 'did:test', model } as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        ds._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        ds._setReference = setReference

        const content = { test: true }
        await ds.setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, {})
        expect(setReference).toBeCalledWith('did:test', 'defId', 'streamId')
      })
    })

    describe('_createRecord()', () => {
      test('creates the deterministic doc and updates it', async () => {
        const id = 'did:test:123'
        const update = jest.fn()
        const deterministic = jest.fn((_ceramic, _content, metadata, _opts) => {
          return Promise.resolve({ id: 'streamId', update, metadata } as unknown as TileDocument)
        })
        Loader.mockImplementationOnce(() => ({ deterministic } as unknown as TileLoader))

        const ceramic = { did: { id } }
        const ds = new DIDDataStore({ ceramic, model } as any)

        const definition = {
          id: { toString: () => 'defId' },
          name: 'test',
          schema: 'schemaId',
        } as any
        const content = { test: true }
        await expect(ds._createRecord(definition, content, { pin: true })).resolves.toBe('streamId')
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(deterministic).toBeCalledWith({ controllers: [id], family: 'defId' })
        expect(update).toBeCalledWith(content, { schema: 'schemaId' }, { pin: true })
      })

      test('pin by default', async () => {
        const update = jest.fn()
        const deterministic = jest.fn((_ceramic, _content, metadata, _opts) => {
          return Promise.resolve({ id: 'streamId', update, metadata } as unknown as TileDocument)
        })
        Loader.mockImplementationOnce(() => ({ deterministic } as unknown as TileLoader))

        const ds = new DIDDataStore({
          ceramic: { did: { id: 'did:test:123' } },
          model,
        } as any)
        await ds._createRecord({ id: { toString: () => 'defId' } } as any, {}, {})
        expect(update).toBeCalledWith({}, { schema: undefined }, { pin: true })
      })

      test('no pinning by setting instance option', async () => {
        const update = jest.fn()
        const deterministic = jest.fn((_ceramic, _content, metadata, _opts) => {
          return Promise.resolve({ id: 'streamId', update, metadata } as unknown as TileDocument)
        })
        Loader.mockImplementationOnce(() => ({ deterministic } as unknown as TileLoader))

        const ds = new DIDDataStore({
          autopin: false,
          ceramic: { did: { id: 'did:test:123' } },
          model,
        } as any)
        await ds._createRecord({ id: { toString: () => 'defId' } } as any, {}, {})
        expect(update).toBeCalledWith({}, { schema: undefined }, { pin: false })
      })

      test('explicit no pinning', async () => {
        const update = jest.fn()
        const deterministic = jest.fn((_ceramic, _content, metadata, _opts) => {
          return Promise.resolve({ id: 'streamId', update, metadata } as unknown as TileDocument)
        })
        Loader.mockImplementationOnce(() => ({ deterministic } as unknown as TileLoader))

        const ds = new DIDDataStore({
          autopin: true,
          ceramic: { did: { id: 'did:test:123' } },
          model,
        } as any)
        await ds._createRecord({ id: { toString: () => 'defId' } } as any, {}, { pin: false })
        expect(update).toBeCalledWith({}, { schema: undefined }, { pin: false })
      })
    })
  })

  describe('References methods', () => {
    test('_setReference()', async () => {
      const content = { test: true }
      const changeContent = jest.fn((change) => change(content))
      const ds = new DIDDataStore({ id: 'did:test', model } as any)
      ds._getIndexProxy = () => ({ changeContent } as any)
      await expect(ds._setReference('did:test', 'testId', testDocID)).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, testId: testDocID.toUrl() })
    })

    test('_setReferences()', async () => {
      const content = { test: true }
      const changeContent = jest.fn((change) => change(content))
      const ds = new DIDDataStore({ id: 'did:test', model } as any)
      ds._getIndexProxy = () => ({ changeContent } as any)
      await expect(
        ds._setReferences('did:test', { one: 'one', two: 'two' })
      ).resolves.toBeUndefined()
      expect(changeContent).toReturnWith({ test: true, one: 'one', two: 'two' })
    })
  })
})
