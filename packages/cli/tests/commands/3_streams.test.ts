import execa from 'execa'
import stripAnsi from 'strip-ansi'

describe('streams', () => {
  test('lists stream commits', async () => {
    const key = await execa('glaze', ['did:create'])
    const tile = await execa('glaze', [
      `tile:create`,
      `-b {"FOO":"BAR"}`,
      `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
    ])

    const { stderr } = await execa('glaze', [
      'stream:commits',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
    ])
    expect(stderr.toString().includes('Stream commits loaded.')).toBe(true)
  }, 10000)
  test('displays stream state', async () => {
    const key = await execa('glaze', ['did:create'])
    const tile = await execa('glaze', [
      `tile:create`,
      `-b {"FOO":"BAR"}`,
      `--key=${stripAnsi(stripAnsi(key.stderr.split('with seed ')[1]))}`,
    ])

    const { stderr } = await execa('glaze', [
      'stream:state',
      tile.stderr.split('Created stream ')[1].replace('.', ''),
    ])
    expect(
      stderr
        .toString()
        .includes(
          `Successfully queried stream ${tile.stderr.split('Created stream ')[1].replace('.', '')}`
        )
    ).toBe(true)
  }, 10000)
})
