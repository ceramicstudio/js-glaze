import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('tiles', () => {
  describe('tile:create', () => {
    test('tile creation fails', async () => {
      const create = await execa('glaze', ['tile:create'])
      const lines = create.stderr.toString().split('\n')

      expect(
        lines[1].includes(
          'DID is not authenticated, make sure to provide a seed using the "did-key"'
        )
      ).toBe(true)
    }, 60000)

    test('tile creation succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--key=${seed}`,
      ])
      expect(create.stderr.toString().includes('Created stream ')).toBe(true)
    }, 60000)
  })

  describe('tile:content', () => {
    test('displays tile content with syncing option argument', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
      const content = await execa('glaze', [
        `tile:content`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
        `--sync=sync-always`,
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
    }, 60000)

    test('displays tile content without syncing option argument', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
      const content = await execa('glaze', [
        `tile:content`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
      expect(lines.includes('Syncing option chosen')).toBe(false)
    }, 60000)

    test('fails when unsupported syncing option is passed', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
      await expect(
        execa('glaze', [
          `tile:content`,
          tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
          `--sync=unsupportedArgument`,
        ])
      ).rejects.toThrow('Expected --sync=unsupportedArgument to be one of:')
    }, 60000)
  })

  describe('tile:show', () => {
    test('displays tile content with syncing option argument', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
      const content = await execa('glaze', [
        `tile:show`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
        `--sync=never-sync`,
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
    }, 60000)

    test('displays tile content without syncing option argument', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
      const content = await execa('glaze', [
        `tile:show`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
      expect(lines.includes('Syncing option chosen')).toBe(false)
    }, 60000)

    test('fails when unsupported syncing option is passed', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
      await expect(
        execa('glaze', [
          `tile:show`,
          tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
          `--sync=unsupportedArgument`,
        ])
      ).rejects.toThrow('Expected --sync=unsupportedArgument to be one of:')
    }, 60000)
  })

  describe('tile:update', () => {
    test('successfully updates tile', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--key=${seed}`,
      ])
      const update = await execa('glaze', [
        'tile:update',
        create.stderr.toString().split('Created stream ')[1].replace('.', ''),
        '--content={"FOO":"BAZ"}',
        `--key=${seed}`,
      ])
      expect(update.stderr.toString().includes('Updated stream')).toBe(true)
    }, 60000)
  })

  describe('tile:deterministic', () => {
    test('does not create a deterministic tile', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const tile = await execa('glaze', ['tile:deterministic', '{}', `--key=${seed}`])
      expect(
        tile.stderr
          .toString()
          .includes('Family and/or tags are required when creating a deterministic tile document')
      ).toBe(true)
    }, 60000)

    test('creates deterministic tile with syncing option argument', async () => {
      const key = await execa('glaze', ['did:create'])
      const [did, seed] = stripAnsi(key.stderr.split('Created DID ')[1]).split(' with seed ')

      const tile = await execa('glaze', [
        'tile:deterministic',
        JSON.stringify({
          controllers: [did],
          tags: ['foo', 'bar'],
          family: ['test'],
        }),
        `--key=${seed}`,
        `--sync=never-sync`,
      ])
      const stdOut = tile.stderr.toString()
      expect(stdOut.includes('Loaded tile')).toBe(true)
    }, 60000)

    test('creates deterministic tile without syncing option argument', async () => {
      const key = await execa('glaze', ['did:create'])
      const [did, seed] = stripAnsi(key.stderr.split('Created DID ')[1]).split(' with seed ')

      const tile = await execa('glaze', [
        'tile:deterministic',
        JSON.stringify({
          controllers: [did],
          tags: ['foo', 'bar'],
          family: ['test'],
        }),
        `--key=${seed}`,
      ])
      const stdOut = tile.stderr.toString()
      expect(stdOut.includes('Loaded tile')).toBe(true)
      expect(stdOut.includes('Syncing option chosen:')).toBe(false)
    }, 60000)

    test('fails when unsupported syncing option is passed', async () => {
      const key = await execa('glaze', ['did:create'])
      const [did, seed] = stripAnsi(key.stderr.split('Created DID ')[1]).split(' with seed ')

      await expect(
        execa('glaze', [
          'tile:deterministic',
          JSON.stringify({
            controllers: [did],
            tags: ['foo', 'bar'],
            family: ['test'],
          }),
          `--key=${seed}`,
          `--sync=unsupportedArgument`,
        ])
      ).rejects.toThrow('Expected --sync=unsupportedArgument to be one of:')
    }, 60000)
  })
})
