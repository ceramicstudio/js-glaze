/**
 * @jest-environment glaze
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi } from '@ceramicnetwork/common'
// import { publishCollectionSchemas } from '@glazed/append-collection'
import { ModelManager, createGraphQLModel } from '@glazed/devtools'
import type { GraphQLModel } from '@glazed/graphql-types'
import { TileLoader } from '@glazed/tile-loader'
import { jest } from '@jest/globals'

import { GraphQLClient, printGraphQLSchema } from '../src'

declare global {
  const ceramic: CeramicApi
}

describe('lib', () => {
  jest.setTimeout(20000)

  let client: GraphQLClient
  let graphModel: GraphQLModel

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

    // const notesCollectionSchemaCommitID = await publishCollectionSchemas(loader, 'Notes', [noteRef])

    const NotesSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Notes',
      type: 'object',
      properties: {
        // all: {
        //   type: 'string',
        //   $comment: `cip88:ref:${notesCollectionSchemaCommitID.toUrl()}`,
        //   maxLength: 100,
        // },
        all: {
          type: 'array',
          title: 'list',
          items: noteRef,
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
    const [dataModel, graphqlModel] = await Promise.all([
      manager.deploy(),
      createGraphQLModel(manager),
    ])
    client = new GraphQLClient({ ceramic, loader, dataModel, graphqlModel })
    graphModel = graphqlModel
  })

  test('schema creation', () => {
    expect(printGraphQLSchema(graphModel)).toMatchSnapshot()
  })

  test('read existing note', async () => {
    const resRoot = await client.execute(`
      query TestReadNote {
        exampleNote {
          id
        }
      }
    `)
    const resNode = await client.execute(
      `
        query TestReadNote($id: ID!) {
          node(id: $id) {
            ...on Note {
              date
              text
              title
            }
          }
        }
      `,
      { id: resRoot.data!.exampleNote.id }
    )
    expect(resNode).toMatchSnapshot()
  })

  test('create a note', async () => {
    const res = await client.execute(
      `
        mutation TestCreateNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            node {
              date
              text
              title
            }
          }
        }
      `,
      {
        input: {
          content: { date: '2021-01-06T14:28:00.000Z', text: 'hello test!', title: 'test' },
        },
      }
    )
    expect(res).toMatchSnapshot()
  })

  test('create, update and read a note', async () => {
    jest.setTimeout(30000)

    const created = await client.execute(
      `
        mutation TestCreateNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            node {
              id
            }
          }
        }
      `,
      {
        input: {
          content: { date: '2021-01-06T14:28:00.000Z', text: 'hello first', title: 'first' },
        },
      }
    )
    const { id } = created.data!.createNote.node

    await client.execute(
      `
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
      `,
      {
        input: {
          id,
          content: { date: '2021-01-06T14:32:00.000Z', text: 'hello second', title: 'second' },
        },
      }
    )

    const res = await client.execute(
      `
        query TestReadNote($id: ID!) {
          node(id: $id) {
            ...on Note {
              date
              text
              title
            }
          }
        }
      `,
      { id }
    )
    expect(res).toEqual({
      data: {
        node: { date: '2021-01-06T14:32:00.000Z', text: 'hello second', title: 'second' },
      },
    })
  })

  test('add and read a note from the store', async () => {
    jest.setTimeout(30000)

    const created = await client.execute(
      `
        mutation TestAddNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            node {
              id
            }
          }
        }`,
      {
        input: {
          content: { date: '2021-01-06T14:32:00.000Z', text: 'hello first', title: 'first' },
        },
      }
    )
    const { id } = created.data!.createNote.node

    // First add the ID to the `all` list
    await client.execute(
      `
        mutation SetMyNote($input: SetMyNotesInput!) {
          setMyNotes(input: $input) {
            clientMutationId
          }
        }`,
      {
        input: { content: { all: [id] } },
      }
    )

    // Test `merge` option by adding the ID to the `favorites` list
    // This should keep the `all` list unchanged
    await client.execute(
      `
        mutation SetMyFavoriteNote($input: SetMyNotesInput!) {
          setMyNotes(input: $input) {
            clientMutationId
          }
        }`,
      {
        input: {
          content: { favorites: [id] },
          options: { merge: true },
        },
      }
    )

    const read = await client.execute(`
      query TestReadNotes {
        viewer {
          id
          store {
            myNotes {
              all
              favorites
            }
          }
        }
      }
    `)
    const { myNotes } = read.data!.viewer.store
    expect(myNotes.all).toEqual([id])
    expect(myNotes.favorites).toEqual([id])
  })

  // test('add and read notes from a connection', async () => {
  //   jest.setTimeout(30000)

  //   const created = await execute({
  //     schema,
  //     contextValue,
  //     document: parse(`
  //       mutation TestCreateNotes($input: CreateNotesInput!) {
  //         createNotes(input: $input) {
  //           node {
  //             id
  //           }
  //         }
  //       }
  //     `),
  //     variableValues: {
  //       input: { content: {} },
  //     },
  //   })
  //   const { id } = created.data!.createNotes.node

  //   const document = parse(`
  //     mutation TestAddNoteEdge($input: AddNotesAllEdgeInput!) {
  //       addNotesAllEdge(input: $input) {
  //         edge {
  //           cursor
  //         }
  //       }
  //     }`)

  //   const toAdd = [
  //     { date: '2021-01-06T14:32:00.000Z', text: 'hello first', title: 'first' },
  //     { date: '2021-01-06T14:33:00.000Z', text: 'hello second', title: 'second' },
  //     { date: '2021-01-06T14:34:00.000Z', text: 'hello third', title: 'third' },
  //   ]
  //   for (const content of toAdd) {
  //     await execute({
  //       schema,
  //       contextValue,
  //       document,
  //       variableValues: { input: { id, content } },
  //     })
  //   }

  //   await expect(
  //     execute({
  //       schema,
  //       contextValue,
  //       document: parse(`
  //         query TestReadNotes($id: ID!) {
  //           node(id: $id) {
  //             ...on Notes {
  //               all(first: 3) {
  //                 edges {
  //                   node {
  //                     date
  //                     text
  //                     title
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       `),
  //       variableValues: { id },
  //     })
  //   ).resolves.toMatchSnapshot()
  // })
})
