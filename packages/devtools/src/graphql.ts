/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { CIP88_APPEND_COLLECTION_PREFIX } from '@glazed/constants'
import type { Definition } from '@glazed/did-datastore-model'
import type { GraphQLModel, ItemField, ObjectField } from '@glazed/graphql-types'
import type { Schema } from '@glazed/types'
import { camelCase, pascalCase } from 'change-case'

import type { ModelManager } from './datamodel'
import { getReference } from './schema'

/** @internal */
function getName(base: string, prefix = ''): string {
  const withCase = pascalCase(base)
  return withCase.startsWith(prefix) ? withCase : prefix + withCase
}

/** @internal */
export function getItemField(
  model: GraphQLModel,
  schema: Schema,
  parent: string,
  owner: string
): ItemField {
  const name = schema.title ?? ''
  if (schema.type === 'array') {
    throw new Error('Unsupported item field of type array')
  }
  if (schema.type === 'string') {
    const schemas = getReference(schema)
    if (schemas == null) {
      return { ...schema, type: 'string' }
    }

    const refName = getName(name, parent)
    const ref = { schemas, owner }
    model.references[refName] = ref
    return { type: 'reference', ...ref }
  }
  if (schema.type === 'object') {
    return { type: 'object', name: addModelSchema(model, schema, { name, parent, owner }) }
  }
  return schema as ItemField
}

export type AddModelSchemaOptions = {
  name?: string
  parent?: string
  owner?: string
}

/**
 * Add a JSON schema to the provided records based on its type
 *
 * @internal
 * */
export function addModelSchema(
  model: GraphQLModel,
  schema: Schema,
  options: AddModelSchemaOptions = {}
): string {
  const providedTitle = options.name ?? schema.title
  if (providedTitle == null) {
    throw new Error('Schema must have a title')
  }

  // TODO: add parents?: Array<string> to options
  // If no parent and type object, treat as node and use canonical name
  // Make sure object doesn't already exist in model, if so just add extra parents
  const name = getName(providedTitle, options.parent)

  if (schema.type === 'string') {
    const reference = getReference(schema)
    if (reference != null) {
      model.references[name] = { schemas: reference, owner: options.owner as string }
    }
  } else if (schema.type === 'array' && schema.items != null) {
    model.lists[name] = getItemField(model, schema.items, name, options.owner as string)
  } else if (schema.type === 'object' && schema.properties != null) {
    const requiredProps = (schema.required as Array<string>) ?? []
    const fields = Object.entries(schema.properties as Record<string, any>).reduce(
      (acc, [key, value]: [string, Schema]) => {
        const propName = (value.title as string) ?? key
        const prop = camelCase(key)
        const opts = { name: propName, parent: name, owner: options.owner ?? name }
        const required = requiredProps.includes(key)
        if (value.type === 'string') {
          const reference = getReference(value)
          if (reference == null) {
            acc[prop] = { ...value, required, type: 'string' }
          } else {
            const refName = getName(propName, name)
            const ref = { schemas: reference, owner: options.owner ?? name }
            model.references[refName] = ref
            acc[prop] = { required, type: 'reference', ...ref }
          }
        } else if (value.type === 'array') {
          if (value.items == null) {
            throw new Error(`Missing items in field ${key}`)
          }
          acc[prop] = { required, type: 'list', name: addModelSchema(model, value, opts) }
        } else if (value.type === 'object') {
          acc[prop] = { required, type: 'object', name: addModelSchema(model, value, opts) }
        } else {
          acc[prop] = { ...value, required } as ObjectField
        }
        return acc
      },
      {} as Record<string, ObjectField>
    )
    model.objects[name] = { fields, parents: options.parent ? [options.parent] : null }
  }

  return name
}

/** @internal */
export async function createGraphQLModel(manager: ModelManager): Promise<GraphQLModel> {
  // TODO: throw error on using reserved names:
  // - "node" and "index" roots
  // - "id" field in object if node

  const model: GraphQLModel = {
    collections: {},
    index: {},
    lists: {},
    objects: {},
    referenced: {},
    references: {},
    roots: {},
  }

  const handleSchemas = manager.schemas.map(async (name) => {
    const id = manager.getSchemaID(name) as string
    const stream = await manager.loadStream(id)
    const schema = stream.content as Schema
    if (schema == null) {
      throw new Error(`Could not load schema ${name}`)
    }

    const schemaURL = stream.commitId.toUrl()
    if (schema.$comment?.startsWith(CIP88_APPEND_COLLECTION_PREFIX)) {
      const sliceSchemaID = schema.$comment.substr(CIP88_APPEND_COLLECTION_PREFIX.length)
      await manager.loadSchema(sliceSchemaID)
      const sliceSchemaDoc = await manager.loadStream(sliceSchemaID)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const itemSchema = sliceSchemaDoc.content?.properties?.contents?.items?.oneOf?.[0]
      if (itemSchema == null) {
        throw new Error(`Could not extract item schema ${name}`)
      }
      model.collections[name] = {
        schema: schemaURL,
        item: getItemField(model, itemSchema, name, name),
      }
      model.referenced[schemaURL] = { type: 'collection', name }
    } else {
      model.referenced[schemaURL] = {
        type: 'object',
        name: addModelSchema(model, schema),
      }
    }
  })

  const handleDefinitions = manager.definitions.map(async (name) => {
    const id = manager.getDefinitionID(name) as string
    const stream = await manager.loadStream(id)
    const definition = stream.content as Definition
    if (definition == null) {
      throw new Error(`Could not load definition ${name}`)
    }
    model.index[name] = { id: stream.id.toString(), schema: definition.schema }
  })

  const handleTiles = manager.tiles.map(async (name) => {
    const id = manager.getTileID(name) as string
    const stream = await manager.loadStream(id)
    const { schema } = stream.metadata
    if (schema == null) {
      throw new Error(`Missing schema for tile ${name}`)
    }
    model.roots[name] = { id: stream.id.toString(), schema }
  })

  await Promise.all([...handleSchemas, ...handleDefinitions, ...handleTiles])

  return model
}
