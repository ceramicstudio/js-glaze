import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('streams', () => {
  test('lists stream commits', async () => {
    const key = await execa('glaze', ['did:create'])
    const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

    const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
    const commits = await execa('glaze', [
      'stream:commits',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
    ])
    expect(commits.stderr.toString().includes('Stream commits loaded.')).toBe(true)
  }, 60000)

  test('displays stream state', async () => {
    const key = await execa('glaze', ['did:create'])
    const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

    const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
    const tileOutput = tile.stderr.toString()

    const state = await execa('glaze', [
      'stream:state',
      tileOutput.split('Created stream ')[1].replace('.', ''),
    ])
    const stateOutput = state.stderr.toString()
    expect(
      stateOutput.includes(
        `Successfully queried stream ${tileOutput.split('Created stream ')[1].replace('.', '')}`
      )
    ).toBe(true)
  }, 60000)
})
