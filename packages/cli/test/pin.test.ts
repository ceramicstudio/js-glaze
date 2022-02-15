import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('pins', () => {
  test('stream is pinned', async () => {
    const key = await execa('glaze', ['did:create'])
    const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

    const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
    const pin = await execa('glaze', [
      'pin:add',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
    ])
    expect(pin.stderr.toString().includes('Stream pinned.')).toBe(true)
  }, 25000)

  test('stream removed', async () => {
    const key = await execa('glaze', ['did:create'])
    const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

    const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
    await execa('glaze', ['pin:add', tile.stderr.split('Created stream ')[1].replace('.', '')])

    const remove = await execa('glaze', [
      'pin:rm',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
    ])
    expect(remove.stderr.toString().includes('Stream unpinned')).toBe(true)
  }, 25000)

  test('list pins', async () => {
    const key = await execa('glaze', ['did:create'])
    const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

    const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
    await execa('glaze', ['pin:add', tile.stderr.split('Created stream ')[1].replace('.', '')])

    const list = await execa('glaze', [
      'pin:ls',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
    ])
    expect(list.stderr.toString().includes('Loaded pins list.')).toBe(true)
  }, 35000)
})
