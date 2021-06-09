/**
 * @jest-environment idx
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { publishCollectionSchemas } from '@ceramicstudio/append-collection'
import { DocSet, publishIDXConfig } from '@ceramicstudio/idx-tools'
import { execute, parse, printSchema } from 'graphql'
import type { GraphQLSchema } from 'graphql'

import { Context, createGraphQLSchema } from '../src'

declare global {
  const ceramic: CeramicApi
}

describe('lib', () => {
  const context = new Context(ceramic)
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
        title: {
          type: 'string',
          maxLength: 100,
        },
      },
      required: ['date', 'text', 'title'],
    }
    const noteSchema = await TileDocument.create(ceramic, NoteSchema)
    const noteSchemaURL = noteSchema.commitId.toUrl()
    const noteRef = {
      type: 'string',
      title: 'reference',
      $comment: `ceramic:tile:${noteSchemaURL}`,
      maxLength: 100,
    }

    const notesCollectionSchemaCommitID = await publishCollectionSchemas(ceramic, 'Notes', [
      noteRef,
    ])

    const NotesSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Notes',
      type: 'object',
      properties: {
        all: {
          type: 'string',
          $comment: `ceramic:tile:${notesCollectionSchemaCommitID.toUrl()}`,
          maxLength: 100,
        },
        favorites: {
          type: 'array',
          title: 'list',
          items: noteRef,
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
        { date: '2020-12-10T11:12:34.567Z', text: 'An example note', title: 'Example' },
        { schema: noteSchemaURL }
      ),
    ])
    const graphqlDocSetRecords = await docset.toGraphQLDocSetRecords()
    schema = createGraphQLSchema(graphqlDocSetRecords)
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
             title
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
             title
           }
         }
       }
     `)
    const res = await execute(schema, mutation, {}, context, {
      input: { content: { date: '2021-01-06T14:28:00.000Z', text: 'hello test!', title: 'test' } },
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
      input: { content: { date: '2021-01-06T14:28:00.000Z', text: 'hello first', title: 'first' } },
    })
    const { id } = created.data!.createNote.node

    const update = parse(`
       mutation TestUpdateNote($input: UpdateNoteInput!) {
         updateNote(input: $input) {
           node {
             id
             date
             text
             title
           }
         }
       }
     `)
    await execute(schema, update, {}, context, {
      input: {
        id,
        content: { date: '2021-01-06T14:32:00.000Z', text: 'hello second', title: 'second' },
      },
    })

    const read = parse(`
       query TestReadNote($id: ID!) {
         node(id: $id) {
           ...on Note {
             date
             text
             title
           }
         }
       }
     `)
    const res = await execute(schema, read, {}, context, { id })
    expect(res).toEqual({
      data: {
        node: { date: '2021-01-06T14:32:00.000Z', text: 'hello second', title: 'second' },
      },
    })
  })
})
