import { execa } from 'execa'

describe('pins', () => {
  const seed = '833b0a17492d5a9f0a8c08220877050c3d5ad5f0ea93acd062ed73d0346da63c'

  test('stream is pinned', async () => {
    const tile = await execa('glaze', [
      `tile:create`,
      `--content={"FOO":"BAR"}`,
      `--did-key-seed=${seed}`,
      '--disable-stdin',
    ])
    const pin = await execa('glaze', [
      'pin:add',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
      '--disable-stdin',
    ])
    expect(pin.stderr.toString().includes('Stream pinned.')).toBe(true)
  }, 60000)

  test('stream removed', async () => {
    const tile = await execa('glaze', [
      `tile:create`,
      `--content={"FOO":"BAR"}`,
      `--did-key-seed=${seed}`,
      '--disable-stdin',
    ])
    await execa('glaze', [
      'pin:add',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
      '--disable-stdin',
    ])

    const remove = await execa('glaze', [
      'pin:rm',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
      '--disable-stdin',
    ])
    expect(remove.stderr.toString().includes('Stream unpinned')).toBe(true)
  }, 60000)

  test('list pins', async () => {
    const tile = await execa('glaze', [
      `tile:create`,
      `--content={"FOO":"BAR"}`,
      `--did-key-seed=${seed}`,
      '--disable-stdin',
    ])
    await execa('glaze', [
      'pin:add',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
      '--disable-stdin',
    ])

    const list = await execa('glaze', [
      'pin:ls',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
      '--disable-stdin',
    ])
    expect(list.stderr.toString().includes('Loaded pins list.')).toBe(true)
  }, 60000)
})
