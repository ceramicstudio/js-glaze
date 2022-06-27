import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('dids', () => {
  describe('did:generate-seed', () => {
    test('seed generation succeeds', async () => {
      const generate = await execa('glaze', ['did:generate-seed'])
      expect(generate.stderr.toString().includes('New random seed: ')).toBe(true)
      const seed = stripAnsi(generate.stderr.toString().split('New random seed: ')[1])
      expect(seed.length).toEqual(64)
    }, 60000)
  })
})
