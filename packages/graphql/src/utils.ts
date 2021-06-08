import type { LoadResult } from '@ceramicstudio/append-collection'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import type { GraphQLDocSetRecords } from '@ceramicstudio/idx-graphql-types'
import { pascalCase } from 'change-case'
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInterfaceType,
} from 'graphql'
import {
  connectionArgs,
  connectionDefinitions,
  fromGlobalId,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay'
import type { Connection, ConnectionArguments } from 'graphql-relay'

import type { Context } from './context'

const SCALARS = {
  boolean: GraphQLBoolean,
  float: GraphQLFloat,
  integer: GraphQLInt,
  string: GraphQLString,
}
const SCALAR_FIELDS = Object.keys(SCALARS)

export function createGlobalId(typeName: string): GraphQLFieldConfigMap<TileDocument, Context> {
  return {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (doc): string => toGlobalId(typeName, doc.id.toString()),
    },
  }
}

export function createGraphQLSchema(records: GraphQLDocSetRecords): GraphQLSchema {
  const inputObjects: Record<string, GraphQLInputObjectType> = {}
  const mutations: Record<string, GraphQLFieldConfig<any, any>> = {}
  const types: Record<string, GraphQLObjectType> = {}

  const resolveType = (doc: TileDocument): GraphQLObjectType<any, Context> | null => {
    const { schema } = doc.metadata
    if (schema == null) {
      return null
    }
    const name = records.nodes[schema]
    if (name == null) {
      return null
    }
    return types[name] ?? null
  }

  const { nodeInterface, nodeField } = nodeDefinitions(async (globalId: string, ctx: Context) => {
    const { id } = fromGlobalId(globalId)
    return await ctx.loadDoc(id)
  }, resolveType)

  const nodes = Object.entries(records.nodes).reduce((acc, [schema, name]) => {
    acc[name] = { interfaces: [nodeInterface], schema }
    return acc
  }, {} as Record<string, { interfaces: Array<GraphQLInterfaceType>; schema: string }>)

  for (const [name, fields] of Object.entries(records.objects)) {
    const node = nodes[name]

    inputObjects[name] = new GraphQLInputObjectType({
      name: `${name}Input`,
      fields: (): GraphQLInputFieldConfigMap => {
        return Object.entries(fields).reduce((acc, [key, field]) => {
          let type
          if (field.type === 'reference') {
            type = GraphQLID
          } else if (field.type === 'object') {
            type = inputObjects[field.name]
          } else if (field.type === 'list') {
            const listItem = records.lists[field.name]
            type = new GraphQLList(inputObjects[listItem])
          } else if (SCALAR_FIELDS.includes(field.type)) {
            type = SCALARS[field.type]
          } else {
            throw new Error(`Unsupported field type ${field.type}`)
          }
          if (type != null) {
            acc[key] = { type: field.required ? new GraphQLNonNull(type) : type }
          }
          return acc
        }, {} as GraphQLInputFieldConfigMap)
      },
    })

    types[name] = new GraphQLObjectType<TileDocument>({
      name,
      interfaces: node?.interfaces,
      fields: (): GraphQLFieldConfigMap<TileDocument, Context> => {
        return Object.entries(fields).reduce(
          (acc, [key, field]) => {
            if (field.type === 'reference') {
              const ref = records.references[field.name] as any
              if (ref.type === 'collection') {
                const typeName = records.collections[ref.schema]
                const collectionType = types[`${typeName}Collection`]
                if (collectionType == null) {
                  throw new Error(`No collection defined for alias: ${typeName}`)
                }
                acc[key] = {
                  type: field.required ? new GraphQLNonNull(collectionType) : collectionType,
                  args: connectionArgs,
                  resolve: async (doc, args, ctx): Promise<Connection<any> | null> => {
                    const id = doc.content?.[key]?.id as string | undefined
                    return id ? await ctx.loadConnection(id, args) : null
                  },
                }
              } else if (ref.type === 'node') {
                // TODO: support union type when multiple schemas
                const typeName = records.nodes[ref.schemas[0]]
                const type = types[typeName]
                acc[key] = {
                  type: field.required ? new GraphQLNonNull(type) : type,
                  resolve: async (doc, _args, ctx): Promise<TileDocument | null> => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const id = doc.content?.[key]?.id as string | undefined
                    return id ? await ctx.loadDoc(id) : null
                  },
                }
                acc[`${key}ID`] = {
                  type: field.required ? new GraphQLNonNull(GraphQLID) : GraphQLID,
                  resolve: (doc, _args): string | null => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const id = doc.content?.[key]?.id as string | undefined
                    return id ? toGlobalId(typeName, id) : null
                  },
                }
              } else {
                throw new Error(`Unsupported reference type: ${ref.type}`)
              }
            } else {
              let type
              if (field.type === 'object') {
                type = types[field.name]
              } else if (field.type === 'list') {
                const listItem = records.lists[field.name]
                type = new GraphQLList(types[listItem])
              } else if (SCALAR_FIELDS.includes(field.type)) {
                type = SCALARS[field.type]
              } else {
                throw new Error(`Unsupported field type ${field.type}`)
              }

              if (type != null) {
                acc[key] = {
                  type: field.required ? new GraphQLNonNull(type) : type,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  resolve: (doc: TileDocument): any => doc.content?.[key],
                }
              }
            }
            return acc
          },
          node ? createGlobalId(name) : {}
        )
      },
    })

    if (node != null) {
      mutations[`create${name}`] = mutationWithClientMutationId({
        name: `Create${name}`,
        inputFields: () => ({
          object: { type: new GraphQLNonNull(inputObjects[name]) },
        }),
        outputFields: () => ({
          node: { type: new GraphQLNonNull(types[name]) },
        }),
        mutateAndGetPayload: async (input: { object: Record<string, any> }, ctx: Context) => {
          if (ctx.ceramic.did == null || !ctx.ceramic.did.authenticated) {
            throw new Error('Ceramic instance is not authenticated')
          }
          return { node: await ctx.createDoc(node.schema, input.object) }
        },
      })

      mutations[`update${name}`] = mutationWithClientMutationId({
        name: `Update${name}`,
        inputFields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          object: { type: new GraphQLNonNull(inputObjects[name]) },
        }),
        outputFields: () => ({
          node: { type: new GraphQLNonNull(types[name]) },
        }),
        mutateAndGetPayload: async (
          input: { id: string; object: Record<string, any> },
          ctx: Context
        ) => {
          const { id } = fromGlobalId(input.id)
          const doc = await ctx.loadDoc(id)
          await doc.update(input.object)
          return { node: doc }
        },
      })
    }
  }

  const indexFields: GraphQLFieldConfigMap<any, any> = {}
  for (const [key, definition] of Object.entries(records.index)) {
    const name = records.nodes[definition.schema]
    indexFields[key] = {
      type: types[name],
      resolve: async (
        _,
        { did }: { did?: string },
        ctx: Context
      ): Promise<Record<string, any> | null> => {
        return await ctx.idx.getRecordDocument(definition.id, did)
      },
    }

    const definitionKey = pascalCase(key)
    mutations[`set${definitionKey}`] = mutationWithClientMutationId({
      name: `Set${definitionKey}`,
      inputFields: () => ({
        object: { type: new GraphQLNonNull(inputObjects[name]) },
      }),
      outputFields: () => ({}),
      mutateAndGetPayload: async (input: { object: Record<string, any> }, ctx: Context) => {
        await ctx.idx.set(key, input.object)
        return {}
      },
    })
  }

  for (const name of Object.values(records.collections)) {
    const nodeType = types[name]
    if (nodeType == null) {
      throw new Error(`Missing node type for collection: ${name}`)
    }
    const { connectionType, edgeType } = connectionDefinitions({ nodeType })
    types[`${name}Connection`] = connectionType
    types[`${name}Edge`] = edgeType
  }

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: Object.entries(records.roots).reduce(
      (acc, [key, { id, schema }]) => {
        const name = records.nodes[schema]
        acc[key] = {
          type: new GraphQLNonNull(types[name]),
          resolve: async (_self, _args, ctx: Context): Promise<any> => {
            return await ctx.loadDoc(id)
          },
        }
        return acc
      },
      {
        index: {
          type: new GraphQLNonNull(new GraphQLObjectType({ name: 'Index', fields: indexFields })),
          args: {
            did: { type: GraphQLString },
          },
          resolve: (_, args): { did?: string } => args,
        },
        node: nodeField,
      } as GraphQLFieldConfigMap<any, any>
    ),
  })

  const mutation = new GraphQLObjectType({ name: 'Mutation', fields: mutations })

  return new GraphQLSchema({ query, mutation })
}

export function toConnection<T>(args: ConnectionArguments, result: LoadResult<T>): Connection<T> {
  const edges = result.items.map((item) => ({
    cursor: item.cursor.toString(),
    node: item.data,
  }))

  const firstCursor = edges[0]?.cursor
  const lastCursor = edges[edges.length - 1]?.cursor
  const pageInfo = args.first
    ? {
        startCursor: firstCursor,
        endCursor: lastCursor,
        hasNextPage: result.hasMore,
        hasPreviousPage: args.after != null,
      }
    : {
        startCursor: lastCursor,
        endCursor: firstCursor,
        hasNextPage: args.before != null,
        hasPreviousPage: result.hasMore,
      }

  return { edges, pageInfo }
}
