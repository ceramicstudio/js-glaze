import { execa } from 'execa'

const MY_MODEL_JSON =
  '{"name":"MyModel","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

const MODEL_INSTANCE_JSON = '{"stringPropName":"stringPropValue"}'

const REPLACED_MODEL_INSTANCE_JSON = '{"stringPropName":"updatedStringPropValue"}'

describe('model-instances', () => {
  const modelAccountSeed = '476e1fd8124d0c09f0b764b396bfcbf43e8817b2e81a131f88f4bdd35fbdb8b8'
  const midAccountSeed = '5c51566adf1d050e3048dd79be47c256925f0ea4232084cf064836e68f8316e5'
  let modelStreamID: string

  beforeAll(async () => {
    const create = await execa('glaze', [
      'model:create',
      MY_MODEL_JSON,
      `--did-key-seed=${modelAccountSeed}`,
      '--disable-stdin',
    ])
    modelStreamID = create.stdout.toString().trim()
  }, 60000)

  describe('model-instance:create', () => {
    test('model instance creation fails without the content param', async () => {
      await expect(execa('glaze', ['model-instance:create', '--disable-stdin'])).rejects.toThrow(
        /Content of the created model instance \(JSON encoded as string\)/
      )
    }, 60000)

    test('model instance creation fails without the model param', async () => {
      await expect(execa('glaze', ['model-instance:create', '--disable-stdin'])).rejects.toThrow(
        /StreamID of the model whose instance is being created/
      )
    }, 60000)

    test('model instance creation fails without the did-key param', async () => {
      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        '--disable-stdin',
      ])
      const lines = create.stderr.toString().split('\n')
      expect(
        lines[1].includes(
          'DID is not authenticated, make sure to provide a seed using the "did-key-seed" flag'
        )
      ).toBe(true)
    }, 60000)

    test('model instance creation succeeds', async () => {
      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        `--did-key-seed=${modelAccountSeed}`,
        '--disable-stdin',
      ])
      expect(
        create.stderr
          .toString()
          .includes("Creating the model instance... Done!")
      ).toBe(true)
    }, 60000)
  })

  describe('model-instance:replace', () => {
    let midStreamID: string

    beforeAll(async () => {
      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        `--did-key-seed=${midAccountSeed}`,
        '--disable-stdin',
      ])
      midStreamID = create.stdout.toString().trim()
    }, 60000)

    test('model instance replace fails without the streamID', async () => {
      await expect(execa('glaze', ['model-instance:replace', '--disable-stdin'])).rejects.toThrow(
        /streamId {2}ID of the stream/
      )
    }, 60000)

    test('model instance replace fails without the content param', async () => {
      await expect(execa('glaze', ['model-instance:replace', '--disable-stdin'])).rejects.toThrow(
        /New content of the model instance \(JSON encoded as string\)/
      )
    }, 60000)

    test('model instance replace fails without the did-key param', async () => {
      const replace = await execa('glaze', [
        'model-instance:replace',
        midStreamID,
        REPLACED_MODEL_INSTANCE_JSON,
        '--disable-stdin',
      ])
      expect(replace.stderr.toString().includes('No DID provided')).toBe(true)
    }, 60000)

    test('model instance replace succeeds', async () => {
      const replace = await execa('glaze', [
        'model-instance:replace',
        midStreamID,
        REPLACED_MODEL_INSTANCE_JSON,
        `--did-key-seed=${midAccountSeed}`,
        '--disable-stdin',
      ])
      expect(
        replace.stderr.toString().includes('Replacing content in the model instance... Done!')
      ).toBe(true)
    }, 60000)
  })

  describe('model-instance:content', () => {
    test('model instance content display fails without the streamID', async () => {
      await expect(execa('glaze', ['model-instance:content', '--disable-stdin'])).rejects.toThrow(
        /streamId {2}ID of the stream/
      )
    }, 60000)

    test('model instance content display succeeds', async () => {
      const create = await execa('glaze', [
        'model-instance:create',
        modelStreamID,
        MODEL_INSTANCE_JSON,
        `--did-key-seed=${midAccountSeed}`,
        '--disable-stdin',
      ])

      const content = await execa('glaze', [
        `model-instance:content`,
        create.stdout.toString().trim(),
        `--sync=sync-always`,
        '--disable-stdin',
      ])
      expect(content.stdout.toString().includes('"stringPropName":"stringPropValue"')).toBe(true)
    }, 60000)
  })
})
