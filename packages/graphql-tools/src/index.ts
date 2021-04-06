import type { GraphQLDocSetRecords } from '@ceramicstudio/idx-graphql-types'
import { addDocSetSchema } from '@ceramicstudio/idx-tools'
import type { Definition, DocSet, Schema } from '@ceramicstudio/idx-tools'

// Export to GraphQL docset records for conversion to GraphQL schema
export async function toGraphQLDocSetRecords(ds: DocSet): Promise<GraphQLDocSetRecords> {
  // TODO: throw error on using reserved names:
  // - "node" and "index" roots
  // - "id" field in object if node

  // TODO: collection support

  const records: GraphQLDocSetRecords = {
    index: {},
    lists: {},
    nodes: {},
    objects: {},
    references: {},
    roots: {},
  }

  const handleSchemas = ds.schemas.map(async (name) => {
    const created = ds.getSchema(name)
    if (created != null) {
      const doc = await ds.loadCreated(created)
      const schema = doc.content as Schema
      if (schema == null) {
        throw new Error(`Could not load schema ${name}`)
      }
      records.nodes[doc.commitId.toUrl()] = addDocSetSchema(records, schema, { prefix: '' })
    }
  })

  const handleDefinitions = ds.definitions.map(async (name) => {
    const created = ds.getDefinition(name)
    if (created != null) {
      const doc = await ds.loadCreated(created)
      const definition = doc.content as Definition
      if (definition == null) {
        throw new Error(`Could not load definition ${name}`)
      }
      records.index[name] = { id: doc.id.toString(), schema: definition.schema }
    }
  })

  const handleTiles = ds.tiles.map(async (name) => {
    const created = ds.getTile(name)
    if (created != null) {
      const doc = await ds.loadCreated(created)
      const { schema } = doc.metadata
      if (schema == null) {
        throw new Error(`Missing schema for tile ${name}`)
      }
      records.roots[name] = { id: doc.id.toString(), schema }
    }
  })

  await Promise.all([...handleSchemas, ...handleDefinitions, ...handleTiles])

  return records
}
