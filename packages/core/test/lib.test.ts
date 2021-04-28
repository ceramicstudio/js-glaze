/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import StreamID from '@ceramicnetwork/streamid'
import { schemas } from '@ceramicstudio/idx-constants'
import { TileDocument } from '@ceramicnetwork/stream-tile'
jest.mock('@ceramicnetwork/stream-tile')

import { IDX } from '../src/index'

describe('IDX', () => {
  const testDocID = StreamID.fromString(
    'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
  )

  describe('properties', () => {
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

    test('`id` property', () => {
      const idx1 = new IDX({ ceramic: {} } as any)
      expect(() => idx1.id).toThrow('Ceramic instance is not authenticated')

      const idx2 = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
      expect(idx2.id).toBe('did:test')
    })
  })

  describe('Main methods', () => {
    describe('has', () => {
      test('returns true', async () => {
        const getReference = jest.fn(() => 'streamId')
        const idx = new IDX({ aliases: { test: 'streamId' } } as any)
        idx._getReference = getReference as any
        await expect(idx.has('test', 'did')).resolves.toBe(true)
        expect(getReference).toBeCalledWith('streamId', 'did')
      })

      test('returns false', async () => {
        const getReference = jest.fn(() => null)
        const idx = new IDX({
          ceramic: { did: { id: 'did:test' } },
          aliases: { test: 'streamId' },
        } as any)
        idx._getReference = getReference
        await expect(idx.has('test')).resolves.toBe(false)
        expect(getReference).toBeCalledWith('streamId', undefined)
      })
    })

    test('get', async () => {
      const content = {}
      const getRecord = jest.fn(() => content)
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._getRecord = getRecord as any
      await expect(idx.get('test', 'did')).resolves.toBe(content)
      expect(getRecord).toBeCalledWith('streamId', 'did')
    })

    test('set', async () => {
      const content = {}
      const setRecord = jest.fn(() => 'contentId')
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._setRecord = setRecord as any
      await expect(idx.set('test', content, { pin: false })).resolves.toBe('contentId')
      expect(setRecord).toBeCalledWith('streamId', content, { pin: false })
    })

    describe('merge', () => {
      test('with existing contents', async () => {
        const content = { hello: 'test', foo: 'bar' }
        const getRecord = jest.fn(() => content)
        const setRecord = jest.fn(() => 'contentId')
        const idx = new IDX({ aliases: { test: 'streamId' } } as any)
        idx._getRecord = getRecord as any
        idx._setRecord = setRecord as any
        await expect(idx.merge('test', { hello: 'world', added: 'value' })).resolves.toBe(
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
        const idx = new IDX({ aliases: { test: 'streamId' } } as any)
        idx._getRecord = getRecord as any
        idx._setRecord = setRecord as any
        await expect(idx.merge('test', content)).resolves.toBe('contentId')
        expect(setRecord).toBeCalledWith('streamId', content, undefined)
      })
    })

    test('setAll', async () => {
      const ref1 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpaaa'
      const ref2 = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexpbbb'
      const setRecordOnly = jest.fn((key) => {
        return key === 'first' ? [true, StreamID.fromString(ref1)] : [false, StreamID.fromString(ref2)]
      })
      const setReferences = jest.fn()

      const idx = new IDX({} as any)
      idx._setRecordOnly = setRecordOnly as any
      idx._setReferences = setReferences as any

      const refs = { first: `ceramic://${ref1}` }
      await expect(idx.setAll({ first: 'foo', second: 'bar' })).resolves.toEqual(refs)
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

      const idx = new IDX({} as any)
      idx.getDefinition = getDefinition as any
      idx.getIndex = getIndex as any
      idx._createRecord = createRecord as any
      idx._setReferences = setReferences as any

      const refs = { def3: newID.toUrl() }
      await expect(
        idx.setDefaults({ def1: { hello: 'world' }, def3: { added: 'value' } })
      ).resolves.toEqual(refs)
      expect(getDefinition).toBeCalledWith('def3')
      expect(createRecord).toBeCalledWith(definition, { added: 'value' }, undefined)
      expect(setReferences).toBeCalledWith(refs)
    })

    test('remove', async () => {
      const removeReference = jest.fn()
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._removeReference = removeReference
      await expect(idx.remove('test')).resolves.toBeUndefined()
      expect(removeReference).toBeCalledWith('streamId')
    })

    describe('_toIndexKey', () => {
      test('resolves the existing alias', () => {
        const idx = new IDX({ aliases: { test: 'streamId' } } as any)
        expect(idx._toIndexKey('test')).toBe('streamId')
      })

      test('returns provided key as-is if not other match', () => {
        const idx = new IDX({} as any)
        expect(idx._toIndexKey('streamId')).toBe('streamId')
      })
    })
  })

  describe('Index methods', () => {
    test('getIndex with provided DID', async () => {
      const get = jest.fn()
      const idx = new IDX({ ceramic: { did: {} } } as any)
      idx._getIDXDoc = get
      await idx.getIndex('did:test')
      expect(get).toBeCalledWith('did:test')
    })

    test('getIndex with own DID', async () => {
      const get = jest.fn()
      const idx = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
      idx._indexProxy = { get } as any
      await idx.getIndex()
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
      const idx = new IDX({ ceramic: { did: { id: 'did:own' } } } as any)
      idx._loadDocument = loadDocument as any
      idx.getIndex = getIndex

      const results = []
      for await (const entry of idx.iterator()) {
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
      const doc = { id: 'streamId' }
      const add = jest.fn()
      TileDocument.create.mockImplementationOnce(jest.fn(() => Promise.resolve(doc)) as any)
      const ceramic = { pin: { add } }
      const idx = new IDX({ ceramic } as any)

      await expect(idx._createIDXDoc('did:test:123')).resolves.toBe(doc)
      expect(TileDocument.create).toHaveBeenCalledTimes(1)
      expect(TileDocument.create).toHaveBeenCalledWith(
        ceramic,
        null,
        { deterministic: true, controllers: ['did:test:123'], family: 'IDX' },
        { anchor: false, publish: false }
      )
      expect(add).toBeCalledWith('streamId')
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
        const update = jest.fn()
        const doc = { update, metadata } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({ ceramic: { did: { id } } } as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getOwnIDXDoc()).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).toHaveBeenCalledWith(null, { ...metadata, schema: schemas.IdentityIndex })
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
        const update = jest.fn()
        const doc = { update, metadata } as any
        const createDoc = jest.fn((_did) => Promise.resolve(doc))
        const idx = new IDX({ ceramic: { did: { id } } } as any)
        idx._createIDXDoc = createDoc

        await expect(idx._getOwnIDXDoc()).resolves.toBe(doc)
        expect(createDoc).toHaveBeenCalledWith(id)
        expect(update).not.toHaveBeenCalled()
      })
    })
  })

  describe('Metadata methods', () => {
    describe('getDefinition', () => {
      test('works with the provided schema', async () => {
        const loadStream = jest.fn(() =>
          Promise.resolve({
            content: { name: 'definition' },
            metadata: { schema: schemas.Definition },
          })
        )
        const idx = new IDX({ ceramic: { loadStream } } as any)
        await expect(idx.getDefinition('ceramic://test')).resolves.toEqual({
          name: 'definition',
        })
        expect(loadStream).toBeCalledWith('ceramic://test')
      })

      test('throws an error if the definition does not use the right schema', async () => {
        const loadStream = jest.fn(() =>
          Promise.resolve({
            content: { name: 'definition' },
            metadata: { schema: 'ceramic://other' },
          })
        )
        const idx = new IDX({ ceramic: { loadStream } } as any)
        await expect(idx.getDefinition('ceramic://test')).rejects.toThrow(
          'Invalid document: schema is not Definition'
        )
      })
    })
  })

  describe('Records methods', () => {
    test('_loadDocument', async () => {
      const loadStream = jest.fn()
      const idx = new IDX({ ceramic: { loadStream } } as any)
      await Promise.all([
        idx._loadDocument('one'),
        idx._loadDocument('one'),
        idx._loadDocument('two'),
      ])
      expect(loadStream).toBeCalledTimes(2)
    })

    test('getRecordID', async () => {
      const idx = new IDX({} as any)
      idx.getIndex = () => Promise.resolve(null)
      await expect(idx.getRecordID('test', 'did')).resolves.toBeNull()

      const get = jest.fn(() => Promise.resolve({ exists: 'ceramic://test' }))
      idx.getIndex = get as any
      await expect(idx.getRecordID('exists', 'did')).resolves.toBe('ceramic://test')
      expect(get).toHaveBeenCalledWith('did')
    })

    test('getRecordDocument', async () => {
      const idx = new IDX({} as any)
      idx.getRecordID = () => Promise.resolve(null)
      await expect(idx.getRecordDocument('test', 'did')).resolves.toBeNull()

      const getRecordID = jest.fn(() => Promise.resolve('ceramic://test'))
      idx.getRecordID = getRecordID
      const doc = { content: { test: true } }
      const load = jest.fn(() => Promise.resolve(doc))
      idx._loadDocument = load as any

      await expect(idx.getRecordDocument('exists', 'did')).resolves.toBe(doc)
      expect(getRecordID).toHaveBeenCalledWith('exists', 'did')
      expect(load).toHaveBeenCalledWith('ceramic://test')
    })

    test('_getRecord', async () => {
      const idx = new IDX({} as any)
      idx.getRecordDocument = () => Promise.resolve(null)
      await expect(idx._getRecord('test', 'did')).resolves.toBeNull()

      const content = { test: true }
      const get = jest.fn(() => Promise.resolve({ content }))
      idx.getRecordDocument = get as any
      await expect(idx._getRecord('exists', 'did')).resolves.toBe(content)
      expect(get).toHaveBeenCalledWith('exists', 'did')
    })

    describe('_setRecordOnly', () => {
      test('existing definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._getReference = (): Promise<any> => Promise.resolve('streamId')

        const update = jest.fn()
        const loadDocument = jest.fn(() => Promise.resolve({ update, id: 'streamId' }))
        idx._loadDocument = loadDocument as any

        const content = { test: true }
        await expect(idx._setRecordOnly('defId', content)).resolves.toEqual([false, 'streamId'])
        expect(loadDocument).toBeCalledWith('streamId')
        expect(update).toBeCalledWith(content)
      })

      test('adding definition ID', async () => {
        const idx = new IDX({ ceramic: { did: { id: 'did' } } } as any)
        idx._indexProxy = { get: (): Promise<any> => Promise.resolve(null) } as any

        const definition = { name: 'test', schema: 'ceramic://...' }
        const getDefinition = jest.fn(() => Promise.resolve(definition))
        idx.getDefinition = getDefinition as any
        const createRecord = jest.fn(() => Promise.resolve('streamId'))
        idx._createRecord = createRecord as any

        const content = { test: true }
        await expect(idx._setRecordOnly('defId', content, { pin: true })).resolves.toEqual([
          true,
          'streamId',
        ])
        expect(getDefinition).toBeCalledWith('defId')
        expect(createRecord).toBeCalledWith(definition, content, { pin: true })
      })
    })

    describe('_setRecord', () => {
      test('does not set the index key if it already exists', async () => {
        const idx = new IDX({} as any)
        const setRecord = jest.fn(() => Promise.resolve([false, 'streamId']))
        idx._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        idx._setReference = setReference

        const content = { test: true }
        await idx._setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, undefined)
        expect(setReference).not.toBeCalled()
      })

      test('adds the new index key', async () => {
        const idx = new IDX({} as any)
        const setRecord = jest.fn(() => Promise.resolve([true, 'streamId']))
        idx._setRecordOnly = setRecord as any
        const setReference = jest.fn()
        idx._setReference = setReference

        const content = { test: true }
        await idx._setRecord('defId', content)
        expect(setRecord).toBeCalledWith('defId', content, undefined)
        expect(setReference).toBeCalledWith('defId', 'streamId')
      })
    })

    describe('_createRecord', () => {
      test('creates the deterministic doc and updates it', async () => {
        const id = 'did:test:123'
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(jest.fn((_ceramic, _content, metadata, _opts) => {
          return Promise.resolve({ id: 'streamId', update, metadata })
        }))
        const ceramic = { did: { id }, pin: { add } }
        const idx = new IDX({ ceramic } as any)

        const definition = {
          id: { toString: () => 'defId' },
          name: 'test',
          schema: 'schemaId',
        } as any
        const content = { test: true }
        await expect(idx._createRecord(definition, content, { pin: true })).resolves.toBe('streamId')
        expect(TileDocument.create).toBeCalledWith(
          ceramic,
          null,
          { deterministic: true, controllers: [id], family: 'defId' },
          { anchor: false, publish: false }
        )
        expect(update).toBeCalledWith(content, { deterministic: true, controllers: [id], family: 'defId', schema: 'schemaId' })
        expect(add).toBeCalledWith('streamId')
      })

      test('pin by default', async () => {
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(jest.fn((_ceramic, _content, metadata) => {
          return Promise.resolve({ id: 'streamId', update, metadata })
        }))
        const idx = new IDX({
          ceramic: { did: { id: 'did:test:123' }, pin: { add } },
        } as any)

        await idx._createRecord({ id: { toString: () => 'defId' } } as any, {})
        expect(update).toBeCalled()
        expect(add).toBeCalledWith('streamId')
      })

      test('no pinning by setting instance option', async () => {
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(jest.fn((_ceramic, _content, metadata) => {
          return Promise.resolve({ id: 'streamId', update, metadata })
        }))
        const idx = new IDX({
          autopin: false,
          ceramic: { did: { id: 'did:test:123' }, pin: { add } },
        } as any)
        await idx._createRecord({ id: { toString: () => 'defId' } } as any, {})
        expect(update).toBeCalled()
        expect(add).not.toBeCalled()
      })

      test('explicit no pinning', async () => {
        const add = jest.fn()
        const update = jest.fn()
        TileDocument.create.mockImplementationOnce(jest.fn((_ceramic, _content, metadata) => {
          return Promise.resolve({ id: 'streamId', update, metadata })
        }))
        const idx = new IDX({
          autopin: true,
          ceramic: { did: { id: 'did:test:123' }, pin: { add } },
        } as any)
        await idx._createRecord({ id: { toString: () => 'defId' } } as any, {}, { pin: false })
        expect(update).toBeCalled()
        expect(add).not.toBeCalled()
      })
    })
  })

  describe('References methods', () => {
    describe('_getReference', () => {
      test('with provided DID', async () => {
        const getIndex = jest.fn(() => Promise.resolve(null))
        const idx = new IDX({} as any)
        idx.getIndex = getIndex
        await expect(idx._getReference('testId', 'did:test')).resolves.toBeNull()
        expect(getIndex).toBeCalledWith('did:test')
      })

      test('with authenticated DID', async () => {
        const getIndex = jest.fn(() => Promise.resolve({ testId: 'streamId' }))
        const idx = new IDX({ ceramic: { did: { id: 'did:3:test' } } } as any)
        idx.getIndex = getIndex
        await expect(idx._getReference('testId')).resolves.toBe('streamId')
        expect(getIndex).toBeCalledWith('did:3:test')
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
