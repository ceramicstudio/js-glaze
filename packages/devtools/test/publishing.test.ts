/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */

import StreamID from '@ceramicnetwork/streamid'

import { createTile, publishCommits } from '../src'

import { TileDocument } from '@ceramicnetwork/stream-tile'
jest.mock('@ceramicnetwork/stream-tile')

describe('publishing', () => {
  const testID = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
  const testDocID = StreamID.fromString(testID)
  const testDoc = {
    id: testDocID,
    commitId: StreamID.fromString(
      'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60t'
    ),
  }

  describe('createTile', () => {
    test('throw an error if the Ceramic instance is not authenticated', async () => {
      await expect(createTile({} as any, {})).rejects.toThrow(
        'Ceramic instance is not authenticated'
      )
    })

    test('sets the authenticated DID as controllers if not set in metadata', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      TileDocument.create.mockImplementationOnce(jest.fn(() => Promise.resolve({ id: testDocID })))
      const pinAdd = jest.fn(() => Promise.resolve())
      const ceramic = { did: { id: 'did:test:123' }, pin: { add: pinAdd } } as any

      await createTile(ceramic, { hello: 'test' }, { schema: testID })
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(TileDocument.create).toBeCalledWith(
        ceramic,
        { hello: 'test' },
        { controllers: ['did:test:123'], schema: testID }
      )
      expect(pinAdd).toBeCalledWith(testDocID)
    })

    test('sets the provided controllers', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      TileDocument.create.mockImplementationOnce(jest.fn(() => Promise.resolve({ id: testDocID })))
      const pinAdd = jest.fn()
      const ceramic = { did: { id: 'did:test:123' }, pin: { add: pinAdd } } as any

      await createTile(ceramic, { hello: 'test' }, { controllers: ['did:test:456'] })
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(TileDocument.create).toBeCalledWith(
        ceramic,
        { hello: 'test' },
        { controllers: ['did:test:456'] }
      )
    })
  })

  test('publishCommits', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    TileDocument.createFromGenesis.mockImplementationOnce(jest.fn(() => Promise.resolve(testDoc)))
    const applyCommit = jest.fn(() => Promise.resolve(testDoc))
    const pinAdd = jest.fn(() => Promise.resolve())
    const ceramic = {
      applyCommit,
      pin: { add: pinAdd },
    } as any

    const commits = [{ jws: {}, __genesis: true }, { jws: {} }, { jws: {} }]
    const opts = { anchor: false, publish: false }
    await expect(publishCommits(ceramic, commits as any)).resolves.toBe(testDoc)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TileDocument.createFromGenesis).toBeCalledWith(
      ceramic,
      { jws: {}, __genesis: true },
      opts
    )
    expect(pinAdd).toBeCalledWith(testDocID)
    expect(applyCommit).toBeCalledTimes(2)
    expect(applyCommit).toBeCalledWith(testDocID, { jws: {} }, opts)
  })
})
