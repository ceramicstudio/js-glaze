import { createRuntimeDefinition, parseCompositeSchema } from '@glazed/devtools'
import { noteSchema, profilesSchema } from '@glazed/test-schemas'
import type { RuntimeCompositeDefinition } from '@glazed/types'

import { printGraphQLSchema } from '../src'

function createSchemaDefinition(schema: string): RuntimeCompositeDefinition {
  const { models, commonEmbeds } = parseCompositeSchema(schema)
  return createRuntimeDefinition({
    version: '1.0',
    commonEmbeds,
    models: models.reduce((acc, model) => {
      acc[`${model.name}ID`] = model
      return acc
    }, {}),
  })
}

describe('schema', () => {
  test('printGraphQLSchema()', () => {
    expect(printGraphQLSchema(createSchemaDefinition(profilesSchema))).toMatchSnapshot()
    expect(printGraphQLSchema(createSchemaDefinition(noteSchema))).toMatchSnapshot()
  })
})
