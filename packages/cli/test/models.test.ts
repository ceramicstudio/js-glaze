import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

const MY_MODEL_JSON =
  '{"name":"MyModel","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

describe('models', () => {
  describe('model:create', () => {
    test('model creation fails without the content param', async () => {
      await expect(execa('glaze', ['model:create'])).rejects.toThrow(
        /Model content \(JSON encoded as string\)/
      )
    }, 60000)

    test('model creation fails without the did-key param', async () => {
      const create = await execa('glaze', ['model:create', MY_MODEL_JSON])
      const lines = create.stderr.toString().split('\n')
      expect(
        lines[1].includes(
          'DID is not authenticated, make sure to provide a seed using the "did-key"'
        )
      ).toBe(true)
    }, 60000)

    test('model creation succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'model:create',
        MY_MODEL_JSON,
        `--key=${seed}`,
      ])
      console.log(create.stderr.toString())

      expect(create.stderr.toString().includes('Created MyModel with streamID')).toBe(true)
    }, 60000)
  })
})
