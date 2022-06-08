import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

describe('composites', () => {
  describe('composite:create', () => {
    // test('tile creation fails without the schemaFilePath param', async () => {
    //   await expect(
    //     execa('glaze', ['composite:create',])
    //   ).rejects.toThrow(RegExp('schemaFilePath  A graphQL SDL definition of the Composite encoded as a'))
    // }, 60000)

    // test('tile creation fails without the did-key param', async () => {
    //   const create = await execa('glaze', [
    //     'composite:create',
    //     'test/mocks/composite.schema'
    //   ])
    //   const lines = create.stderr.toString().split('\n')
    //   expect(
    //     lines[1].includes(
    //       'DID is not authenticated, make sure to provide a seed using the "did-key"'
    //     )
    //   ).toBe(true)
    // }, 60000)

    test('composite creation succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'composite:create',
        'test/mocks/composite.schema',
        `--key=${seed}`,
      ])
      expect(create.stderr.toString().includes('Created')).toBe(true)
    }, 60000)
  })
})
