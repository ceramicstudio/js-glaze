import type { StreamMetadata } from '@ceramicnetwork/common'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import type { GraphQLModel } from '@glazed/graphql-types'
import { pascalCase } from 'change-case'
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  type GraphQLFieldConfigMap,
  type GraphQLInputFieldConfigMap,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  assertValidSchema,
} from 'graphql'
import {
  type Connection,
  type ConnectionArguments,
  connectionArgs,
  connectionDefinitions,
  fromGlobalId,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay'

import type { Context } from './context.js'

const SCALARS = {
  boolean: GraphQLBoolean,
  float: GraphQLFloat,
  integer: GraphQLInt,
  string: GraphQLString,
}
const SCALAR_FIELDS = Object.keys(SCALARS)

type StoreMutationOptions = {
  merge?: boolean
}

const storeMutationOptions = new GraphQLInputObjectType({
  name: 'DataStoreMutationOptions',
  fields: {
    merge: {
      type: GraphQLBoolean,
    },
  },
})

const streamMetadata = new GraphQLObjectType<StreamMetadata, Context>({
  name: 'StreamMetadata',
  fields: {
    controllers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
    },
    schema: {
      type: GraphQLString,
    },
    family: {
      type: GraphQLString,
    },
    tags: {
      type: new GraphQLList(GraphQLString),
    },
  },
})

function sortedObject<T = Record<string, any>>(input: T): T {
  const keys = Object.keys(input)
  keys.sort()
  return keys.reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    acc[key] = input[key]
    return acc
  }, {}) as T
}

function createDIDObject(dataStore: GraphQLObjectType): GraphQLObjectType<string, Context> {
  return new GraphQLObjectType<string, Context>({
    name: 'DID',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (did) => did,
      },
      isViewer: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: (did, _, ctx) => ctx.authenticated && ctx.viewerID === did,
      },
      store: {
        type: dataStore,
        resolve: (did) => did,
      },
    },
  })
}

function createCeramicMetadataObject(
  didObject: GraphQLObjectType<string, Context>
): GraphQLObjectType<TileDocument, Context> {
  const ceramicMetadata: GraphQLObjectType<TileDocument, Context> = new GraphQLObjectType({
    name: 'CeramicMetadata',
    fields: () => ({
      streamID: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (doc) => doc.id.toString(),
      },
      commitID: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (doc) => doc.commitId.toString(),
      },
      streamMetadata: {
        type: new GraphQLNonNull(streamMetadata),
        resolve: (doc) => doc.metadata,
      },
      controllers: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(didObject))),
        resolve: (doc) => doc.metadata.controllers,
      },
      viewerIsController: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: (doc, _, ctx) => {
          const id = ctx.authenticated && ctx.viewerID
          return id ? doc.metadata.controllers.includes(id) : false
        },
      },
      schema: {
        type: ceramicMetadata,
        resolve: async (doc, _, ctx) => {
          return doc.metadata.schema ? ctx.loadDoc(doc.metadata.schema) : null
        },
      },
    }),
  })
  return ceramicMetadata
}

function createCeramicStreamInterface(
  ceramicMetadata: GraphQLObjectType<TileDocument, Context>
): GraphQLInterfaceType {
  return new GraphQLInterfaceType({
    name: 'CeramicStream',
    fields: () => ({
      _ceramic: {
        type: new GraphQLNonNull(ceramicMetadata),
      },
    }),
  })
}

function createObjectInterfaces(
  ceramicStreamInterface: GraphQLInterfaceType,
  others: Array<GraphQLInterfaceType> = []
): Array<GraphQLInterfaceType> {
  return [ceramicStreamInterface, ...others]
}

function createObjectCommonFields(
  ceramicMetadata: GraphQLObjectType<TileDocument, Context>,
  typeName?: string
): GraphQLFieldConfigMap<TileDocument, Context> {
  const fields: GraphQLFieldConfigMap<TileDocument, Context> = {
    _ceramic: {
      type: new GraphQLNonNull(ceramicMetadata),
    },
  }
  if (typeName != null) {
    fields.id = {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (doc): string => toGlobalId(typeName, doc.id.toString()),
    }
  }
  return fields
}

export type CreateSchemaParams = {
  model: GraphQLModel
  enableMutation?: boolean
  viewerID?: string
}

