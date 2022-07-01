import { execa } from 'execa'
import stripAnsi from 'strip-ansi'

const MY_MODEL_JSON =
  '{"name":"MyModel","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

const MODEL_INSTANCE_JSON = '{"stringPropName":"stringPropValue"}'

const REPLACED_MODEL_INSTANCE_JSON = '{"stringPropName":"updatedStringPropValue"}'

describe('model-instances', () => {
  let didSeed: string
  let modelStreamID: string

  beforeAll(async () => {
    const key = await execa('glaze', ['did:create'])
    didSeed = stripAnsi(key.stderr.toString().split('with seed ')[1])

    const create = await execa('glaze', ['model:create', MY_MODEL_JSON, `--key=${didSeed}`])
    modelStreamID = create.stderr.toString().split('Created MyModel with streamID ')[1]
  }, 60000)

  describe('model-instance:create', () => {
    test('model instance creation fails without the content param', async () => {
      await expect(execa('glaze', ['model-instance:create'])).rejects.toThrow(
        /Content of the created model instance \(JSON encoded as string\)/
      )
    }, 60000)

    test('model instance creation fails without the model param', async () => {
      await expect(execa('glaze', ['model-instance:create'])).rejects.toThrow(
        /StreamID of the model whose instance is being created/
      )
    }, 60000)

    test('model instance creation fails without the did-key param', async () => {
      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
      ])
      const lines = create.stderr.toString().split('\n')
      expect(
        lines[1].includes(
          'DID is not authenticated, make sure to provide a seed using the "did-key"'
        )
      ).toBe(true)
    }, 60000)

    test('model instance creation succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        `--key=${seed}`,
      ])
      expect(create.stderr.toString().includes('Created model instance with stream id:')).toBe(true)
    }, 60000)
  })

  describe('model-instance:replace', () => {
    let midControllerSeed: string
    let midStreamID: string

    beforeAll(async () => {
      const key = await execa('glaze', ['did:create'])
      midControllerSeed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        `--key=${midControllerSeed}`,
      ])
      midStreamID = create.stderr.toString().split('Created model instance with stream id: ')[1]
    }, 60000)

    test('model instance replace fails without the streamID', async () => {
      await expect(execa('glaze', ['model-instance:replace'])).rejects.toThrow(
        /streamId {2}ID of the stream/
      )
    }, 60000)

    test('model instance replace fails without the content param', async () => {
      await expect(execa('glaze', ['model-instance:replace'])).rejects.toThrow(
        /New content of the model instance \(JSON encoded as string\)/
      )
    }, 60000)

    test('model instance replace fails without the did-key param', async () => {
      const replace = await execa('glaze', [
        'model-instance:replace',
        midStreamID,
        REPLACED_MODEL_INSTANCE_JSON,
      ])
      const lines = replace.stderr.toString().split('\n')
      expect(lines[1].includes('No DID provided')).toBe(true)
    }, 60000)

    test('model instance replace succeeds', async () => {
      const replace = await execa('glaze', [
        'model-instance:replace',
        midStreamID,
        REPLACED_MODEL_INSTANCE_JSON,
        `--key=${midControllerSeed}`,
      ])

      expect(
        replace.stderr.toString().includes('Replaced content in model instance with stream id:')
      ).toBe(true)
    }, 60000)
  })

  describe('model-instance:content', () => {
    test('model instance content display fails without the streamID', async () => {
      await expect(execa('glaze', ['model-instance:content'])).rejects.toThrow(
        /streamId {2}ID of the stream/
      )
    }, 60000)

    test('model instance content display succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        `--key=${seed}`,
      ])

      const content = await execa('glaze', [
        `model-instance:content`,
        create.stderr.toString().split('with stream id: ')[1].replace('.', ''),
        `--sync=sync-always`,
      ])
      expect(content.stdout.toString().includes('"stringPropName":"stringPropValue"')).toBe(true)
    }, 60000)
  })
})