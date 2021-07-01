/**
 * @jest-environment ceramic
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { TileDocument } from '@ceramicnetwork/stream-tile'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'
import { DID } from 'dids'
import KeyResolver from 'key-did-resolver'

import { DocSet, publishIDXConfig, publishEncodedSignedDocSet } from '../src'

describe('docset', () => {
  jest.setTimeout(20000)
  beforeAll(async () => {
    const seed = fromString(
      '08b2e655d239e24e3ca9aa17bc1d05c1dee289d6ebf0b3542fd9536912d51ee9',
      'base16'
    )
    const did = new DID({
      resolver: KeyResolver.getResolver(),
      provider: new Ed25519Provider(seed),
    })
    ceramic.did = did
    await Promise.all([publishIDXConfig(ceramic), did.authenticate()])
  })

  test('publish signed', async () => {
    const signedDocSet = {
      definitions: ['myNotes'],
      schemas: ['NotesList', 'Note'],
      docs: {
        kjzl6cwe1jw14aclir7akkqaea9oz1iw2k7uw97p5z8q7zy8f10e4c7z9mk3uxp: [
          {
            jws: {
              payload: 'AXESIBtt31TVLRavRZCxVpRyYhEqZn1uTwlVAejAmkr0smBY',
              signatures: [
                {
                  signature:
                    'dhpop-0sf_wguq4aLdaMzqHFSrEOrsqdSDcr0iDJXK1qlCe6cso3ySwX9VBANisAmdXtIQ97Srg54HaJ4U-yBg',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreia3nxpvjvjnc2xulefrk2kheyqrfjth23spbfkqd2gatjfpjmtala',
            },
            linkedBlock:
              'omRkYXRho2RuYW1lZW5vdGVzZnNjaGVtYXhLY2VyYW1pYzovL2szeTUybDdxYnYxZnJ5a2xpZTVxZjJmaGZjdmwyb21hYTFreGN2NjZzOHVmZGRxYXM1MmIzczR1Y3NkZGNpaDM0a2Rlc2NyaXB0aW9uaE15IG5vdGVzZmhlYWRlcqNmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnkxZnA0czBud2RhcmgwdmFodXNhcnBwb3NnZXZ5MHBlbWl5a3ltZDJvcmQ2c3d0aGFyY3dmdW5pcXVlcHd2c1RobzBpVTI3MkpCTWtrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOQ==',
          },
        ],
        k3y52l7qbv1fryklie5qf2fhfcvl2omaa1kxcv66s8ufddqas52b3s4ucsddcih34: [
          {
            jws: {
              payload: 'AXESIBSkEawtYAEfe-l62jX0RoEUlbFwIDbZ3l-0faha85oS',
              signatures: [
                {
                  signature:
                    'fx6iIbuS_zwjX1WYgtczSDSq6jrYO3MK7d191_eXiXo5kFO9uV2b6QJ6nFqVk3byGKwOzJoQOo2clct-rn_ACQ',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreiauuqi2yllaaepxx2l23i27irubcsk3c4bag3m54x5upwufv442ci',
            },
            linkedBlock:
              'omRkYXRhpWR0eXBlZm9iamVjdGV0aXRsZWlOb3Rlc0xpc3RnJHNjaGVtYXgnaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjanByb3BlcnRpZXOhZW5vdGVzo2R0eXBlZWFycmF5ZWl0ZW1zo2R0eXBlZm9iamVjdGV0aXRsZWhOb3RlSXRlbWpwcm9wZXJ0aWVzomJpZKFkJHJlZngaIy9kZWZpbml0aW9ucy9DZXJhbWljRG9jSWRldGl0bGWjZHR5cGVmc3RyaW5nZXRpdGxlZXRpdGxlaW1heExlbmd0aBhkZXRpdGxlZW5vdGVza2RlZmluaXRpb25zoWxDZXJhbWljRG9jSWSjZHR5cGVmc3RyaW5nZ3BhdHRlcm54HF5jZXJhbWljOi8vLisoXD92ZXJzaW9uPS4rKT9pbWF4TGVuZ3RoGJZmaGVhZGVyo2ZzY2hlbWH3ZnVuaXF1ZXBFRmN6QytWUlQxdGRtcXpOa2NvbnRyb2xsZXJzgXg4ZGlkOmtleTp6Nk1rb3pBRW51c3RncEtXSFczamhGaVJCR3c2b3JaVFJrSzF0VnI2bWF4WnJwajk=',
          },
        ],
        k3y52l7qbv1frylcft0bq1s2k6vzmv62eog39mbet1xj2wcwbui7gpv56ip1f77r4: [
          {
            jws: {
              payload: 'AXESILOGS_pvx_r-gweUOspldB2AybTPWcOMcxMOFt_cGJ10',
              signatures: [
                {
                  signature:
                    '7HYhuCthAuQkgGSa4qFszYTMs09HbGrlQ91ZzKe3_EpntJU1y1hCFSdjcJRbV6wDVkBnDvlT_g3aJ91VRJGxBQ',
                  protected:
                    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa296QUVudXN0Z3BLV0hXM2poRmlSQkd3Nm9yWlRSa0sxdFZyNm1heFpycGo5I3o2TWtvekFFbnVzdGdwS1dIVzNqaEZpUkJHdzZvclpUUmtLMXRWcjZtYXhacnBqOSJ9',
                },
              ],
              link: 'bafyreiftqzf7u36h7l7igb4uhlfgk5a5qde3jt2zyoghgeyoc3p5yge5oq',
            },
            linkedBlock:
              'omRkYXRhpGR0eXBlZm9iamVjdGV0aXRsZWROb3RlZyRzY2hlbWF4J2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI2pwcm9wZXJ0aWVzomRkYXRlpGR0eXBlZnN0cmluZ2V0aXRsZWRkYXRlZmZvcm1hdGlkYXRlLXRpbWVpbWF4TGVuZ3RoGB5kdGV4dKNkdHlwZWZzdHJpbmdldGl0bGVkdGV4dGltYXhMZW5ndGgZD6BmaGVhZGVyo2ZzY2hlbWH3ZnVuaXF1ZXBnZ1RpQ1JaZVY2ZnE4STYxa2NvbnRyb2xsZXJzgXg4ZGlkOmtleTp6Nk1rb3pBRW51c3RncEtXSFczamhGaVJCR3c2b3JaVFJrSzF0VnI2bWF4WnJwajk=',
          },
        ],
      },
    }

    await expect(publishEncodedSignedDocSet(ceramic, signedDocSet)).resolves.toBeUndefined()
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

    const noteSchema = await TileDocument.create(ceramic, NoteSchema)
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
                $comment: `ceramic:doc:${noteSchemaURL}`,
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

    const notesSchema = await TileDocument.create(ceramic, NotesSchema)
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
      collections: {},
      index: {
        myNotes: {
          id: notesDefinitionID.toString(),
          schema: notesSchemaURL,
        },
      },
      lists: {
        NotesList: {
          name: 'NotesListItem',
          type: 'object',
        },
      },
      objects: {
        NotesListItem: {
          fields: {
            note: {
              type: 'reference',
              owner: 'Notes',
              schemas: [noteSchemaURL],
              required: true,
            },
            title: {
              type: 'string',
              required: false,
              maxLength: 100,
            },
          },
          parents: ['NotesList'],
        },
        Notes: {
          fields: {
            notes: {
              name: 'NotesList',
              required: false,
              type: 'list',
            },
          },
          parents: null,
        },
        Note: {
          fields: {
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
          parents: null,
        },
      },
      referenced: {
        [noteSchemaURL]: {
          name: 'Note',
          type: 'object',
        },
        [notesSchemaURL]: {
          name: 'Notes',
          type: 'object',
        },
      },
      references: {
        NotesListItemReference: {
          owner: 'Notes',
          schemas: [noteSchemaURL],
        },
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
