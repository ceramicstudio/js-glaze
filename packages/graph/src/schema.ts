import { CeramicCommitID, getScalar } from '@glazed/graphql-scalars'
import type {
  ModelInstanceDocument,
  RuntimeCompositeDefinition,
  RuntimeList,
  RuntimeObjectFields,
  RuntimeReference,
  RuntimeScalar,
  RuntimeViewField,
} from '@glazed/types'
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  type GraphQLFieldConfigMap,
  type GraphQLInputFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
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

import type { Context } from './context.js'
import type { UpdateDocOptions } from './loader.js'

type GraphQLNodeDefinitions = {
  nodeInterface: GraphQLInterfaceType
  nodeField: GraphQLFieldConfig<unknown, Context>
  nodesField: GraphQLFieldConfig<unknown, Context>
}
type SharedDefinitions = GraphQLNodeDefinitions & {
  accountObject: GraphQLObjectType<string, Context>
  queryFields: GraphQLFieldConfigMap<unknown, Context>
}

type BuildObjectParams = {
  name: string
  fields: RuntimeObjectFields
  definitions: SharedDefinitions
}

const UpdateOptionsInput = new GraphQLInputObjectType({
  name: 'UpdateOptionsInput',
  fields: {
    replace: { type: GraphQLBoolean },
    version: { type: CeramicCommitID },
  },
})

/**
 * GraphQL schema creation parameters.
 */
