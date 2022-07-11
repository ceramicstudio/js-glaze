import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('tiles', () => {
  const seed = 'e3bf5acd1f5f9ec004757ff22a47e4c07c8ef396a8cc81b4ade2f5664aca39d4'

  describe('tile:create', () => {
    test('tile creation fails', async () => {
      const create = await execa('glaze', ['tile:create', '--disable-stdin'])
      const lines = create.stderr.toString().split('\n')

      expect(
        lines[1].includes(
          'DID is not authenticated, make sure to provide a seed using the "did-key-seed"'
        )
      ).toBe(true)
    }, 60000)

    test('tile creation succeeds', async () => {
      const create = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      expect(create.stderr.toString().includes('Created stream ')).toBe(true)
    }, 60000)
  })

  describe('tile:content', () => {
    test('displays tile content with syncing option argument', async () => {
      const tile = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      const content = await execa('glaze', [
        `tile:content`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
        `--sync=sync-always`,
        '--disable-stdin',
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
    }, 60000)

    test('displays tile content without syncing option argument', async () => {
      const tile = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
        '--disable-stdin',
      ])
      const content = await execa('glaze', [
        `tile:content`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
        '--disable-stdin',
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
      expect(lines.includes('Syncing option chosen')).toBe(false)
    }, 60000)

    test('fails when unsupported syncing option is passed', async () => {
      const tile = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      await expect(
        execa('glaze', [
          `tile:content`,
          tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
          `--sync=unsupportedArgument`,
          '--disable-stdin',
        ])
      ).rejects.toThrow('Expected --sync=unsupportedArgument to be one of:')
    }, 60000)
  })

  describe('tile:show', () => {
    test('displays tile content with syncing option argument', async () => {
      const tile = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      const content = await execa('glaze', [
        `tile:show`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
        `--sync=never-sync`,
        '--disable-stdin',
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
    }, 60000)

    test('displays tile content without syncing option argument', async () => {
      const tile = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      const content = await execa('glaze', [
        `tile:show`,
        tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
        '--disable-stdin',
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('Retrieved details of stream')).toBe(true)
      expect(lines.includes('Syncing option chosen')).toBe(false)
    }, 60000)

    test('fails when unsupported syncing option is passed', async () => {
      const tile = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      await expect(
        execa('glaze', [
          `tile:show`,
          tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
          `--sync=unsupportedArgument`,
          '--disable-stdin'
        ])
      ).rejects.toThrow('Expected --sync=unsupportedArgument to be one of:')
    }, 60000)
  })

  describe('tile:update', () => {
    test('successfully updates tile', async () => {
      const create = await execa('glaze', [
        `tile:create`,
        `--content={"FOO":"BAR"}`,
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      const update = await execa('glaze', [
        'tile:update',
        create.stderr.toString().split('Created stream ')[1].replace('.', ''),
        '--content={"FOO":"BAZ"}',
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      expect(update.stderr.toString().includes('Updated stream')).toBe(true)
    }, 60000)
  })

  describe('tile:deterministic', () => {
    const did = 'did:key:z6MknwirpC4SjiesG1p63ZbQ2D2yanpVxxqXUHdgnE4L4qQ5'

    test('does not create a deterministic tile', async () => {
      const tile = await execa('glaze', [
        'tile:deterministic',
        '{}',
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      expect(
        tile.stderr
          .toString()
          .includes('Family and/or tags are required when creating a deterministic tile document')
      ).toBe(true)
    }, 60000)

    test('creates deterministic tile with syncing option argument', async () => {
      const tile = await execa('glaze', [
        'tile:deterministic',
        JSON.stringify({
          controllers: [did],
          tags: ['foo', 'bar'],
          family: ['test'],
        }),
        `--did-key-seed=${seed}`,
        `--sync=never-sync`,
        '--disable-stdin',
      ])
      const stdOut = tile.stderr.toString()
      expect(stdOut.includes('Loaded tile')).toBe(true)
    }, 60000)

    test('creates deterministic tile without syncing option argument', async () => {
      const tile = await execa('glaze', [
        'tile:deterministic',
        JSON.stringify({
          controllers: [did],
          tags: ['foo', 'bar'],
          family: ['test'],
        }),
        `--did-key-seed=${seed}`,
        '--disable-stdin',
      ])
      const stdOut = tile.stderr.toString()
      expect(stdOut.includes('Loaded tile')).toBe(true)
      expect(stdOut.includes('Syncing option chosen:')).toBe(false)
    }, 60000)

    test('fails when unsupported syncing option is passed', async () => {
      await expect(
        execa('glaze', [
          'tile:deterministic',
          JSON.stringify({
            controllers: [did],
            tags: ['foo', 'bar'],
            family: ['test'],
          }),
          `--did-key-seed=${seed}`,
          `--sync=unsupportedArgument`,
          '--disable-stdin',
        ])
      ).rejects.toThrow('Expected --sync=unsupportedArgument to be one of:')
    }, 60000)
  })
})
