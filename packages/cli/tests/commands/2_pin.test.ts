import execa from 'execa'
import stripAnsi from 'strip-ansi'

describe('pins', () => {
  test('stream is pinned', async () => {
    const key = await execa('glaze', ['did:create'])
    const tile = await execa('glaze', [
      `tile:create`,
      `-b {"FOO":"BAR"}`,
      `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
    ])

    const { stderr } = await execa('glaze', [
      'pin:add',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
    ])
    expect(stderr.toString().includes('Stream pinned.')).toBe(true)
  }, 25000)
  test('stream removed', async () => {
    const key = await execa('glaze', ['did:create'])
    const tile = await execa('glaze', [
      `tile:create`,
      `-b {"FOO":"BAR"}`,
      `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
    ])
    await execa('glaze', ['pin:add', tile.stderr.split('Created stream ')[1].replace('.', '')])
    const { stderr } = await execa('glaze', [
      'pin:rm',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
    ])
    expect(stderr.toString().includes('Stream unpinned')).toBe(true)
  }, 25000)
  test('list pins', async () => {
    const key = await execa('glaze', ['did:create'])
    const tile = await execa('glaze', [
      `tile:create`,
      `-b {"FOO":"BAR"}`,
      `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
    ])
    await execa('glaze', ['pin:add', tile.stderr.split('Created stream ')[1].replace('.', '')])
    const { stderr } = await execa('glaze', [
      'pin:ls',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
    ])
    expect(stderr.toString().includes('Loaded pins list.')).toBe(true)
  }, 25000)
})