export type CreateSchemaParams = {
  /**
   * Runtime composite definition, created using the {@linkcode devtools.Composite Composite}
   * development tools.
   */
  definition: RuntimeCompositeDefinition
  /**
   * Set the schema to read-only, disabling mutations support.
   */
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
    this._buildObjects(definitions)
    this._buildConnections()
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
      async (id: string, ctx: Context) => {
        return id.startsWith('did:') ? id : await ctx.loadDoc(id)
      },
      (didOrDoc: string | ModelInstanceDocument) => {
        return typeof didOrDoc === 'string'
          ? 'CeramicAccount'
          : modelAliases[didOrDoc.metadata.model?.toString()]
      }
    )

    const accountObject = new GraphQLObjectType<string, Context>({
      name: 'CeramicAccount',
      interfaces: [nodeDefs.nodeInterface],
      fields: () => {
        const config: GraphQLFieldConfigMap<string, Context> = {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (did) => did,
          },
          isViewer: {
            type: new GraphQLNonNull(GraphQLBoolean),
            resolve: (did, _, ctx) => ctx.authenticated && ctx.viewerID === did,
          },
        }
        for (const [alias, reference] of Object.entries(this.#def.accountData ?? {})) {
          const model = this.#def.models[reference.name]
          if (model == null) {
            throw new Error(`Missing model for reference name: ${reference.name}`)
          }

          if (reference.type === 'node') {
            config[alias] = {
              type: this.#types[reference.name],
              resolve: async (account, _, ctx): Promise<ModelInstanceDocument | null> => {
                return await ctx.querySingle({ account, model })
              },
            }
          } else if (reference.type === 'connection') {
            config[alias] = {
              type: this.#types[`${reference.name}Connection`],
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

    const queryFields: GraphQLFieldConfigMap<unknown, Context> = {
      node: nodeDefs.nodeField,
      viewer: {
        type: accountObject,
        resolve: (_self, _args, ctx): string | null => ctx.viewerID,
      },
    }

    return { ...nodeDefs, accountObject, queryFields }
  }

  _buildObjects(definitions: SharedDefinitions) {
    for (const [name, fields] of Object.entries(this.#def.objects)) {
      this._buildObjectType({ definitions, name, fields })
    }
  }

  _buildObjectType({ definitions, name, fields }: BuildObjectParams) {
    const modelID = this.#def.models[name]

    this.#types[name] = new GraphQLObjectType<ModelInstanceDocument>({
      name,
      interfaces: modelID ? [definitions.nodeInterface] : [],
      fields: () => {
        const config: GraphQLFieldConfigMap<ModelInstanceDocument, Context> = {}
        if (modelID != null) {
          config.id = {
            // Use GraphQLID here for Relay compliance
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
        this._buildNodeMutations(definitions.queryFields, name, modelID)
      }
    }
  }

  _buildConnections() {
    for (const objectName of Object.keys(this.#def.models)) {
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
    } else {
      itemType = getScalar(field.item.type)
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
        resolve: (doc): string => doc.metadata.controller,
      }
    }
    if (field.viewType === 'documentVersion') {
      return {
        type: new GraphQLNonNull(CeramicCommitID),
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
    const type = field.type === 'did' ? definitions.accountObject : getScalar(field.type)
    return {
      type: field.required ? new GraphQLNonNull(type) : type,
      resolve: (doc): unknown => doc.content?.[key],
    }
  }

  _buildInputObjectType(name: string, fields: RuntimeObjectFields) {
    const buildFields = (required: boolean): GraphQLInputFieldConfigMap => {
      const config: GraphQLInputFieldConfigMap = {}
      const inputPrefix = required ? 'Required' : ''

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
                type = this.#inputObjects[inputPrefix + field.refName]
                if (type == null) {
                  throw new Error(`Missing referenced input type: ${inputPrefix + field.refName}`)
                }
              }
            }
            break
          case 'list': {
            let itemType
            if (field.item.type === 'reference') {
              itemType = this.#inputObjects[inputPrefix + field.item.refName]
              if (itemType == null) {
                throw new Error(
                  `Missing referenced input type: ${inputPrefix + field.item.refName}`
                )
              }
            } else {
              itemType = getScalar(field.item.type)
            }
            type = new GraphQLList(itemType)
            break
          }
          default:
            type = getScalar(field.type)
        }
        config[key] = { type: required && field.required ? new GraphQLNonNull(type) : type }
      }

      return config
    }

    this.#inputObjects[`Required${name}`] = new GraphQLInputObjectType({
      name: `Required${name}Input`,
      fields: () => buildFields(true),
    })
    this.#inputObjects[name] = new GraphQLInputObjectType({
      name: `${name}Input`,
      fields: () => buildFields(false),
    })
  }

  _buildNodeMutations(
    queryFields: GraphQLFieldConfigMap<unknown, Context>,
    name: string,
    modelID: string
  ) {
    this.#mutations[`create${name}`] = mutationWithClientMutationId({
      name: `Create${name}`,
      inputFields: () => ({
        content: { type: new GraphQLNonNull(this.#inputObjects[`Required${name}`]) },
      }),
      outputFields: () => ({
        ...queryFields,
        document: { type: new GraphQLNonNull(this.#types[name]) },
      }),
      mutateAndGetPayload: async (input: { content: Record<string, any> }, ctx: Context) => {
        if (ctx.ceramic.did == null || !ctx.ceramic.did.authenticated) {
          throw new Error('Ceramic instance is not authenticated')
        }
        return { document: await ctx.createDoc(modelID, input.content) }
      },
    })

    this.#mutations[`update${name}`] = mutationWithClientMutationId({
      name: `Update${name}`,
      inputFields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: new GraphQLNonNull(this.#inputObjects[name]) },
        options: { type: UpdateOptionsInput },
      }),
      outputFields: () => ({
        ...queryFields,
        document: { type: new GraphQLNonNull(this.#types[name]) },
      }),
      mutateAndGetPayload: async (
        input: { id: string; content: Record<string, any>; options?: UpdateDocOptions },
        ctx: Context
      ) => {
        if (ctx.ceramic.did == null || !ctx.ceramic.did.authenticated) {
          throw new Error('Ceramic instance is not authenticated')
        }
        return { document: await ctx.updateDoc(input.id, input.content, input.options) }
      },
    })
  }

  _createSchema(definitions: SharedDefinitions) {
    const queryFields = { ...definitions.queryFields }

    for (const [alias, model] of Object.entries(this.#def.models)) {
      const first = alias[0].toLowerCase()
      const rest = alias.slice(1)
      queryFields[`${first}${rest}Index`] = {
        type: this.#types[`${alias}Connection`],
        args: connectionArgs,
        resolve: async (_, args: ConnectionArguments, ctx): Promise<Connection<any> | null> => {
          return await ctx.queryConnection({ ...args, model })
        },
      }
    }

    const schemaFields: Record<string, GraphQLObjectType> = {
      query: new GraphQLObjectType({ name: 'Query', fields: queryFields }),
    }
    if (!this.#isReadonly && Object.keys(this.#mutations).length !== 0) {
      schemaFields.mutation = new GraphQLObjectType({ name: 'Mutation', fields: this.#mutations })
    }

    return new GraphQLSchema(schemaFields)
  }
}

/**
 * Create a GraphQL schema from a runtime composite definition
 */
export function createGraphQLSchema(params: CreateSchemaParams): GraphQLSchema {
  return new SchemaBuilder(params).build()
}
