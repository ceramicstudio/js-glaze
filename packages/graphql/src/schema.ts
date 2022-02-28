import type { StreamMetadata } from '@ceramicnetwork/common'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import type {
  GraphFieldReference,
  GraphModel,
  GraphObjectFields,
  GraphTileEntry,
} from '@glazed/types'
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

type CeramicTypes = {
  storeObject: GraphQLObjectType<string, Context>
  didObject: GraphQLObjectType<string, Context>
  metadataObject: GraphQLObjectType<TileDocument, Context>
  streamInterface: GraphQLInterfaceType
}

type NodeType = { interfaces: Array<GraphQLInterfaceType>; schema: string }

type BuildObjectParams = {
  name: string
  node: NodeType
  fields: GraphObjectFields
  ceramic: CeramicTypes
}

type BuildReferenceListParams = {
  listName: string
  refItem: GraphFieldReference
  ceramic: CeramicTypes
}

type BuildConnectionMutationsCommonParams = {
  listName: string
  listField: string
  objectName: string
  objectSchema: string
  ceramic: CeramicTypes
}

type StoreMutationOptions = {
  replace?: boolean
}

const storeMutationOptions = new GraphQLInputObjectType({
  name: 'DataStoreMutationOptions',
  fields: {
    replace: {
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
  model: GraphModel
  enableMutation?: boolean
  viewerID?: string
}

class SchemaBuilder {
  // Source model
  #model: GraphModel
  // Schema options
  #enableMutation: boolean
  #fallbackViewerID: string | null
  // Internal records
  #inputObjects: Record<string, GraphQLInputObjectType> = {}
  #mutations: Record<string, GraphQLFieldConfig<any, Context>> = {}
  #types: Record<string, GraphQLObjectType> = {}
  #nodes: Record<string, NodeType> = {}
  #nodeField: GraphQLFieldConfig<any, Context>
  #ceramicTypes: CeramicTypes | null = null

  constructor(params: CreateSchemaParams) {
    this.#model = params.model
    this.#enableMutation = params.enableMutation !== false
    this.#fallbackViewerID = params.viewerID ?? null

    const { nodeInterface, nodeField } = nodeDefinitions(
      async (globalId: string, ctx: Context) => {
        const { id } = fromGlobalId(globalId)
        return await ctx.loadDoc(id)
      },
      (doc: TileDocument) => {
        return doc.metadata.schema == null
          ? undefined
          : this.#model.referenced[doc.metadata.schema]?.name
      }
    )
    this.#nodeField = nodeField

    for (const [schema, { name, type }] of Object.entries(this.#model.referenced)) {
      if (type === 'object') {
        this.#nodes[name] = { interfaces: [nodeInterface], schema }
      }
    }
  }

  // TODO: should options be here? Would allow multiple build with different options
  // Need to make sure processed computations are cached
  build(): GraphQLSchema {
    const indexEntries = Object.entries(sortedObject(this.#model.index))
    const ceramic = this.#ceramicTypes ?? this._createCeramicTypes({ indexEntries })
    this._buildObjects({ ceramic })
    this._buildReferenceLists({ ceramic })
    const schema = this._createSchema({ ceramic, indexEntries })
    assertValidSchema(schema)
    return schema
  }

  _createCeramicTypes({
    indexEntries,
  }: {
    indexEntries: Array<[string, GraphTileEntry]>
  }): CeramicTypes {
    // DataStore object is model-specific and needed to generate object using it
    const storeObject = new GraphQLObjectType({
      name: 'DataStore',
      fields: () => {
        return indexEntries.reduce((acc, [key, definition]) => {
          const { name } = this.#model.referenced[definition.schema]
          acc[key] = {
            type: this.#types[name],
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
    const didObject = createDIDObject(storeObject)
    const metadataObject = createCeramicMetadataObject(didObject)
    const streamInterface = createCeramicStreamInterface(metadataObject)

    const types = { storeObject, didObject, metadataObject, streamInterface }
    this.#ceramicTypes = types
    return types
  }

  _buildObjects({ ceramic }: { ceramic: CeramicTypes }) {
    for (const [name, { fields }] of Object.entries(sortedObject(this.#model.objects))) {
      const params: BuildObjectParams = { ceramic, name, fields, node: this.#nodes[name] }
      this._buildObjectType(params)
      if (this.#enableMutation) {
        this._buildInputObjectType(params)
        if (params.node != null) {
          this._buildNodeMutations(params)
        }
      }
    }
  }

  _buildObjectType({ name, node, fields, ceramic }: BuildObjectParams) {
    this.#types[name] = new GraphQLObjectType<TileDocument>({
      name,
      interfaces: createObjectInterfaces(ceramic.streamInterface, node?.interfaces),
      fields: (): GraphQLFieldConfigMap<TileDocument, Context> => {
        return Object.entries(fields).reduce((acc, [key, field]) => {
          if (field.type === 'reference') {
            const ref = this.#model.referenced[field.schemas[0]]
            if (ref.type === 'object') {
              // TODO: support union type when multiple schemas
              const typeName = ref.name
              const type = this.#types[typeName]
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
              type = this.#types[field.name]
            } else if (field.type === 'list') {
              const listItem = this.#model.lists[field.name]
              if (listItem.type === 'object') {
                type = new GraphQLList(this.#types[listItem.name])
              } else if (listItem.type === 'reference') {
                const nodeRef = this.#model.referenced[listItem.schemas[0]]
                const nodeType = this.#types[nodeRef.name]
                if (nodeType == null) {
                  throw new Error(`Missing node type for reference: ${field.name}`)
                }
                const connectionType = this.#types[`${nodeType.name}Connection`]
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
                type = new GraphQLList(ceramic.didObject)
              } else if (SCALAR_FIELDS.includes(listItem.type)) {
                type = new GraphQLList(SCALARS[listItem.type])
              } else {
                throw new Error(`Unsupported list item type ${listItem.type}`)
              }
            } else if (field.type === 'did') {
              type = ceramic.didObject
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
        }, createObjectCommonFields(ceramic.metadataObject, node ? name : undefined))
      },
    })
  }

  _buildInputObjectType({ name, fields }: BuildObjectParams) {
    this.#inputObjects[name] = new GraphQLInputObjectType({
      name: `${name}Input`,
      fields: (): GraphQLInputFieldConfigMap => {
        return Object.entries(fields).reduce((acc, [key, field]) => {
          let type
          if (field.type === 'reference') {
            const ref = this.#model.referenced[field.schemas[0]]
            if (ref.type === 'object') {
              type = GraphQLID
            }
          } else if (field.type === 'object') {
            type = this.#inputObjects[field.name]
          } else if (field.type === 'list') {
            const listItem = this.#model.lists[field.name]
            if (listItem.type === 'object') {
              type = new GraphQLList(this.#inputObjects[listItem.name])
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
  }

  _buildNodeMutations({ name, node }: BuildObjectParams) {
    this.#mutations[`create${name}`] = mutationWithClientMutationId({
      name: `Create${name}`,
      inputFields: () => ({
        content: { type: new GraphQLNonNull(this.#inputObjects[name]) },
      }),
      outputFields: () => ({
        node: { type: new GraphQLNonNull(this.#types[name]) },
      }),
      mutateAndGetPayload: async (input: { content: Record<string, any> }, ctx: Context) => {
        if (ctx.ceramic.did == null || !ctx.ceramic.did.authenticated) {
          throw new Error('Ceramic instance is not authenticated')
        }
        return { node: await ctx.createDoc(node.schema, input.content) }
      },
    })

    this.#mutations[`update${name}`] = mutationWithClientMutationId({
      name: `Update${name}`,
      inputFields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: new GraphQLNonNull(this.#inputObjects[name]) },
      }),
      outputFields: () => ({
        node: { type: new GraphQLNonNull(this.#types[name]) },
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

  _buildReferenceLists({ ceramic }: { ceramic: CeramicTypes }) {
    for (const [listName, refItem] of Object.entries(sortedObject(this.#model.lists))) {
      if (refItem.type === 'reference') {
        this._buildReferenceList({ ceramic, listName, refItem })
      }
    }
  }

  _buildReferenceList({ listName, refItem, ceramic }: BuildReferenceListParams) {
    // Find matching node type for reference
    const objectSchema = refItem.schemas[0]
    const ref = this.#model.referenced[objectSchema]
    const nodeType = this.#types[ref.name]
    if (nodeType == null) {
      throw new Error(`Missing node type for list reference: ${listName}`)
    }

    // Find list field in object owning it
    const ownerName = refItem.owner
    const ownerObject = this.#model.objects[ownerName]
    const listField = Object.keys(ownerObject.fields).find((key) => {
      const data = ownerObject.fields[key]
      return data.type === 'list' && data.name === listName
    })
    if (listField == null) {
      throw new Error(`Reference field not found for ${listName}`)
    }

    // TODO: extract to own method, might be already existing if multiple connections
    const objectName = nodeType.name
    const { connectionType, edgeType } = connectionDefinitions({ nodeType })
    this.#types[`${objectName}Connection`] = connectionType
    this.#types[`${objectName}Edge`] = edgeType

    if (this.#enableMutation) {
      this._buildListConnectionMutations({
        ceramic,
        objectName,
        objectSchema,
        listName,
        listField,
        ownerName: refItem.owner,
      })
    }
  }

  _buildListConnectionMutations({
    ownerName,
    listName,
    listField,
    objectName,
    objectSchema,
    ceramic,
  }: BuildConnectionMutationsCommonParams & { ownerName: string }) {
    this.#mutations[`add${listName}Edge`] = mutationWithClientMutationId({
      name: `Add${listName}Edge`,
      inputFields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: new GraphQLNonNull(this.#inputObjects[objectName]) },
      }),
      outputFields: () => ({
        node: { type: new GraphQLNonNull(this.#types[ownerName]) },
        edge: { type: new GraphQLNonNull(this.#types[`${objectName}Edge`]) },
      }),
      mutateAndGetPayload: async (
        input: { id: string; content: Record<string, any> },
        ctx: Context
      ) => {
        const { id } = fromGlobalId(input.id)
        const { edges, node } = await ctx.addListConnectionEdges(id, listField, objectSchema, [
          input.content,
        ])
        return { edge: edges[0], node }
      },
    })

    const definitionName = Object.keys(this.#model.index).find((key) => {
      const data = this.#model.index[key]
      const indexRef = this.#model.referenced[data.schema]
      return indexRef?.name === ownerName
    })
    if (definitionName != null) {
      this._buildIndexListConnectionMutations({
        definitionName,
        listName,
        listField,
        objectName,
        objectSchema,
        ceramic,
      })
    }
  }

  _buildIndexListConnectionMutations({
    definitionName,
    listName,
    listField,
    objectName,
    objectSchema,
    ceramic,
  }: BuildConnectionMutationsCommonParams & { definitionName: string }) {
    const indexName = pascalCase(`${definitionName}${listName}`)
    this.#mutations[`add${indexName}Edge`] = mutationWithClientMutationId({
      name: `Add${indexName}Edge`,
      inputFields: () => ({
        content: { type: new GraphQLNonNull(this.#inputObjects[objectName]) },
      }),
      outputFields: () => ({
        viewer: {
          type: new GraphQLNonNull(ceramic.didObject),
          resolve: (_self, _args, ctx: Context): string => ctx.viewerID as string,
        },
        edge: { type: new GraphQLNonNull(this.#types[`${objectName}Edge`]) },
      }),
      mutateAndGetPayload: async (input: { content: Record<string, any> }, ctx: Context) => {
        const ownerID = await ctx.getRecordID(definitionName)
        const { edges } = await ctx.addListConnectionEdges(ownerID, listField, objectSchema, [
          input.content,
        ])
        return { edge: edges[0] }
      },
    })
  }

  _createSchema({
    ceramic,
    indexEntries,
  }: {
    ceramic: CeramicTypes
    indexEntries: Array<[string, GraphTileEntry]>
  }) {
    const query = new GraphQLObjectType({
      name: 'Query',
      fields: Object.entries(sortedObject(this.#model.roots)).reduce(
        (acc, [key, { id, schema }]) => {
          const { name } = this.#model.referenced[schema]
          acc[key] = {
            type: new GraphQLNonNull(this.#types[name]),
            resolve: async (_self, _args, ctx): Promise<any> => {
              return await ctx.loadDoc(id)
            },
          }
          return acc
        },
        {
          node: this.#nodeField,
          account: {
            type: new GraphQLNonNull(ceramic.didObject),
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: (_, args: { id: string }): string => args.id,
          },
          viewer: {
            type: ceramic.didObject,
            resolve: (_self, _args, ctx): string | null => ctx.viewerID ?? this.#fallbackViewerID,
          },
        } as GraphQLFieldConfigMap<any, Context>
      ),
    })

    const schemaFields: Record<string, GraphQLObjectType> = { query }

    if (this.#enableMutation) {
      schemaFields.mutation = this._createMutation({ ceramic, indexEntries })
    }

    return new GraphQLSchema(schemaFields)
  }

  _createMutation({
    ceramic,
    indexEntries,
  }: {
    ceramic: CeramicTypes
    indexEntries: Array<[string, GraphTileEntry]>
  }): GraphQLObjectType<any, Context> {
    for (const [key, definition] of indexEntries) {
      const { name } = this.#model.referenced[definition.schema]
      const definitionKey = pascalCase(key)

      this.#mutations[`set${definitionKey}`] = mutationWithClientMutationId({
        name: `Set${definitionKey}`,
        inputFields: () => ({
          content: { type: new GraphQLNonNull(this.#inputObjects[name]) },
          options: { type: storeMutationOptions },
        }),
        outputFields: () => ({
          viewer: {
            type: new GraphQLNonNull(ceramic.didObject),
            resolve: (_self, _args, ctx: Context): string => ctx.viewerID as string,
          },
        }),
        mutateAndGetPayload: async (
          input: { content: Record<string, any>; options?: StoreMutationOptions },
          ctx: Context
        ) => {
          input.options?.replace
            ? await ctx.dataStore.set(definition.id, input.content)
            : await ctx.dataStore.merge(definition.id, input.content)
          return {}
        },
      })
    }

    return new GraphQLObjectType({ name: 'Mutation', fields: this.#mutations })
  }
}

export function createGraphQLSchema(params: CreateSchemaParams): GraphQLSchema {
  return new SchemaBuilder(params).build()
}
