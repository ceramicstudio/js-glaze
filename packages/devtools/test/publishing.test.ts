/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */

import { TileDocument } from '@ceramicnetwork/stream-tile'
import { StreamID } from '@ceramicnetwork/streamid'

import { createModelDoc, publishCommits } from '../src'

const createTile = TileDocument.create as jest.MockedFunction<typeof TileDocument.create>
const createTileFromGenesis = TileDocument.createFromGenesis as jest.MockedFunction<
  typeof TileDocument.createFromGenesis
>

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

  test('createModelDoc', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    createTile.mockImplementationOnce(
      jest.fn(() => Promise.resolve({ id: testDocID } as unknown as TileDocument))
    )
    const pinAdd = jest.fn(() => Promise.resolve())
    const ceramic = { did: { id: 'did:test:123' }, pin: { add: pinAdd } } as any

    await createModelDoc(ceramic, { hello: 'test' }, { schema: testID })
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TileDocument.create).toBeCalledWith(
      ceramic,
      { hello: 'test' },
      { schema: testID },
      { anchor: false }
    )
    expect(pinAdd).toBeCalledWith(testDocID)
  })

  test('publishCommits', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    createTileFromGenesis.mockImplementationOnce(
      jest.fn(() => Promise.resolve(testDoc as unknown as TileDocument))
    )
    const applyCommit = jest.fn(() => Promise.resolve(testDoc))
    const pinAdd = jest.fn(() => Promise.resolve())
    const ceramic = {
      applyCommit,
      pin: { add: pinAdd },
    } as any

    const commits = [{ jws: {}, __genesis: true }, { jws: {} }, { jws: {} }]
    const opts = { anchor: false }
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
