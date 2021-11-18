/**
 * @jest-environment glaze
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi } from '@ceramicnetwork/common'
import { publishCollectionSchemas } from '@glazed/append-collection'
import { ModelManager, createGraphQLModel } from '@glazed/devtools'
import { TileLoader } from '@glazed/tile-loader'
import { execute, parse, printSchema } from 'graphql'
import type { GraphQLSchema } from 'graphql'

import { Context, createGraphQLSchema } from '../src'

declare global {
  const ceramic: CeramicApi
}

describe('lib', () => {
  jest.setTimeout(20000)

  let context: Context
  let schema: GraphQLSchema

  beforeAll(async () => {
    const loader = new TileLoader({ ceramic, cache: true })

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
    const noteSchema = await loader.create(NoteSchema)
    const noteSchemaURL = noteSchema.commitId.toUrl()
    const noteRef = {
      type: 'string',
      title: 'reference',
      $comment: `cip88:ref:${noteSchemaURL}`,
      maxLength: 100,
    }

    const notesCollectionSchemaCommitID = await publishCollectionSchemas(loader, 'Notes', [noteRef])

    const NotesSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Notes',
      type: 'object',
      properties: {
        all: {
          type: 'string',
          $comment: `cip88:ref:${notesCollectionSchemaCommitID.toUrl()}`,
          maxLength: 100,
        },
        favorites: {
          type: 'array',
          title: 'list',
          items: noteRef,
        },
      },
    }
    const notesSchema = await loader.create(NotesSchema)
    const notesSchemaURL = notesSchema.commitId.toUrl()

    const manager = new ModelManager(ceramic)
    await Promise.all([
      manager.createDefinition('myNotes', {
        name: 'notes',
        description: 'My notes',
        schema: notesSchemaURL,
      }),
      manager.createTile(
        'exampleNote',
        { date: '2020-12-10T11:12:34.567Z', text: 'An example note', title: 'Example' },
        { schema: noteSchemaURL }
      ),
    ])
    const [graphModel, model] = await Promise.all([
      createGraphQLModel(manager),
      manager.toPublished(),
    ])
    context = new Context({ ceramic, loader, model })
    schema = createGraphQLSchema(graphModel)
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

  test('add and read notes from a connection', async () => {
    jest.setTimeout(30000)

    const create = parse(`
       mutation TestCreateNotes($input: CreateNotesInput!) {
         createNotes(input: $input) {
           node {
             id
           }
         }
       }
     `)
    const created = await execute(schema, create, {}, context, {
      input: { content: {} },
    })
    const { id } = created.data!.createNotes.node

    const add = parse(`
      mutation TestAddNoteEdge($input: AddNotesAllEdgeInput!) {
        addNotesAllEdge(input: $input) {
          edge {
            cursor
          }
        }
      }`)

    const toAdd = [
      { date: '2021-01-06T14:32:00.000Z', text: 'hello first', title: 'first' },
      { date: '2021-01-06T14:33:00.000Z', text: 'hello second', title: 'second' },
      { date: '2021-01-06T14:34:00.000Z', text: 'hello third', title: 'third' },
    ]
    for (const content of toAdd) {
      await execute(schema, add, {}, context, { input: { id, content } })
    }

    const read = parse(`
       query TestReadNotes($id: ID!) {
         node(id: $id) {
           ...on Notes {
             all(first: 3) {
               edges {
                node {
                  date
                  text
                  title
                }
               }
             }
           }
         }
       }
     `)
    await expect(execute(schema, read, {}, context, { id })).resolves.toMatchSnapshot()
  })
})
