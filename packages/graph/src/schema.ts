import type {
  ModelInstanceDocument,
  RuntimeCompositeDefinition,
  RuntimeList,
  RuntimeObjectFields,
  RuntimeReference,
  RuntimeScalar,
  RuntimeScalarType,
  RuntimeViewField,
} from '@glazed/types'
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
  type GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  assertValidSchema,
} from 'graphql'
import {
  type Connection,
  type ConnectionArguments,
  connectionArgs,
  connectionDefinitions,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay'
import { GraphQLDID } from 'graphql-scalars'

import type { Context } from './context.js'
import { CeramicStreamReference } from './scalars.js'

const SCALARS: Record<RuntimeScalarType, GraphQLScalarType> = {
  boolean: GraphQLBoolean,
  did: GraphQLDID,
  float: GraphQLFloat,
  id: GraphQLID,
  integer: GraphQLInt,
  streamref: CeramicStreamReference,
  string: GraphQLString,
}
const SCALAR_FIELDS = Object.keys(SCALARS)

type GraphQLNodeDefinitions = {
  nodeInterface: GraphQLInterfaceType
  nodeField: GraphQLFieldConfig<unknown, Context>
  nodesField: GraphQLFieldConfig<unknown, Context>
}
type SharedDefinitions = GraphQLNodeDefinitions & {
  accountObject: GraphQLObjectType<string, Context>
  accountDataObject: GraphQLObjectType<string, Context>
}

type BuildObjectParams = {
  name: string
  fields: RuntimeObjectFields
  definitions: SharedDefinitions
}

function createCeramicAccountObject(
  accountDataObject: GraphQLObjectType
): GraphQLObjectType<string, Context> {
  return new GraphQLObjectType<string, Context>({
    name: 'CeramicAccount',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLDID),
        resolve: (did) => did,
      },
      isViewer: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: (did, _, ctx) => ctx.authenticated && ctx.viewerID === did,
      },
      data: {
        type: new GraphQLNonNull(accountDataObject),
        resolve: (did) => did,
      },
    },
  })
}

export type CreateSchemaParams = {
  definition: RuntimeCompositeDefinition
  readonly?: boolean
}

class SchemaBuilder {
  // Source composite
  #def: RuntimeCompositeDefinition
  // Schema options
  #isReadonly: boolean
  // Internal records
  #types: Record<string, GraphQLObjectType> = {}
  #inputObjects: Record<string, GraphQLInputObjectType> = {}
  #mutations: Record<string, GraphQLFieldConfig<any, Context>> = {}

  constructor(params: CreateSchemaParams) {
    this.#def = params.definition
    this.#isReadonly = !!params.readonly
  }

  build(): GraphQLSchema {
    const definitions = this._createSharedDefinitions()
    const connections = this._buildObjects(definitions)
    this._buildConnections(connections)
    const schema = this._createSchema(definitions)
    assertValidSchema(schema)
    return schema
  }

  _createSharedDefinitions(): SharedDefinitions {
    const modelAliases = Object.entries(this.#def.models).reduce((aliases, [alias, id]) => {
      aliases[id] = alias
      return aliases
    }, {} as Record<string, string>)

    const nodeDefs = nodeDefinitions(
      async (id: string, ctx: Context) => await ctx.loadDoc(id),
      (doc: ModelInstanceDocument) => modelAliases[doc.metadata.model?.toString() as string]
    )

    // AccountData object is model-specific and needed to generate object using it
    const accountDataObject = new GraphQLObjectType({
      name: 'CeramicAccountData',
      fields: () => {
        const config: GraphQLFieldConfigMap<string, Context> = {}
        for (const [alias, reference] of Object.entries(this.#def.accountData ?? {})) {
          const model = this.#def.models[reference.name]
          if (model == null) {
            throw new Error(`Missing model for reference name: ${reference.name}`)
          }

          if (reference.type === 'model') {
            config[alias] = {
              type: this.#types[reference.name],
              resolve: async (account, _, ctx): Promise<ModelInstanceDocument | null> => {
                return await ctx.querySingle({ account, model })
              },
            }
          } else if (reference.type === 'collection') {
            config[alias] = {
              type: this.#types[reference.name],
              args: connectionArgs,
              resolve: async (
                account,
                args: ConnectionArguments,
                ctx
              ): Promise<Connection<ModelInstanceDocument> | null> => {
                return await ctx.queryConnection({ ...args, account, model })
              },
            }
          } else {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new Error(`Unsupported reference type: ${reference.type}`)
          }
        }
        return config
      },
    })

    return {
      ...nodeDefs,
      accountDataObject,
      accountObject: createCeramicAccountObject(accountDataObject),
    }
  }

