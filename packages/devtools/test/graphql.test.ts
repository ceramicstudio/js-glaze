/**
 * @jest-environment ceramic
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { TileDocument } from '@ceramicnetwork/stream-tile'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'
import { DID } from 'dids'
import KeyResolver from 'key-did-resolver'

import { ModelManager, createGraphQLModel } from '../src'

describe('graphql', () => {
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
    await did.authenticate()
  })

  test('creation flow with associated schema', async () => {
    const manager = new ModelManager(ceramic)

    // TODO: also test with external schema added in manager constructor?
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
                $comment: `cip88:ref:${noteSchemaURL}`,
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

    const notesDefinitionID = await manager.addDefinition('myNotes', {
      name: 'notes',
      description: 'My notes',
      schema: notesSchemaURL,
    })

    const exampleNoteID = await manager.addTile(
      'exampleNote',
      { date: '2020-12-10T11:12:34.567Z', text: 'An example note' },
      { schema: noteSchemaURL }
    )

    await expect(createGraphQLModel(manager)).resolves.toEqual({
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
