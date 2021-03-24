/**
 * @jest-environment ceramic
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'

import { DocSet, publishIDXConfig, publishEncodedSignedDocSet } from '../src'

describe('docset', () => {
  beforeAll(async () => {
    const seed = fromString(
      '08b2e655d239e24e3ca9aa17bc1d05c1dee289d6ebf0b3542fd9536912d51ee9',
      'base16'
    )
    await Promise.all([
      ceramic.setDIDProvider(new Ed25519Provider(seed)),
      publishIDXConfig(ceramic),
    ])
  })

  test('publish signed', async () => {
    jest.setTimeout(20000)

    const signedDocSet = {
      definitions: ['myNotes'],
      schemas: ['Notes', 'Note'],
      docs: {
        kjzl6cwe1jw1472p4drcniththby78uvf232nvjovrsdtmc85emo5gnczz5ype5: [
          {
            jws: {
              payload: 'AXESIPyoTMwwQC5t2ZVW0OcLbs9mynjYCS8KidAxAmnsxBVr',
              signatures: [
                {
                  signature:
                    'U30sbH2b4ZyOz4rTBJ7Ig_167B9FULzuLhQTsKhaSVi2Ok6qn6GVA6InUHp-xpoDO7Iyg0mFce-oe7Y5g6QhAA',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreih4vbgmymcafzw5tfkw2dtqw3wpm3fhrwajf4fitubraju6zravnm',
            },
            linkedBlock:
              'o2RkYXRho2RuYW1lZW5vdGVzZnNjaGVtYXhLY2VyYW1pYzovL2szeTUybDdxYnYxZnJ5aHNjenVjOHljYzB4eXlsczY4OWdsYm03NXIycjdhbW91ZHI4ajFrbnAwMGI2MzB2cTRna2Rlc2NyaXB0aW9uaE15IG5vdGVzZmhlYWRlcqJmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnk0aDI4cjUzZWJrZXltMm14ZjFpMjNmMzAzcWwzZ3Mxb3FvdmZtbDQ0c2NhdWtuY3B4YzBrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOWZ1bmlxdWVwNU9MTWpWY1FtZ1QzYk9qWA==',
          },
        ],
        k3y52l7qbv1frynhy16tca3xp37tmkbap5ub59skxefx30yovo5fcf2j0l46pzz0g: [
          {
            jws: {
              payload: 'AXESIGSE6Fam_Z3ZZW_qBnDo2d7w1JUlY2NWsOMgG0dWtciP',
              signatures: [
                {
                  signature:
                    'n8IXk0pRbl2HZNiniLskn-EO5whXhilR3gGxgVJFygVk5pppO6anPqsw3SdbSyoevJlLZkHx_kjOhx9h7a30DA',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreideqtufnjx5txmwk37kazyorwo66dkjkjldmnllbyzadndvnnoir4',
            },
            linkedBlock:
              'o2RkYXRhpWR0eXBlZm9iamVjdGV0aXRsZWROb3RlZyRzY2hlbWF4J2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI2hyZXF1aXJlZIJkZGF0ZWR0ZXh0anByb3BlcnRpZXOiZGRhdGWjZHR5cGVmc3RyaW5nZmZvcm1hdGlkYXRlLXRpbWVpbWF4TGVuZ3RoGB5kdGV4dKJkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGQ+gZmhlYWRlcqFrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOWZ1bmlxdWVwS3JZa2hRZERiakZPZ0pwRA==',
          },
        ],
        k3y52l7qbv1fryhsczuc8ycc0xyyls689glbm75r2r7amoudr8j1knp00b630vq4g: [
          {
            jws: {
              payload: 'AXESINUJLLN081Vh_vjO74-hAIL2FAiNZw7Cszh0rgEj1SCH',
              signatures: [
                {
                  signature:
                    'o3IONDuIJ1vsdOJYOm4XdQSmDkgq7UyNqgkq3a68zJ5jkRk5_oiM2opmZZYENx03rekGo2H4rog9mk_Jk3-6Bw',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreigvbewlg5htkvq756go56h2caec6ykardlhb3blgoduvyashvjaq4',
            },
            linkedBlock:
              'o2RkYXRhpGR0eXBlZm9iamVjdGV0aXRsZWVOb3Rlc2ckc2NoZW1heCdodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA3L3NjaGVtYSNqcHJvcGVydGllc6Flbm90ZXOjZHR5cGVlYXJyYXllaXRlbXOkZHR5cGVmb2JqZWN0ZXRpdGxlZGl0ZW1ocmVxdWlyZWSBZG5vdGVqcHJvcGVydGllc6Jkbm90ZaRjJGlkeBljZXJhbWljOi8vc2NoZW1hUmVmZXJlbmNlZHR5cGVmb2JqZWN0ZXRpdGxlaXJlZmVyZW5jZWpwcm9wZXJ0aWVzomJpZKFkdHlwZWZzdHJpbmdmc2NoZW1homR0eXBlZnN0cmluZ2Vjb25zdHhLY2VyYW1pYzovL2szeTUybDdxYnYxZnJ5bmh5MTZ0Y2EzeHAzN3Rta2JhcDV1YjU5c2t4ZWZ4MzB5b3ZvNWZjZjJqMGw0NnB6ejBnZXRpdGxlomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgYZGV0aXRsZWRsaXN0ZmhlYWRlcqFrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOWZ1bmlxdWVwWnMwU2pZM3h2MExPUzRsWQ==',
          },
        ],
        kjzl6cwe1jw149g045o93y2oqo25ubzky331vvwo4m2x7ahotdgx9p1sy9f4flu: [
          {
            jws: {
              payload: 'AXESIMrpMGC4FF9MGHhsYmxNzx7o-pDdNmWS2wGEYR22IJ7X',
              signatures: [
                {
                  signature:
                    'FsOBpQyJv23K8xMv9CnoQlgP9Gi2oZn8P8O14CTK4GB2tvGZAfwcoY-YMXjqRbN9ySPFTTnWbnM5tgb1vyKcCQ',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreigk5eygboaul5gbq6dmmjwe3ty65d5jbxjwmwjnwamemeo3mie624',
            },
            linkedBlock:
              'o2RkYXRhomRkYXRleBgyMDIwLTEyLTEwVDExOjEyOjM0LjU2N1pkdGV4dG9BbiBleGFtcGxlIG5vdGVmaGVhZGVyomZzY2hlbWF4S2NlcmFtaWM6Ly9rM3k1Mmw3cWJ2MWZyeW5oeTE2dGNhM3hwMzd0bWtiYXA1dWI1OXNreGVmeDMweW92bzVmY2YyajBsNDZwenowZ2tjb250cm9sbGVyc4F4OGRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5ZnVuaXF1ZXBHSjhvdlhVRDgvVmJXZDc3',
          },
        ],
      },
    }

    await expect(publishEncodedSignedDocSet(ceramic, signedDocSet)).resolves.toBeUndefined()
  })

  test('creation flow', async () => {
    jest.setTimeout(20000)

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
          },
        },
      },
      definitions: {
        CeramicDocId: {
          type: 'string',
          pattern: '^ceramic://.+(\\?version=.+)?',
          maxLength: 150,
        },
      },
    }

    const docset = new DocSet(ceramic)
    const [notesListSchemaCommitID] = await Promise.all([
      docset.addSchema(NotesListSchema),
      docset.addSchema(NoteSchema),
    ])
    expect(docset.schemas).toEqual(['NotesList', 'Note'])

    await docset.addDefinition(
      {
        name: 'notes',
        description: 'My notes',
        schema: notesListSchemaCommitID.toUrl(),
      },
      'myNotes'
    )
    expect(docset.definitions).toEqual(['myNotes'])

    await expect(docset.toSignedJSON()).resolves.toBeDefined()
  })

  test('creation flow with associated schema', async () => {
    jest.setTimeout(20000)

    const docset = new DocSet(ceramic)

    // TODO: also test with external schema added in docset constructor?
    // or added dynamically

    const NoteSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Note',
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date-time',
          maxLength: 30,
        },
        text: {
          type: 'string',
          maxLength: 4000,
        },
      },
      required: ['date', 'text'],
    }

    const noteSchema = await ceramic.createDocument('tile', { content: NoteSchema })
    const noteSchemaURL = noteSchema.commitId.toUrl()

    const NotesSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Notes',
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          title: 'list',
          items: {
            type: 'object',
            title: 'item',
            properties: {
              note: {
                type: 'string',
                title: 'reference',
                $ceramic: { type: 'tile', schema: noteSchemaURL },
                maxLength: 150,
              },
              title: {
                type: 'string',
                maxLength: 100,
              },
            },
            required: ['note'],
          },
        },
      },
    }

    const notesSchema = await ceramic.createDocument('tile', { content: NotesSchema })
    const notesSchemaURL = notesSchema.commitId.toUrl()

    const notesDefinitionID = await docset.addDefinition(
      {
        name: 'notes',
        description: 'My notes',
        schema: notesSchemaURL,
      },
      'myNotes'
    )

    const exampleNoteID = await docset.addTile(
      'exampleNote',
      { date: '2020-12-10T11:12:34.567Z', text: 'An example note' },
      { schema: noteSchemaURL }
    )

    await expect(docset.toGraphQLDocSetRecords()).resolves.toEqual({
      index: {
        myNotes: {
          id: notesDefinitionID.toString(),
          schema: notesSchemaURL,
        },
      },
      lists: { NotesList: 'NotesListItem' },
      nodes: {
        [notesSchemaURL]: 'Notes',
        [noteSchemaURL]: 'Note',
      },
      objects: {
        NotesListItem: {
          note: {
            type: 'reference',
            name: 'NotesListItemReference',
            required: true,
          },
          title: {
            type: 'string',
            required: false,
            maxLength: 100,
          },
        },
        Notes: {
          notes: {
            name: 'NotesList',
            required: false,
            type: 'list',
          },
        },
        Note: {
          date: {
            type: 'string',
            required: true,
            format: 'date-time',
            maxLength: 30,
          },
          text: {
            type: 'string',
            required: true,
            maxLength: 4000,
          },
        },
      },
      references: {
        NotesListItemReference: [noteSchemaURL],
      },
      roots: {
        exampleNote: {
          id: exampleNoteID.toString(),
          schema: noteSchemaURL,
        },
      },
    })
  })
})