  _buildObjects(definitions: SharedDefinitions): Set<string> {
    const connections = Object.entries(this.#def.objects).flatMap(([name, fields]) => {
      return this._buildObjectType({ definitions, name, fields })
    })
    return new Set(connections)
  }

  _buildObjectType({ definitions, name, fields }: BuildObjectParams): Array<string> {
    const modelID = this.#def.models[name]

    this.#types[name] = new GraphQLObjectType<ModelInstanceDocument>({
      name,
      interfaces: modelID ? [definitions.nodeInterface] : [],
      fields: () => {
        const config: GraphQLFieldConfigMap<ModelInstanceDocument, Context> = {}
        if (modelID != null) {
          config.id = {
            // Use GraphQLID rather than CeramicStreamReference here for Relay compliance
            type: new GraphQLNonNull(GraphQLID),
            resolve: (doc) => doc.id.toString(),
          }
        }
        for (const [key, field] of Object.entries(fields)) {
          switch (field.type) {
            case 'reference':
              config[key] = this._buildObjectReferenceField(key, field)
              break
            case 'list':
              config[key] = this._buildObjectListField(definitions, key, field)
              break
            case 'view':
              config[key] = this._buildObjectViewField(definitions, field)
              break
            default:
              config[key] = this._buildObjectScalarField(definitions, key, field)
          }
        }
        return config
      },
    })

    if (!this.#isReadonly) {
      this._buildInputObjectType(name, fields)
      if (modelID != null) {
        this._buildNodeMutations(name, modelID)
      }
    }

    const connections: Array<string> = []
    for (const field of Object.values(fields)) {
      if (field.type === 'reference' && field.refType === 'connection') {
        connections.push(field.refName)
      }
    }
    return connections
  }

  _buildConnections(objectNames: Set<string>) {
    for (const objectName of objectNames) {
      const nodeType = this.#types[objectName]
      if (nodeType == null) {
        throw new Error(`Missing object type for connection: ${objectName}`)
      }
      const { connectionType, edgeType } = connectionDefinitions({ nodeType })
      this.#types[`${objectName}Connection`] = connectionType
      this.#types[`${objectName}Edge`] = edgeType
    }
  }

  _buildObjectReferenceField(
    key: string,
    field: RuntimeReference
  ): GraphQLFieldConfig<ModelInstanceDocument, Context> {
    const name = field.refType === 'connection' ? field.refName + 'Connection' : field.refName
    const ref = this.#types[name]
    if (ref == null) {
      throw new Error(`Missing type: ${name}`)
    }
    const type = field.required ? new GraphQLNonNull(ref) : ref

    switch (field.refType) {
      case 'connection':
        return {
          type,
          args: connectionArgs,
          resolve: (_doc, _args: ConnectionArguments, _ctx): Promise<Connection<any> | null> => {
            throw new Error('Not implemented')
          },
        }
      case 'node':
        return {
          type,
          args: connectionArgs,
          resolve: async (doc, _, ctx): Promise<ModelInstanceDocument | null> => {
            return await ctx.loadDoc(doc.content[key] as string)
          },
        }
      case 'object':
        return { type, resolve: (doc) => doc.content[key] as unknown }
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unsupported reference type: ${field.refType}`)
    }
  }

  _buildObjectListField(
    definitions: SharedDefinitions,
    key: string,
    field: RuntimeList
  ): GraphQLFieldConfig<ModelInstanceDocument, Context> {
    let itemType
    if (field.item.type === 'reference') {
      itemType = this.#types[field.item.refName]
      if (itemType == null) {
        throw new Error(`Missing referenced object type: ${field.item.refName}`)
      }
    } else if (field.item.type === 'did') {
      itemType = definitions.accountObject
    } else if (SCALAR_FIELDS.includes(field.item.type)) {
      itemType = SCALARS[field.item.type]
    } else {
      throw new Error(`Unsupported list item type: ${field.item.type}`)
    }

    if (field.item.required) {
      itemType = new GraphQLNonNull(itemType)
    }
    const type = new GraphQLList(itemType)

    return {
      type: field.required ? new GraphQLNonNull(type) : type,
      resolve: (doc): unknown => doc.content?.[key],
    }
  }

  _buildObjectViewField(
    definitions: SharedDefinitions,
    field: RuntimeViewField
  ): GraphQLFieldConfig<ModelInstanceDocument, Context> {
    if (field.viewType === 'documentAccount') {
      return {
        type: new GraphQLNonNull(definitions.accountObject),
        resolve: (doc): string => doc.metadata.controller as string,
      }
    }
    if (field.viewType === 'documentVersion') {
      return {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (doc): string => doc.commitId.toString(),
      }
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported view type: ${field.viewType}`)
  }

  _buildObjectScalarField(
    definitions: SharedDefinitions,
    key: string,
    field: RuntimeScalar
  ): GraphQLFieldConfig<ModelInstanceDocument, Context> {
    let type
    if (field.type === 'did') {
      type = definitions.accountObject
    } else if (SCALAR_FIELDS.includes(field.type)) {
      type = SCALARS[field.type]
    } else {
      throw new Error(`Unsupported scalar type: ${field.type}`)
    }

    return {
      type: field.required ? new GraphQLNonNull(type) : type,
      resolve: (doc): unknown => doc.content?.[key],
    }
  }

  _buildInputObjectType(name: string, fields: RuntimeObjectFields) {
    this.#inputObjects[name] = new GraphQLInputObjectType({
      name: `${name}Input`,
      fields: (): GraphQLInputFieldConfigMap => {
        const config: GraphQLInputFieldConfigMap = {}
        for (const [key, field] of Object.entries(fields)) {
          let type
          switch (field.type) {
            case 'view':
              // Views can't be set in inputs
              continue
            case 'reference':
              switch (field.refType) {
                case 'connection':
                  // Ignore connections from inputs, should be derived
                  continue
                case 'node':
                  type = GraphQLID
                  break
                case 'object': {
                  type = this.#inputObjects[field.refName]
                  if (type == null) {
                    throw new Error(`Missing referenced input type: ${field.refName}`)
                  }
                }
              }
              break
            case 'list': {
              let itemType
              if (field.item.type === 'reference') {
                itemType = this.#inputObjects[field.item.refName]
                if (itemType == null) {
                  throw new Error(`Missing referenced input type: ${field.item.refName}`)
                }
              } else if (SCALAR_FIELDS.includes(field.item.type)) {
                itemType = SCALARS[field.item.type]
              } else {
                throw new Error(`Unsupported list item type: ${field.item.type}`)
              }
              type = new GraphQLList(itemType)
              break
            }
            default:
              if (SCALAR_FIELDS.includes(field.type)) {
                type = SCALARS[field.type]
              } else {
                throw new Error(`Unsupported field type ${field.type}`)
              }
          }

          if (type != null) {
            config[key] = { type: field.required ? new GraphQLNonNull(type) : type }
          }
        }
        return config
      },
    })
  }

  _buildNodeMutations(name: string, modelID: string) {
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
        return { node: await ctx.createDoc(modelID, input.content) }
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
        return { node: await ctx.updateDoc(input.id, input.content) }
      },
    })
  }

  _createSchema(definitions: SharedDefinitions) {
    const queryFields: GraphQLFieldConfigMap<any, Context> = {
      node: definitions.nodeField,
      account: {
        type: new GraphQLNonNull(definitions.accountObject),
        args: {
          id: { type: new GraphQLNonNull(GraphQLDID) },
        },
        resolve: (_, args: { id: string }): string => args.id,
      },
      viewer: {
        type: definitions.accountObject,
        resolve: (_self, _args, ctx): string | null => ctx.viewerID,
      },
    }

    for (const [alias, reference] of Object.entries(this.#def.query ?? {})) {
      const model = this.#def.models[reference.name]
      if (model == null) {
        throw new Error(`Missing model for reference name: ${reference.name}`)
      }

      if (reference.type === 'collection') {
        queryFields[alias] = {
          type: this.#types[reference.name],
          args: connectionArgs,
          resolve: async (_, args: ConnectionArguments, ctx): Promise<Connection<any> | null> => {
            return await ctx.queryConnection({ ...args, model })
          },
        }
      } else {
        throw new Error(`Unsupported reference type: ${reference.type}`)
      }
    }

    const schemaFields: Record<string, GraphQLObjectType> = {
      query: new GraphQLObjectType({ name: 'Query', fields: queryFields }),
    }
    if (!this.#isReadonly) {
      schemaFields.mutation = new GraphQLObjectType({ name: 'Mutation', fields: this.#mutations })
    }

    return new GraphQLSchema(schemaFields)
  }
}

export function createGraphQLSchema(params: CreateSchemaParams): GraphQLSchema {
  return new SchemaBuilder(params).build()
}
