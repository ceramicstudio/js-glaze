import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

const MODEL1_JSON =
  '{"name":"Model1","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

const MODEL2_JSON =
  '{"name":"Model2","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

describe('composites', () => {
  describe('composite:create', () => {
    test('composite creation fails without the schemaFilePath param', async () => {
      await expect(execa('glaze', ['composite:create'])).rejects.toThrow(
        RegExp('schemaFilePath {2}A graphQL SDL definition of the Composite encoded as a')
      )
    }, 60000)

    test('composite creation fails without the did-key param', async () => {
      const create = await execa('glaze', ['composite:create', 'test/mocks/composite.schema'])
      const lines = create.stderr.toString().split('\n')
      expect(lines[1].includes('No controller specified')).toBe(true)
    }, 60000)

    test('composite creation succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'composite:create',
        'test/mocks/composite.schema',
        `--key=${seed}`,
      ])
      expect(create.stderr.toString().includes('"version": "1.0",')).toBe(true)
      expect(create.stderr.toString().includes('"aliases":')).toBe(true)
      expect(create.stderr.toString().includes('"views":')).toBe(true)
    }, 60000)
  })

  describe('composite:from-model', () => {
    let model1StreamID: string
    let model2StreamID: string

    beforeAll(async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const model1Create = await execa('glaze', ['model:create', MODEL1_JSON, `--key=${seed}`])
      const model2Create = await execa('glaze', ['model:create', MODEL2_JSON, `--key=${seed}`])
      model1StreamID = model1Create.stderr.toString().split('with streamID ')[1]
      model2StreamID = model2Create.stderr.toString().split('with streamID ')[1]
    })

    test('composite from model fails without the list of models', async () => {
      const create = await execa('glaze', ['composite:from-model'])
      expect(create.stderr.toString().includes('Missing list of model streamIDs')).toBe(true)
    })

    test('composite from model succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'composite:from-model',
        model1StreamID,
        model2StreamID,
        `--key=${seed}`,
      ])
      expect(create.stderr.toString().includes('"version": "1.0",')).toBe(true)
      expect(create.stderr.toString().includes('"aliases":')).toBe(true)
      expect(create.stderr.toString().includes('"views":')).toBe(true)
      expect(create.stderr.toString().includes(model1StreamID)).toBe(true)
      expect(create.stderr.toString().includes(model2StreamID)).toBe(true)
    }, 60000)
  })
})
