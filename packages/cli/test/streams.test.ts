import { execa } from 'execa'

describe('streams', () => {
  const seed = '062cfec570dbf9b6edfa17ab89b0cb61d6b88d4234796a95f7a1f5c29087187d'

  test('lists stream commits', async () => {
    const tile = await execa('glaze', [`tile:create`, `--content={"FOO":"BAR"}`, `--key=${seed}`])
    const commits = await execa('glaze', [
      'stream:commits',
      tile.stderr.toString().split('Created stream ')[1].replace('.', ''),
    ])
    expect(commits.stderr.toString().includes('Stream commits loaded.')).toBe(true)
  }, 60000)

  test('displays stream state', async () => {
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
