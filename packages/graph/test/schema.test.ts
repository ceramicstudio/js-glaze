import { createRuntimeDefinition, parseCompositeSchema } from '@glazed/devtools'
import { profilesSchema } from '@glazed/test-schemas'

import { printGraphQLSchema } from '../src'

describe('schema', () => {
  test('printGraphQLSchema()', () => {
    const { models, commonEmbeds } = parseCompositeSchema(profilesSchema)
    const definition = createRuntimeDefinition({
      version: '1.0',
      commonEmbeds,
      models: models.reduce((acc, model) => {
        acc[`${model.name}ID`] = model
        return acc
      }, {}),
    })
    expect(printGraphQLSchema(definition)).toMatchSnapshot()
  })
})