export function createGraphQLSchema(params: CreateSchemaParams): GraphQLSchema {
  const { model } = params
  const enableMutation = params.enableMutation !== false
  const fallbackViewerID = params.viewerID ?? null

  const inputObjects: Record<string, GraphQLInputObjectType> = {}
  const mutations: Record<string, GraphQLFieldConfig<any, any>> = {}
  const types: Record<string, GraphQLObjectType> = {}

  const { nodeInterface, nodeField } = nodeDefinitions(
    async (globalId: string, ctx: Context) => {
      const { id } = fromGlobalId(globalId)
      return await ctx.loadDoc(id)
    },
    (doc: TileDocument) => {
      return doc.metadata.schema == null ? undefined : model.referenced[doc.metadata.schema]?.name
    }
  )

  const nodes = Object.entries(model.referenced).reduce((acc, [schema, { name, type }]) => {
    if (type === 'object') {
      acc[name] = { interfaces: [nodeInterface], schema }
    }
    return acc
  }, {} as Record<string, { interfaces: Array<GraphQLInterfaceType>; schema: string }>)

  const indexEntries = Object.entries(sortedObject(model.index))

  // DataStore object is model-specific and needed to generate object using it
  const dataStore = new GraphQLObjectType({
    name: 'DataStore',
    fields: () => {
      return indexEntries.reduce((acc, [key, definition]) => {
        const { name } = model.referenced[definition.schema]
        acc[key] = {
          type: types[name],
          resolve: async (
            did,
            _,
            ctx
          ): Promise<TileDocument<Record<string, any> | null | undefined> | null> => {
            return await ctx.dataStore.getRecordDocument(definition.id, did)
          },
        }
        return acc
      }, {} as GraphQLFieldConfigMap<string, Context>)
    },
  })
  const didObject = createDIDObject(dataStore)
  const ceramicMetadata = createCeramicMetadataObject(didObject)
  const ceramicStreamInterface = createCeramicStreamInterface(ceramicMetadata)

  for (const [name, { fields }] of Object.entries(sortedObject(model.objects))) {
    const node = nodes[name]

    inputObjects[name] = new GraphQLInputObjectType({
      name: `${name}Input`,
      fields: (): GraphQLInputFieldConfigMap => {
        return Object.entries(fields).reduce((acc, [key, field]) => {
          let type
          if (field.type === 'reference') {
            const ref = model.referenced[field.schemas[0]]
            if (ref.type === 'object') {
              type = GraphQLID
            }
          } else if (field.type === 'object') {
            type = inputObjects[field.name]
          } else if (field.type === 'list') {
            const listItem = model.lists[field.name]
            if (listItem.type === 'object') {
              type = new GraphQLList(inputObjects[listItem.name])
            } else if (listItem.type === 'reference') {
              type = new GraphQLList(GraphQLID)
            } else if (listItem.type === 'did') {
              type = new GraphQLList(GraphQLID)
            } else if (SCALAR_FIELDS.includes(listItem.type)) {
              type = new GraphQLList(SCALARS[listItem.type])
            }
          } else if (field.type === 'did') {
            type = GraphQLID
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
      interfaces: createObjectInterfaces(ceramicStreamInterface, node?.interfaces),
      fields: (): GraphQLFieldConfigMap<TileDocument, Context> => {
        return Object.entries(fields).reduce((acc, [key, field]) => {
          if (field.type === 'reference') {
            const ref = model.referenced[field.schemas[0]]
            // if (ref.type === 'collection') {
            //   const { item } = model.collections[ref.name]
            //   let nodeType
            //   if (item.type === 'object') {
            //     nodeType = types[item.name]
            //   } else if (item.type === 'reference') {
            //     const nodeRef = model.referenced[item.schemas[0]]
            //     nodeType = types[nodeRef.name]
            //   } else if (SCALAR_FIELDS.includes(item.type)) {
            //     nodeType = SCALARS[item.type]
            //   }
            //   if (nodeType == null) {
            //     throw new Error(`Missing node type for collection: ${name}`)
            //   }
            //   const connectionType = types[`${nodeType.name}Connection`]
            //   if (connectionType == null) {
            //     throw new Error(`No connection defined for node: ${nodeType.name}`)
            //   }
            //   acc[key] = {
            //     type: field.required ? new GraphQLNonNull(connectionType) : connectionType,
            //     args: connectionArgs,
            //     resolve: async (
            //       doc,
            //       args: ConnectionArguments,
            //       ctx
            //     ): Promise<Connection<any> | null> => {
            //       const id = doc.content[key] as string | undefined
            //       if (id == null) {
            //         return null
            //       }
            //       const handler =
            //         item.type === 'reference'
            //           ? await ctx.getReferenceConnection(id, item.schemas[0])
            //           : await ctx.getItemConnection(id)
            //       return await handler.load(args)
            //     },
            //   }
            // } else
            if (ref.type === 'object') {
              // TODO: support union type when multiple schemas
              const typeName = ref.name
              const type = types[typeName]
              acc[key] = {
                type: field.required ? new GraphQLNonNull(type) : type,
                resolve: async (doc, _args, ctx): Promise<TileDocument | null> => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const id = doc.content[key].id as string | undefined
                  return id ? await ctx.loadDoc(id) : null
                },
              }
              acc[`${key}ID`] = {
                type: field.required ? new GraphQLNonNull(GraphQLID) : GraphQLID,
                resolve: (doc): string | null => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const id = doc.content[key].id as string | undefined
                  return id ? toGlobalId(typeName, id) : null
                },
              }
            } else {
              throw new Error(`Unsupported reference type: ${ref.type as string}`)
            }
          } else {
            let type
            if (field.type === 'object') {
              type = types[field.name]
            } else if (field.type === 'list') {
              const listItem = model.lists[field.name]
              if (listItem.type === 'object') {
                type = new GraphQLList(types[listItem.name])
              } else if (listItem.type === 'reference') {
                const nodeRef = model.referenced[listItem.schemas[0]]
                const nodeType = types[nodeRef.name]
                if (nodeType == null) {
                  throw new Error(`Missing node type for reference: ${field.name}`)
                }
                const connectionType = types[`${nodeType.name}Connection`]
                if (connectionType == null) {
                  throw new Error(`No connection defined for node: ${nodeType.name}`)
                }
                acc[`${key}Connection`] = {
                  type: field.required ? new GraphQLNonNull(connectionType) : connectionType,
                  args: connectionArgs,
                  resolve: async (
                    doc,
                    args: ConnectionArguments,
                    ctx
                  ): Promise<Connection<any> | null> => {
                    const list = doc.content[key] as Array<string> | undefined
                    return list ? await ctx.loadListConnection(list, args) : null
                  },
                }
                acc[`${key}NodeIDs`] = {
                  type: field.required
                    ? new GraphQLNonNull(new GraphQLList(GraphQLID))
                    : new GraphQLList(GraphQLID),
                  resolve: (doc): Array<string> | null => {
                    const list = doc.content[key] as Array<string> | undefined
                    return list ? list.map((id) => toGlobalId(nodeRef.name, id)) : null
                  },
                }
                type = new GraphQLList(GraphQLString)
              } else if (listItem.type === 'did') {
                type = new GraphQLList(didObject)
              } else if (SCALAR_FIELDS.includes(listItem.type)) {
                type = new GraphQLList(SCALARS[listItem.type])
              } else {
                throw new Error(`Unsupported list item type ${listItem.type}`)
              }
            } else if (field.type === 'did') {
              type = didObject
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
        }, createObjectCommonFields(ceramicMetadata, node ? name : undefined))
      },
    })

    if (enableMutation && node != null) {
      mutations[`create${name}`] = mutationWithClientMutationId({
        name: `Create${name}`,
        inputFields: () => ({
          content: { type: new GraphQLNonNull(inputObjects[name]) },
        }),
        outputFields: () => ({
          node: { type: new GraphQLNonNull(types[name]) },
        }),
        mutateAndGetPayload: async (input: { content: Record<string, any> }, ctx: Context) => {
          if (ctx.ceramic.did == null || !ctx.ceramic.did.authenticated) {
            throw new Error('Ceramic instance is not authenticated')
          }
          return { node: await ctx.createDoc(node.schema, input.content) }
        },
      })

      mutations[`update${name}`] = mutationWithClientMutationId({
        name: `Update${name}`,
        inputFields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          content: { type: new GraphQLNonNull(inputObjects[name]) },
        }),
        outputFields: () => ({
          node: { type: new GraphQLNonNull(types[name]) },
        }),
        mutateAndGetPayload: async (
          input: { id: string; content: Record<string, any> },
          ctx: Context
        ) => {
          const { id } = fromGlobalId(input.id)
          return { node: await ctx.updateDoc(id, input.content) }
        },
      })
    }
  }

  for (const [listName, item] of Object.entries(sortedObject(model.lists))) {
    if (item.type !== 'reference') {
      continue
    }

    // Find matching node type for reference
    const refSchema = item.schemas[0]
    const ref = model.referenced[refSchema]
    const nodeType = types[ref.name]
    if (nodeType == null) {
      throw new Error(`Missing node type for list reference: ${listName}`)
    }

    // Find list field in object owning it
    const owningObject = model.objects[item.owner]
    const field = Object.keys(owningObject.fields).find((key) => {
      const data = owningObject.fields[key]
      return data.type === 'list' && data.name === listName
    })
    if (field == null) {
      throw new Error(`Reference field not found for ${listName}`)
    }

    const name = nodeType.name
    const { connectionType, edgeType } = connectionDefinitions({ nodeType })
    types[`${name}Connection`] = connectionType
    types[`${name}Edge`] = edgeType

    if (enableMutation) {
      mutations[`add${listName}Edge`] = mutationWithClientMutationId({
        name: `Add${listName}Edge`,
        inputFields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          content: { type: new GraphQLNonNull(inputObjects[name]) },
        }),
        outputFields: () => ({
          node: { type: new GraphQLNonNull(types[item.owner]) },
          edge: { type: new GraphQLNonNull(edgeType) },
        }),
        mutateAndGetPayload: async (
          input: { id: string; content: Record<string, any> },
          ctx: Context
        ) => {
          const { id } = fromGlobalId(input.id)
          const { edges, node } = await ctx.addListConnectionEdges(id, field, refSchema, [
            input.content,
          ])
          return { edge: edges[0], node }
        },
      })

      const indexKey = Object.keys(model.index).find((key) => {
        const data = model.index[key]
        const indexRef = model.referenced[data.schema]
        return indexRef?.name === item.owner
      })
      if (indexKey != null) {
        const indexName = pascalCase(`${indexKey}${listName}`)
        mutations[`add${indexName}Edge`] = mutationWithClientMutationId({
          name: `Add${indexName}Edge`,
          inputFields: () => ({
            content: { type: new GraphQLNonNull(inputObjects[name]) },
          }),
          outputFields: () => ({
            viewer: {
              type: new GraphQLNonNull(didObject),
              resolve: (_self, _args, ctx: Context): string => ctx.viewerID as string,
            },
            edge: { type: new GraphQLNonNull(edgeType) },
          }),
          mutateAndGetPayload: async (input: { content: Record<string, any> }, ctx: Context) => {
            const ownerID = await ctx.getRecordID(indexKey)
            const { edges } = await ctx.addListConnectionEdges(ownerID, field, refSchema, [
              input.content,
            ])
            return { edge: edges[0] }
          },
        })
      }
    }
  }

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: Object.entries(sortedObject(model.roots)).reduce(
      (acc, [key, { id, schema }]) => {
        const { name } = model.referenced[schema]
        acc[key] = {
          type: new GraphQLNonNull(types[name]),
          resolve: async (_self, _args, ctx): Promise<any> => {
            return await ctx.loadDoc(id)
          },
        }
        return acc
      },
      {
        node: nodeField,
        account: {
          type: new GraphQLNonNull(didObject),
          args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
          },
          resolve: (_, args: { id: string }): string => args.id,
        },
        viewer: {
          type: didObject,
          resolve: (_self, _args, ctx): string | null => ctx.viewerID ?? fallbackViewerID,
        },
      } as GraphQLFieldConfigMap<any, Context>
    ),
  })

  const schemaFields: Record<string, GraphQLObjectType> = { query }

  if (enableMutation) {
    for (const [key, definition] of indexEntries) {
      const { name } = model.referenced[definition.schema]
      const definitionKey = pascalCase(key)

      mutations[`set${definitionKey}`] = mutationWithClientMutationId({
        name: `Set${definitionKey}`,
        inputFields: () => ({
          content: { type: new GraphQLNonNull(inputObjects[name]) },
          options: { type: storeMutationOptions },
        }),
        outputFields: () => ({
          viewer: {
            type: new GraphQLNonNull(didObject),
            resolve: (_self, _args, ctx: Context): string => ctx.viewerID as string,
          },
        }),
        mutateAndGetPayload: async (
          input: { content: Record<string, any>; options?: StoreMutationOptions },
          ctx: Context
        ) => {
          input.options?.merge
            ? await ctx.dataStore.merge(definition.id, input.content)
            : await ctx.dataStore.set(definition.id, input.content)
          return {}
        },
      })
    }
    schemaFields.mutation = new GraphQLObjectType({ name: 'Mutation', fields: mutations })
  }

  const schema = new GraphQLSchema(schemaFields)
  assertValidSchema(schema)
  return schema
}
