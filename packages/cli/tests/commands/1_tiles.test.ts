import execa from 'execa'
import stripAnsi from 'strip-ansi'

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
    }, 20000)

    test('tile creation succeeds', async () => {
      const getKey = await execa('glaze', ['did:create'])
      const key = getKey.stderr.split('with seed ')[1]
      const { stderr } = await execa('glaze', [
        `tile:create`,
        `-b {"FOO":"BAR"}`,
        `--key=${stripAnsi(key)}`,
      ])
      // stderr.toString().split('Created stream ')[1].replace('.', '')

      expect(stderr.includes('Created stream ')).toBe(true)
    }, 20000)
  })
  describe('tile:content', () => {
    test('displays tile content', async () => {
      const key = await execa('glaze', ['did:create'])
      const tile = await execa('glaze', [
        `tile:create`,
        `-b {"FOO":"BAR"}`,
        `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
      ])

      const proc = await execa('glaze', [
        `tile:content`,
        tile.stderr.split('Created stream ')[1].replace('.', ''),
      ])

      const lines = stripAnsi(proc.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
    }, 20000)
  })
  describe('tile:update', () => {
    test('successfully updates tile', async () => {
      const key = await execa('glaze', ['did:create'])
      const tile = await execa('glaze', [
        `tile:create`,
        `-b {"FOO":"BAR"}`,
        `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
      ])

      const { stderr } = await execa('glaze', [
        'tile:update',
        tile.stderr.split('Created stream ')[1].replace('.', ''),
        '-b {"FOO":"BAZ"}',
        `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
      ])
      expect(stderr.toString().includes('Updated stream')).toBe(true)
    }, 20000)
  })
  describe('tile:deterministic', () => {
    test('does not create a deterministic tile.', async () => {
      const key = await execa('glaze', ['did:create'])

      const { stderr } = await execa('glaze', [
        'tile:deterministic',
        '{}',
        `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
      ])
      expect(
        stderr
          .toString()
          .includes('Family and/or tags are required when creating a deterministic tile document')
      ).toBe(true)
    }, 20000)
    test('creates determinstic tile', async () => {
      const key = await execa('glaze', ['did:create'])

      const { stderr } = await execa('glaze', [
        'tile:deterministic',
        JSON.stringify({
          controllers: [stripAnsi(key.stderr.split('Created DID ')[1].split(' with seed ')[0])],
          tags: ['foo', 'bar'],
          family: ['test'],
        }),
        `--key=${stripAnsi(key.stderr.split('with seed ')[1])}`,
      ])
      expect(stderr.toString().includes('Loaded tile')).toBe(true)
    }, 20000)
  })
})
