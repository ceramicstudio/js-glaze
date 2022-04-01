/**
 * @jest-environment glaze
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { publishCollectionSchemas } from '@glazed/append-collection'
import { ModelManager, createGraphQLModel } from '@glazed/devtools'
import { jest } from '@jest/globals'
import { execute, parse, printSchema } from 'graphql'
import type { GraphQLSchema } from 'graphql'

import { Context, createGraphQLSchema } from '../src'

declare global {
  const ceramic: CeramicApi
}

describe('lib', () => {
  jest.setTimeout(60000)

  let contextValue: Context
  let schema: GraphQLSchema

  beforeAll(async () => {
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
      $comment: `cip88:ref:${noteSchemaURL}`,
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
    const notesSchema = await TileDocument.create(ceramic, NotesSchema)
    const notesSchemaURL = notesSchema.commitId.toUrl()

    const manager = new ModelManager({ ceramic })
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
    const [graphModel, model] = await Promise.all([createGraphQLModel(manager), manager.deploy()])
    contextValue = new Context({ ceramic, model })
    schema = createGraphQLSchema(graphModel)
  })

  test('schema creation', () => {
    expect(printSchema(schema)).toMatchSnapshot()
  })

  test('read existing note', async () => {
    const resRoot = await execute({
      schema,
      document: parse(`
        query TestReadNote {
          exampleNote {
            id
          }
        }
      `),
      contextValue,
    })
    const resNode = await execute({
      schema,
      contextValue,
      document: parse(`
        query TestReadNote($id: ID!) {
          node(id: $id) {
            ...on Note {
              date
              text
              title
            }
          }
        }
      `),
      variableValues: {
        id: resRoot.data!.exampleNote.id,
      },
    })
    expect(resNode).toMatchSnapshot()
  })

  test('create a note', async () => {
    const res = await execute({
      schema,
      contextValue,
      document: parse(`
        mutation TestCreateNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            node {
              date
              text
              title
            }
          }
        }
      `),
      variableValues: {
        input: {
          content: { date: '2021-01-06T14:28:00.000Z', text: 'hello test!', title: 'test' },
        },
      },
    })
    expect(res).toMatchSnapshot()
  })

  test('create, update and read a note', async () => {
    jest.setTimeout(30000)

    const created = await execute({
      schema,
      contextValue,
      document: parse(`
        mutation TestCreateNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            node {
              id
            }
          }
        }
      `),
      variableValues: {
        input: {
          content: { date: '2021-01-06T14:28:00.000Z', text: 'hello first', title: 'first' },
        },
      },
    })
    const { id } = created.data!.createNote.node

    await execute({
      schema,
      contextValue,
      document: parse(`
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
      `),
      variableValues: {
        input: {
          id,
          content: { date: '2021-01-06T14:32:00.000Z', text: 'hello second', title: 'second' },
        },
      },
    })

    const res = await execute({
      schema,
      document: parse(`
        query TestReadNote($id: ID!) {
          node(id: $id) {
            ...on Note {
              date
              text
              title
            }
          }
        }
      `),
      contextValue,
      variableValues: { id },
    })
    expect(res).toEqual({
      data: {
        node: { date: '2021-01-06T14:32:00.000Z', text: 'hello second', title: 'second' },
      },
    })
  })

  test('add and read notes from a connection', async () => {
    const created = await execute({
      schema,
      contextValue,
      document: parse(`
        mutation TestCreateNotes($input: CreateNotesInput!) {
          createNotes(input: $input) {
            node {
              id
            }
          }
        }
      `),
      variableValues: {
        input: { content: {} },
      },
    })
    const { id } = created.data!.createNotes.node

    const document = parse(`
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
      await execute({
        schema,
        contextValue,
        document,
        variableValues: { input: { id, content } },
      })
    }

    await expect(
      execute({
        schema,
        contextValue,
        document: parse(`
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
        `),
        variableValues: { id },
      })
    ).resolves.toMatchSnapshot()
  })
})
