import execa from 'execa'
import stripAnsi from 'strip-ansi'

describe('pins', () => {
  let tileId: string
  let authKey: string
  beforeAll(async () => {
    const createDid = await execa('glaze', ['did:create'])
    authKey = stripAnsi(createDid.stderr.split('with seed ')[1])

    const createTile = await execa('glaze', [`tile:create`, `-b {"FOO":"BAR"}`, `--key=${authKey}`])

    tileId = createTile.stderr.toString().split('Created stream ')[1].replace('.', '')
  }, 10000)
  test('stream is pinned', async () => {
    const { stderr } = await execa('glaze', ['pin:add', tileId])
    expect(stderr.toString().includes('Stream pinned.')).toBe(true)
  }, 10000)
  test('stream removed', async () => {
    const { stderr } = await execa('glaze', ['pin:rm', tileId])
    expect(stderr.toString().includes('Stream unpinned')).toBe(true)
  }, 10000)
  test('list pins', async () => {
    const { stderr } = await execa('glaze', ['pin:ls', tileId])
    expect(stderr.toString().includes('Loaded pins list.')).toBe(true)
  }, 20000)
})
