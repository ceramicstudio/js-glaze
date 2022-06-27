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
  describe('did:from-seed', () => {
    const seed = '4697f122007a464d660df661690a5c7c4a496be24f794c17634bf7c40c01570c'

    test('did creation fails without a seed', async () => {
      const create = await execa('glaze', ['did:from-seed'])
      expect(
        create.stderr
          .toString()
          .includes(
            'You need to pass the seed parameter either as a positional arg or as a flag value'
          )
      ).toBe(true)
    }, 60000)

    test('did creation fails when seed past as both an arn and a flag value', async () => {
      const create = await execa('glaze', ['did:from-seed', seed, '--did-key-seed', seed])
      expect(
        create.stderr
          .toString()
          .includes("Don't pass the seed parameter as both a positional arg and as a flag value")
      ).toBe(true)
    }, 60000)

    test('did creation succeeds with seed as positional argument', async () => {
      const create = await execa('glaze', ['did:from-seed', seed])
      const lines = stripAnsi(create.stderr.toString()).split('\n')
      expect(
        lines[1].includes('Created DID did:key:z6MkmgGP9QZuAV76Dwz2mnsX71HknLjNmw4E8wmwCYoZdX4b')
      ).toBe(true)
    }, 60000)

    test('did creation succeeds with seed as flag argument', async () => {
      const create = await execa('glaze', ['did:from-seed', '--did-key-seed', seed])
      const lines = stripAnsi(create.stderr.toString()).split('\n')
      expect(
        lines[1].includes('Created DID did:key:z6MkmgGP9QZuAV76Dwz2mnsX71HknLjNmw4E8wmwCYoZdX4b')
      ).toBe(true)
    }, 60000)
  })
})
