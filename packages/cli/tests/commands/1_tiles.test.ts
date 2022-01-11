import execa from 'execa'
import stripAnsi from 'strip-ansi'

let tileId: string
let authKey: string
let authDID: string
describe('tiles', () => {
  describe('tile:create', () => {
    test('tile creation fails', async () => {
      const proc = await execa('glaze', ['tile:create'])
      const lines = proc.stderr.split('\n')

      expect(
        lines[1].includes(
          'DID is not authenticated, make sure to provide a seed using the "did-key"'
        )
      ).toBe(true)
    }, 10000)

    test('tile creation succeeds', async () => {
      const getKey = await execa('glaze', ['did:create'])
      const key = getKey.stderr.split('with seed ')[1]
      authKey = stripAnsi(key)
      authDID = stripAnsi(getKey.stderr.split('Created DID ')[1].split(' with seed ')[0])
      const { stderr } = await execa('glaze', [
        `tile:create`,
        `-b {"FOO":"BAR"}`,
        `--key=${stripAnsi(key)}`,
      ])
      // tileId = lines.split('Created stream ')[1]
      tileId = stderr.toString().split('Created stream ')[1].replace('.', '')

      expect(stderr.includes('Created stream ')).toBe(true)
    }, 10000)
  })
  describe('tile:content', () => {
    test('displays tile content', async () => {
      const proc = await execa('glaze', [`tile:content`, tileId])
      const lines = stripAnsi(proc.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
    }, 10000)
  })
  describe('tile:update', () => {
    test('successfully updates tile', async () => {
      const { stderr } = await execa('glaze', [
        'tile:update',
        tileId,
        '-b {"FOO":"BAZ"}',
        `--key=${authKey}`,
      ])
      expect(stderr.toString().includes('Updated stream')).toBe(true)
    }, 10000)
  })
  describe('tile:deterministic', () => {
    test('does not create a deterministic tile.', async () => {
      const { stderr } = await execa('glaze', ['tile:deterministic', '{}', `--key=${authKey}`])
      expect(
        stderr
          .toString()
          .includes('Family and/or tags are required when creating a deterministic tile document')
      )
    }, 10000)
    test('creates determinstic tile', async () => {
      const { stderr } = await execa('glaze', [
        'tile:deterministic',
        JSON.stringify({
          controllers: [authDID],
          tags: ['foo', 'bar'],
          family: ['test'],
        }),
        `--key=${authKey}`,
      ])
      expect(stderr.toString().includes('Created tile')).toBe(true)
    }, 10000)
  })
})
