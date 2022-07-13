import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('dids', () => {
  describe('did:generate-private-key', () => {
    test('private key generation succeeds', async () => {
      const generate = await execa('glaze', ['did:generate-private-key'])
      const seed = stripAnsi(generate.stdout.toString())
      expect(seed.length).toEqual(64)
    }, 60000)
  })
  describe('did:from-private-key', () => {
    const seed = '4697f122007a464d660df661690a5c7c4a496be24f794c17634bf7c40c01570c'

    test('did creation fails without a private key', async () => {
      const create = await execa('glaze', ['did:from-private-key'])
      expect(
        create.stderr
          .toString()
          .includes(
            'You need to pass the private key parameter as a positional arg, as a flag value, via stdin or as the DID_PRIVATE_KEY environmental variable'
          )
      ).toBe(true)
    }, 60000)

    test('did creation fails when private key passed as both an arn and a flag value', async () => {
      const create = await execa('glaze', [
        'did:from-private-key',
        seed,
        '--did-private-key',
        seed,
      ])
      expect(
        create.stderr
          .toString()
          .includes(
            "Don't pass the private key parameter in more than one way out of: arg, flag, stdin, DID_PRIVATE_KEY environmental variable"
          )
      ).toBe(true)
    }, 60000)

    test('did creation succeeds with private key as positional argument', async () => {
      const create = await execa('glaze', ['did:from-private-key', seed])
      expect(stripAnsi(create.stderr.toString()).includes('Creating DID... Done!')).toBe(true)
    }, 60000)

    test('did creation succeeds with private key as flag argument', async () => {
      const create = await execa('glaze', ['did:from-private-key', '--did-private-key', seed])
      expect(stripAnsi(create.stderr.toString()).includes('Creating DID... Done!')).toBe(true)
    }, 60000)
  })
})
