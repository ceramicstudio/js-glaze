import execa from 'execa'
import stripAnsi from 'strip-ansi'

describe('streams', () => {
  let tileId: string
  let authKey: string
  beforeAll(async () => {
    const createDid = await execa('glaze', ['did:create'])
    authKey = stripAnsi(createDid.stderr.split('with seed ')[1])

    const createTile = await execa('glaze', [`tile:create`, `-b {"FOO":"BAR"}`, `--key=${authKey}`])

    tileId = createTile.stderr.toString().split('Created stream ')[1].replace('.', '')
  }, 20000)
  test('lists stream commits', async () => {
    const { stderr } = await execa('glaze', ['stream:commits', tileId])
    expect(stderr.toString().includes('Stream commits loaded.')).toBe(true)
  }, 10000)
  test('displays stream state', async () => {
    const { stderr } = await execa('glaze', ['stream:state', tileId])
    expect(stderr.toString().includes(`Successfully queried stream ${tileId}`)).toBe(true)
  }, 10000)
})
