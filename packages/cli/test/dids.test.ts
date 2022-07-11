import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('dids', () => {
  describe('did:generate-seed', () => {
    test('seed generation succeeds', async () => {
      const generate = await execa('glaze', ['did:generate-seed', '--disable-stdin'])
      const seed = stripAnsi(generate.stdout.toString())
      expect(seed.length).toEqual(64)
    }, 60000)
  })
  describe('did:from-seed', () => {
    const seed = '4697f122007a464d660df661690a5c7c4a496be24f794c17634bf7c40c01570c'

    test('did creation fails without a seed', async () => {
      const create = await execa('glaze', ['did:from-seed', '--disable-stdin'])
      expect(
        create.stderr
          .toString()
          .includes(
            'You need to pass the seed parameter as a positional arg, as a flag value, via stdin or as the DID_KEY_SEED environmental variable'
          )
      ).toBe(true)
    }, 60000)

    test('did creation fails when seed past as both an arn and a flag value', async () => {
      const create = await execa('glaze', [
        'did:from-seed',
        seed,
        '--did-key-seed',
        seed,
        '--disable-stdin',
      ])
      expect(
        create.stderr
          .toString()
          .includes(
            "Don't pass the seed parameter in more than one way out of: arg, flag, stdin, DID_KEY_SEED environmental variable"
          )
      ).toBe(true)
    }, 60000)

    test('did creation succeeds with seed as positional argument', async () => {
      const create = await execa('glaze', ['did:from-seed', seed, '--disable-stdin'])
      const lines = stripAnsi(create.stderr.toString()).split('\n')
      expect(
        lines[1].includes('Created DID did:key:z6MkmgGP9QZuAV76Dwz2mnsX71HknLjNmw4E8wmwCYoZdX4b')
      ).toBe(true)
    }, 60000)

    test('did creation succeeds with seed as flag argument', async () => {
      const create = await execa('glaze', [
        'did:from-seed',
        '--did-key-seed',
        seed,
        '--disable-stdin',
      ])
      const lines = stripAnsi(create.stderr.toString()).split('\n')
      expect(
        lines[2].includes('Created DID did:key:z6MkmgGP9QZuAV76Dwz2mnsX71HknLjNmw4E8wmwCYoZdX4b')
      ).toBe(true)
    }, 60000)
  })
})
