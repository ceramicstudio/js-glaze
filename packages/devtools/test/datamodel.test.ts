/**
 * @jest-environment glaze
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ModelManager, publishEncodedSignedModel } from '../src'

describe('datamodel', () => {
  jest.setTimeout(20000)

  test('publish signed', async () => {
    const signedModel = {
      definitions: {
        myNotes: [
          {
            jws: {
              payload: 'AXESIJF7-JQyVITfBTFVxXibUpyJoHP3vWbkGpZdrOmMWdOV',
              signatures: [
                {
                  signature:
                    '74WEiXkD6StwAWqIeXlaZg8hj0asoljSPJuZarR7hloelLYSP5__F9YqDsZ2x3tumvtQtiG28J7TIxV7Sk22CQ',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreierpp4jimsuqtpqkmkvyv4jwuu4rgqhh555m3sbvfs5vtuyywotsu',
            },
            linkedBlock:
              'omRkYXRho2RuYW1lZW5vdGVzZnNjaGVtYXhLY2VyYW1pYzovL2szeTUybDdxYnYxZnJ5ZW95ZGpxNXRjd2w1NnpkYjdjb3h5ajVsdTEyc29wanY2OXAzb3oxZjVkb3pkaGFzZzc0a2Rlc2NyaXB0aW9uaE15IG5vdGVzZmhlYWRlcqJmdW5pcXVlcHQ1bnNDUHYzc1RQR2EzSnJrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOQ==',
          },
        ],
      },
      schemas: {
        NotesList: [
          {
            jws: {
              payload: 'AXESIFC8Va0fKPMmnBDNo0D6Nx7G9jkdv3W-vclA11X5G3oD',
              signatures: [
                {
                  signature:
                    'iSTpVkh8XviWs5_PYfUI4kT-Z7FB7josiy9XkljOalFXxJm9bw1CbafcYJSYPUTjPYpR2kOIZBMITIBZtxEtAw',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreicqxrk22hzi6mtjyegnunapuny6y33dshn7ow7l3ska25k7sg32am',
            },
            linkedBlock:
              'omRkYXRhpmR0eXBlZm9iamVjdGV0aXRsZWlOb3Rlc0xpc3RnJHNjaGVtYXgnaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjaHJlcXVpcmVkgGpwcm9wZXJ0aWVzoWVub3Rlc6NkdHlwZWVhcnJheWVpdGVtc6RkdHlwZWZvYmplY3RldGl0bGVoTm90ZUl0ZW1ocmVxdWlyZWSAanByb3BlcnRpZXOiYmlkoWQkcmVmeBojL2RlZmluaXRpb25zL0NlcmFtaWNEb2NJZGV0aXRsZaNkdHlwZWZzdHJpbmdldGl0bGVldGl0bGVpbWF4TGVuZ3RoGGRldGl0bGVlbm90ZXNrZGVmaW5pdGlvbnOhbENlcmFtaWNEb2NJZKNkdHlwZWZzdHJpbmdncGF0dGVybngcXmNlcmFtaWM6Ly8uKyhcP3ZlcnNpb249LispP2ltYXhMZW5ndGgYlmZoZWFkZXKiZnVuaXF1ZXBUTWc0TEdyK3h5YnRVNUZSa2NvbnRyb2xsZXJzgXg4ZGlkOmtleTp6Nk1rb3pBRW51c3RncEtXSFczamhGaVJCR3c2b3JaVFJrSzF0VnI2bWF4WnJwajk=',
          },
        ],
        Note: [
          {
            jws: {
              payload: 'AXESIAdjbJhcP72K_OLxy1FOjvMs4hbLwIeo7mYvfGlci7td',
              signatures: [
                {
                  signature:
                    '5qO6Bd8d2UdeflYgofamBOkSNjwb5Fy-OFJ8M2Gu8h7_AT09w4LNURjYFT9QTkiuGVH1hNwZUxLqA0bfcXYADQ',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreiahmnwjqxb7xwfpzyxrzniu5dxtftrbns6aq6uo4zrppruvzc53lu',
            },
            linkedBlock:
              'omRkYXRhpWR0eXBlZm9iamVjdGV0aXRsZWROb3RlZyRzY2hlbWF4J2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI2hyZXF1aXJlZIBqcHJvcGVydGllc6JkZGF0ZaRkdHlwZWZzdHJpbmdldGl0bGVkZGF0ZWZmb3JtYXRpZGF0ZS10aW1laW1heExlbmd0aBgeZHRleHSjZHR5cGVmc3RyaW5nZXRpdGxlZHRleHRpbWF4TGVuZ3RoGQ+gZmhlYWRlcqJmdW5pcXVlcEhmR3RNK2w5cXRTd2ZaVVRrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOQ==',
          },
        ],
      },
      tiles: {},
    }
    await expect(publishEncodedSignedModel(ceramic, signedModel)).resolves.toMatchSnapshot()
  })

  test('creation flow', async () => {
    const NoteSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Note',
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date-time',
          title: 'date',
          maxLength: 30,
        },
        text: {
          type: 'string',
          title: 'text',
          maxLength: 4000,
        },
      },
      required: [],
    }

    const NotesListSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'NotesList',
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          title: 'notes',
          items: {
            type: 'object',
            title: 'NoteItem',
            properties: {
              id: {
                $ref: '#/definitions/CeramicDocId',
              },
              title: {
                type: 'string',
                title: 'title',
                maxLength: 100,
              },
            },
            required: [],
          },
        },
      },
      required: [],
      definitions: {
        CeramicDocId: {
          type: 'string',
          pattern: '^ceramic://.+(\\?version=.+)?',
          maxLength: 150,
        },
      },
    }

    const manager = new ModelManager(ceramic)
    await manager.useCoreModel()

    const [notesListSchemaCommitID] = await Promise.all([
      manager.addSchema('NotesList', NotesListSchema as any),
      manager.addSchema('Note', NoteSchema as any),
    ])
    expect(manager.schemas).toEqual(['Definition', 'IdentityIndex', 'NotesList', 'Note'])

    await manager.addDefinition('myNotes', {
      name: 'notes',
      description: 'My notes',
      schema: notesListSchemaCommitID.toUrl(),
    })
    expect(manager.definitions).toEqual(['myNotes'])

    await expect(manager.toSignedJSON()).resolves.toBeDefined()
  })
})
