/**
 * @jest-environment idx
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { IDX } from '@ceramicstudio/idx'
import { toGraphQLDocSetRecords } from '@ceramicstudio/idx-graphql-tools'
import { DocSet, publishIDXConfig } from '@ceramicstudio/idx-tools'
import { execute, parse, printSchema } from 'graphql'
import type { GraphQLSchema } from 'graphql'

import { GraphQLDocSet } from '../src'

declare global {
  const ceramic: CeramicApi
  const idx: IDX
}

describe('lib', () => {
  const context = { ceramic, idx: new IDX({ ceramic }) }
  let graphqlDocSet
  let schema: GraphQLSchema

  beforeAll(async () => {
    await publishIDXConfig(ceramic)

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
                type: 'object',
                $id: 'ceramic://schemaReference',
                title: 'reference',
                properties: {
                  schema: { type: 'string', const: noteSchemaURL },
                  id: { type: 'string' },
                },
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

    const docset = new DocSet(ceramic)
    await Promise.all([
      docset.addDefinition(
        {
          name: 'notes',
          description: 'My notes',
          schema: notesSchemaURL,
        },
        'myNotes'
      ),
      docset.addTile(
        'exampleNote',
        { date: '2020-12-10T11:12:34.567Z', text: 'An example note' },
        { schema: noteSchemaURL }
      ),
    ])
    const graphqlDocSetRecords = await toGraphQLDocSetRecords(docset)

    graphqlDocSet = new GraphQLDocSet(graphqlDocSetRecords)
    schema = graphqlDocSet.toGraphQLSchema()
  })

  test('schema creation', () => {
    expect(printSchema(schema)).toMatchSnapshot()
  })

  test('read existing note', async () => {
    const readRoot = parse(`
       query TestReadNote {
         exampleNote {
           id
         }
       }
     `)
    const readNode = parse(`
       query TestReadNote($id: ID!) {
         node(id: $id) {
           ...on Note {
             date
             text
           }
         }
       }
     `)

    const resRoot = await execute(schema, readRoot, {}, context)
    const resNode = await execute(schema, readNode, {}, context, {
      id: resRoot.data!.exampleNote.id,
    })
    expect(resNode).toMatchSnapshot()
  })

  test('create a note', async () => {
    const mutation = parse(`
       mutation TestCreateNote($input: CreateNoteInput!) {
         createNote(input: $input) {
           node {
             date
             text
           }
         }
       }
     `)
    const res = await execute(schema, mutation, {}, context, {
      input: { object: { date: '2021-01-06T14:28:00.000Z', text: 'hello test!' } },
    })
    expect(res).toMatchSnapshot()
  })

  test('create, update and read a note', async () => {
    jest.setTimeout(30000)

    const create = parse(`
       mutation TestCreateNote($input: CreateNoteInput!) {
         createNote(input: $input) {
           node {
             id
           }
         }
       }
     `)
    const created = await execute(schema, create, {}, context, {
      input: { object: { date: '2021-01-06T14:28:00.000Z', text: 'hello first' } },
    })
    const { id } = created.data!.createNote.node

    const update = parse(`
       mutation TestUpdateNote($input: UpdateNoteInput!) {
         updateNote(input: $input) {
           node {
             id
             date
             text
           }
         }
       }
     `)
    await execute(schema, update, {}, context, {
      input: {
        id,
        object: { date: '2021-01-06T14:32:00.000Z', text: 'hello second' },
      },
    })

    const read = parse(`
       query TestReadNote($id: ID!) {
         node(id: $id) {
           ...on Note {
             date
             text
           }
         }
       }
     `)
    const res = await execute(schema, read, {}, context, { id })
    expect(res).toEqual({
      data: {
        node: { date: '2021-01-06T14:32:00.000Z', text: 'hello second' },
      },
    })
  })
})
