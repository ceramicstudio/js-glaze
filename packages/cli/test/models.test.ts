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

      const create = await execa('glaze', ['model:create', MY_MODEL_JSON, `--key=${seed}`])
      expect(create.stderr.toString().includes('Created MyModel with streamID')).toBe(true)
    }, 60000)
  })

  describe('model:content', () => {
    test('model content display fails without the streamID', async () => {
      await expect(execa('glaze', ['model:content'])).rejects.toThrow(
        /streamId {2}ID of the stream/
      )
    }, 60000)

    test('model content display succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', ['model:create', MY_MODEL_JSON, `--key=${seed}`])

      const content = await execa('glaze', [
        `model:content`,
        create.stderr.toString().split('with streamID ')[1].replace('.', ''),
        `--sync=sync-always`,
      ])
      const lines = stripAnsi(content.stderr.toString())
      expect(lines.includes('"name":"MyModel"')).toBe(true)
      expect(lines.includes('"schema":{')).toBe(true)
      expect(lines.includes('"type":"object",')).toBe(true)
      expect(lines.includes('"properties":{')).toBe(true)
      expect(lines.includes('"accountRelation":"list"')).toBe(true)
      expect(lines.includes('"$schema":"https://json-schema.org/draft/2020-12/schema",')).toBe(
        true
      )
    }, 60000)
  })

  describe('model:controller', () => {
    test('model controller display fails without the streamID', async () => {
      await expect(execa('glaze', ['model:controller'])).rejects.toThrow(
        /streamId {2}ID of the stream/
      )
    }, 60000)

    test('model controller display succeeds', async () => {
      const key = await execa('glaze', ['did:create'])
      const did = stripAnsi(key.stderr.toString().split('with seed ')[0])
        .split('Created DID ')[1]
        .replace(' ', '')
      const seed = stripAnsi(key.stderr.toString().split('with seed ')[1])

      const create = await execa('glaze', ['model:create', MY_MODEL_JSON, `--key=${seed}`])

      const controller = await execa('glaze', [
        `model:controller`,
        create.stderr.toString().split('with streamID ')[1].replace('.', ''),
        `--sync=sync-always`,
      ])

      expect(controller.stderr.toString().split("It's controller is ")[1]).toEqual(did)
    }, 60000)
  })
})
