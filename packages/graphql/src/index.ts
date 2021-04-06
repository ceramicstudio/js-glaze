import type { CeramicApi, Doctype } from '@ceramicnetwork/common'
import type { IDX } from '@ceramicstudio/idx'
import type {
  DocReference,
  GraphQLDocSetRecords,
  ObjectFields,
} from '@ceramicstudio/idx-graphql-types'
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
  fromGlobalId,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay'

const SCALARS = {
  boolean: GraphQLBoolean,
  float: GraphQLFloat,
  integer: GraphQLInt,
  string: GraphQLString,
}
const SCALAR_FIELDS = Object.keys(SCALARS)

export type Context = { ceramic: CeramicApi; idx: IDX }

export function createGlobalId(typeName: string): GraphQLFieldConfigMap<Doctype, Context> {
  return {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (doc): string => toGlobalId(typeName, doc.id.toString()),
    },
  }
}

export class GraphQLDocSet implements GraphQLDocSetRecords {
  _records: GraphQLDocSetRecords

  constructor(records?: GraphQLDocSetRecords) {
    this._records = records ?? {
      index: {},
      lists: {},
      nodes: {},
      objects: {},
      references: {},
      roots: {},
    }
  }

  get records(): GraphQLDocSetRecords {
    return this._records
  }

  get index(): Record<string, DocReference> {
    return this._records.index
  }
  get lists(): Record<string, string> {
    return this._records.lists
  }
  get nodes(): Record<string, string> {
    return this._records.nodes
  }
  get objects(): Record<string, ObjectFields> {
    return this._records.objects
  }
  get references(): Record<string, Array<string>> {
    return this._records.references
  }
  get roots(): Record<string, DocReference> {
    return this._records.roots
  }

  toGraphQLSchema(): GraphQLSchema {
    const inputObjects: Record<string, GraphQLInputObjectType> = {}
    const mutations: Record<string, GraphQLFieldConfig<any, any>> = {}
    const types: Record<string, GraphQLObjectType> = {}

    const resolveType = (doc: Doctype): GraphQLObjectType<any, Context> | null => {
      const { schema } = doc.metadata
      if (schema == null) {
        return null
      }
      const name = this._records.nodes[schema]
      if (name == null) {
        return null
      }
      return types[name] ?? null
    }

    const { nodeInterface, nodeField } = nodeDefinitions(async (globalId: string, ctx: Context) => {
      const { id } = fromGlobalId(globalId)
      return await ctx.ceramic.loadDocument(id)
    }, resolveType)

    const nodes = Object.entries(this._records.nodes).reduce((acc, [schema, name]) => {
      acc[name] = { interfaces: [nodeInterface], schema }
      return acc
    }, {} as Record<string, { interfaces: Array<GraphQLInterfaceType>; schema: string }>)

    for (const [name, fields] of Object.entries(this._records.objects)) {
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
              const listItem = this._records.lists[field.name]
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

      types[name] = new GraphQLObjectType<Doctype>({
        name,
        interfaces: node?.interfaces,
        fields: (): GraphQLFieldConfigMap<Doctype, Context> => {
          return Object.entries(fields).reduce(
            (acc, [key, field]) => {
              if (field.type === 'reference') {
                const refID = this._records.references[field.name][0]
                const type = types[this._records.nodes[refID]]
                acc[key] = {
                  type: field.required ? new GraphQLNonNull(type) : type,
                  resolve: async (doc, _args, ctx): Promise<Doctype | null> => {
                    const id = doc.content?.[key]?.id
                    return id ? await ctx.ceramic.loadDocument(id) : null
                  },
                }
              } else {
                let type
                if (field.type === 'object') {
                  type = types[field.name]
                } else if (field.type === 'list') {
                  const listItem = this._records.lists[field.name]
                  type = new GraphQLList(types[listItem])
                } else if (SCALAR_FIELDS.includes(field.type)) {
                  type = SCALARS[field.type]
                } else {
                  throw new Error(`Unsupported field type ${field.type}`)
                }

                if (type != null) {
                  acc[key] = {
                    type: field.required ? new GraphQLNonNull(type) : type,
                    resolve: (doc: Doctype): any => doc.content?.[key],
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
            if (ctx.ceramic.did == null) {
              throw new Error('Ceramic instance is not authenticated')
            }
            return {
              node: await ctx.ceramic.createDocument('tile', {
                content: input.object,
                metadata: { controllers: [ctx.ceramic.did.id], schema: node.schema },
              }),
            }
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
            const doc = await ctx.ceramic.loadDocument(id)
            await doc.change({ content: input.object })
            return { node: doc }
          },
        })
      }
    }

    const indexFields: GraphQLFieldConfigMap<any, any> = {}
    for (const [key, definition] of Object.entries(this._records.index)) {
      const name = this._records.nodes[definition.schema]
      indexFields[key] = {
        type: types[name],
        resolve: async (_, { did }: { did?: string }, ctx): Promise<Record<string, any>> => {
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

    const query = new GraphQLObjectType({
      name: 'Query',
      fields: Object.entries(this._records.roots).reduce(
        (acc, [key, { id, schema }]) => {
          const name = this._records.nodes[schema]
          acc[key] = {
            type: new GraphQLNonNull(types[name]),
            resolve: async (_self, _args, ctx): Promise<any> => {
              return await ctx.ceramic.loadDocument(id)
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
}
