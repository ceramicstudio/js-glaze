import { execa } from 'execa'
import { Model } from '@ceramicnetwork/stream-model'
import { CeramicClient } from '@ceramicnetwork/http-client'
import undeployedComposite from './mocks/encoded.composite.undeployed.json'
import encodedProfilesComposite from './mocks/encoded.composite.profiles.json'
import { EncodedCompositeDefinition } from '@glazed/types'
import { Composite } from '@glazed/devtools'
import fs from 'fs-extra'
import stripAnsi from 'strip-ansi'

const MODEL1_JSON =
  '{"name":"Model1","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

const MODEL2_JSON =
  '{"name":"Model2","accountRelation":"list","schema":{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"stringPropName":{"type":"string","maxLength":80}},"additionalProperties":false,"required":["stringPropName"]}}'

describe('composites', () => {
  const seed = '3a6de55a5ef33d110a5a37438704b0f0cb77ca5977131775a70ffd1c23779c8c'

  describe('composite:create', () => {
    test('composite creation fails without the schemaFilePath param', async () => {
      await expect(execa('glaze', ['composite:create'])).rejects.toThrow(
        RegExp('schemaFilePath {2}A graphQL SDL definition of the Composite encoded as a')
      )
    }, 60000)

    test('composite creation fails without the did-key param', async () => {
      const create = await execa('glaze', [
        'composite:create',
        'test/mocks/composite.schema',
      ])

      expect(create.stderr.toString().includes('No controller specified')).toBe(true)
    }, 60000)

    test('composite creation succeeds', async () => {
      const create = await execa('glaze', [
        'composite:create',
        'test/mocks/composite.schema',
        `--did-key-seed=${seed}`,
      ])
      expect(create.stdout.toString().includes('"version":"1.0"')).toBe(true)
      expect(create.stdout.toString().includes('"aliases":')).toBe(true)
      expect(create.stdout.toString().includes('"views":')).toBe(true)
    }, 60000)
  })

  describe('composite:deploy', () => {
    const checkIfModelExist = async (
      ceramic: CeramicClient,
      modelStreamID: string
    ): Promise<boolean> => {
      let wasModelLoaded = false
      await Promise.race([
        new Promise((resolve) =>
          setTimeout(() => {
            resolve(true)
          }, 5000)
        ),
        Model.load(ceramic, modelStreamID).then((model) => {
          wasModelLoaded = true
          return model
        }),
      ])
      return wasModelLoaded
    }

    test('composite deployment fails without composite path param', async () => {
      const deploy = await execa('glaze', [
        'composite:deploy',
      ])
      expect(
        deploy.stderr
          .toString()
          .includes(
            `You need to pass the composite definition either in stdin or as the compositePath param`
          )
      ).toBe(true)
    }, 60000)

    test('composite deployment succeeds', async () => {
      const nonExistentModelStreamID = Object.keys(
        (undeployedComposite as EncodedCompositeDefinition).models
      )[0]
      const ceramic = new CeramicClient()
      const doesModelExist = await checkIfModelExist(ceramic, nonExistentModelStreamID)
      expect(doesModelExist).toBeFalsy()

      const deploy = await execa('glaze', [
        'composite:deploy',
        'test/mocks/encoded.composite.undeployed.json',
      ])
      expect(deploy.stderr.toString().includes(`Deploying the composite... Done!`)).toBe(true)

      expect(deploy.stdout.toString().includes(nonExistentModelStreamID))

      const doesModelExistNow = await checkIfModelExist(ceramic, nonExistentModelStreamID)
      expect(doesModelExistNow).toBeTruthy()
    }, 60000)
  })

  describe('composite:from-model', () => {
    let model1StreamID: string
    let model2StreamID: string

    beforeAll(async () => {
      const model1Create = await execa('glaze', [
        'model:create',
        MODEL1_JSON,
        `--did-key-seed=${seed}`,
      ])
      const model2Create = await execa('glaze', [
        'model:create',
        MODEL2_JSON,
        `--did-key-seed=${seed}`,
      ])
      model1StreamID = model1Create.stdout.toString().trim()
      model2StreamID = model2Create.stdout.toString().trim()
    }, 60000)

    test('composite from model fails without the list of models', async () => {
      const create = await execa('glaze', ['composite:from-model'])
      expect(create.stderr.toString().includes('Missing list of model streamIDs')).toBe(true)
    }, 60000)

    test('composite from model succeeds', async () => {
      const create = await execa('glaze', [
        'composite:from-model',
        model1StreamID,
        model2StreamID,
        `--did-key-seed=${seed}`,
      ])
      expect(create.stdout.toString().includes('"version":"1.0"')).toBe(true)
      expect(create.stdout.toString().includes('"aliases":')).toBe(true)
      expect(create.stdout.toString().includes('"views":')).toBe(true)
      expect(create.stdout.toString().includes(model1StreamID)).toBe(true)
      expect(create.stdout.toString().includes(model2StreamID)).toBe(true)
    }, 60000)
  })

  describe('composite:models', () => {
    test('composite model listing fails without composite path param', async () => {
      const models = await execa('glaze', ['composite:models'])
      expect(
        models.stderr
          .toString()
          .includes(
            'You need to pass a path to encoded composite either via an arg or through stdin'
          )
      ).toBe(true)
    }, 60000)

    test('composite model listing succeeds without formatting params', async () => {
      const models = await execa('glaze', [
        'composite:models',
        'test/mocks/encoded.composite.profiles.json',
      ])
      expect(models.stdout.toString()).toMatchSnapshot()
    }, 60000)

    test('composite model listing succeeds with --id-only param', async () => {
      const models = await execa('glaze', [
        'composite:models',
        'test/mocks/encoded.composite.profiles.json',
        '--id-only',
      ])
      expect(models.stdout.toString()).toMatchSnapshot()
    }, 60000)

    test('composite model listing succeeds with --table', async () => {
      const models = await execa('glaze', [
        'composite:models',
        'test/mocks/encoded.composite.profiles.json',
        '--table',
      ])
      expect(stripAnsi(models.stdout.toString())).toMatchSnapshot()
    }, 60000)
  })

  describe('composite:merge', () => {
    test('composite merge fails without the list of encoded composite paths', async () => {
      const create = await execa('glaze', ['composite:merge'])
      expect(create.stderr.toString().includes('Missing list of composite file paths')).toBe(true)
    }, 60000)

    test('composite merge succeeds', async () => {
      const merge = await execa('glaze', [
        'composite:merge',
        'test/mocks/encoded.composite.profiles.json',
        'test/mocks/encoded.composite.picture.post.json',
      ])
      expect(merge.stdout.toString()).toMatchSnapshot()
    }, 60000)
  })

  describe('composite:extract-model', () => {
    test('composite by extracting models fails without the composite path and at least one model param', async () => {
      const extractModelWithNoParams = await execa('glaze', [
        'composite:extract-model',
      ])
      expect(
        extractModelWithNoParams.stderr
          .toString()
          .includes('Missing composite path and at least one model to extract')
      ).toBe(true)

      const extractModelWithJustCompositePath = await execa('glaze', [
        'composite:extract-model',
        'test/mocks/encoded.composite.picture.post.json',
      ])
      expect(
        extractModelWithJustCompositePath.stderr
          .toString()
          .includes('Missing composite path and at least one model to extract')
      ).toBe(true)
    }, 60000)

    test('composite by extracting models given by streamID succeeds', async () => {
      const encodedComposite = encodedProfilesComposite as EncodedCompositeDefinition
      expect(Object.keys(encodedComposite.models).length).toEqual(3)
      const streamIDs = Object.keys(encodedComposite.models).sort()

      const extractModel = await execa('glaze', [
        'composite:extract-model',
        'test/mocks/encoded.composite.profiles.json',
        streamIDs[0],
        streamIDs[1],
      ])
      const newEncodedComposite = JSON.parse(
        extractModel.stdout.toString()
      ) as EncodedCompositeDefinition
      expect(Object.keys(newEncodedComposite.models).length).toEqual(2)
      expect(Object.keys(newEncodedComposite.models).includes(streamIDs[0])).toBeTruthy()
      expect(Object.keys(newEncodedComposite.models).includes(streamIDs[1])).toBeTruthy()
    }, 60000)

    test('composite by extracting models given by name succeeds', async () => {
      const encodedComposite = encodedProfilesComposite as EncodedCompositeDefinition
      expect(Object.keys(encodedComposite.models).length).toEqual(3)
      const ceramicClient = new CeramicClient()
      const composite = await Composite.fromJSON({
        ceramic: ceramicClient,
        definition: encodedComposite,
      })
      const modelNames = Object.values(composite.toParams().definition.models).map(
        (modelDefinition) => {
          return modelDefinition.name
        }
      )
      const extractModel = await execa('glaze', [
        'composite:extract-model',
        'test/mocks/encoded.composite.profiles.json',
        modelNames[0],
        modelNames[1],
      ])
      const newEncodedComposite = JSON.parse(
        extractModel.stdout.toString()
      ) as EncodedCompositeDefinition
      const newComposite = await Composite.fromJSON({
        ceramic: ceramicClient,
        definition: newEncodedComposite,
      })
      expect(Object.keys(newEncodedComposite.models).length).toEqual(2)
      const newModelNames = Object.values(newComposite.toParams().definition.models).map(
        (modelDefinition) => {
          return modelDefinition.name
        }
      )
      expect(newModelNames.length).toEqual(2)
      expect(newModelNames.includes(modelNames[0])).toBeTruthy()
      expect(newModelNames.includes(modelNames[1])).toBeTruthy()
    }, 60000)
  })

  describe('composite:compile', () => {
    test('composite compilation fails without the composite path and at least one output path param', async () => {
      const compileWithNoParams = await execa('glaze', ['composite:compile'])
      expect(
        compileWithNoParams.stderr.toString().includes('Missing composite path and at output path')
      ).toBe(true)

      const compileWithJustCompositePath = await execa('glaze', [
        'composite:compile',
        'test/mocks/encoded.composite.profiles.json',
      ])
      expect(
        compileWithJustCompositePath.stderr
          .toString()
          .includes('Missing composite path and at output path')
      ).toBe(true)
    }, 60000)

    test('composite compilation succeeds', async () => {
      const dirpath = 'test/test_output_files'
      const filename = 'runtime.composite.profiles'
      const compileWithJustCompositePath = await execa('glaze', [
        'composite:compile',
        'test/mocks/encoded.composite.profiles.json',
        `${dirpath}/${filename}.json`,
        `${dirpath}/${filename}.js`,
        `${dirpath}/${filename}.ts`,
      ])
      expect(
        compileWithJustCompositePath.stderr.toString().includes('Compiling the composite... Done!')
      ).toBe(true)

      const jsonRepresentation = await fs.readFile(`${dirpath}/${filename}.json`)
      const jsRepresentation = await fs.readFile(`${dirpath}/${filename}.js`)
      const tsRepresentation = await fs.readFile(`${dirpath}/${filename}.ts`)

      expect(jsonRepresentation).toMatchSnapshot()
      expect(jsRepresentation).toMatchSnapshot()
      expect(tsRepresentation).toMatchSnapshot()
    }, 60000)
  })
})
