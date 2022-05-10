import type {
  CompositeDefinition,
  JSONSchema,
  ModelDefinition,
  ModelViewsDefinition,
  RuntimeCompositeDefinition,
  RuntimeObjectField,
  RuntimeObjectFields,
  RuntimeScalar,
  RuntimeReference,
} from '@glazed/types'
import { camelCase, pascalCase } from 'change-case'
import { JsonReference } from 'json-ptr'

/** @internal */
export function getName(base: string, prefix = ''): string {
  const withCase = pascalCase(base)
  return withCase.startsWith(prefix) ? withCase : prefix + withCase
}

export function createRuntimeDefinition(
  definition: CompositeDefinition
): RuntimeCompositeDefinition {
  const runtime: RuntimeCompositeDefinition = {
    models: {},
    objects: {},
    accountStore: {},
  }

  for (const [modelID, modelDefinition] of Object.entries(definition.models)) {
    const modelName = definition.aliases?.[modelID] ?? modelDefinition.name
    // Add name to model ID mapping
    runtime.models[modelName] = modelID
    // Extract objects from model schema, relations and views
    Object.assign(runtime.objects, extractRuntimeObjects(modelName, modelDefinition))
    // Attach entry-point to account store based on relation type
    if (modelDefinition.accountRelation !== 'none') {
      let key = camelCase(modelName)
      if (modelDefinition.accountRelation === 'link') {
        runtime.accountStore[key] = { type: 'model', name: modelName }
      } else {
        runtime.accountStore[key + 'Collection'] = { type: 'collection', name: modelName }
      }
    }
  }

  // TODO: handle definition.views for additional models, accountStore and root view

  return runtime
}

type SubSchema =
  | JSONSchema.Array
  | JSONSchema.Boolean
  | JSONSchema.Integer
  | JSONSchema.Number
  | JSONSchema.Object
  | JSONSchema.String

export type ExtractSchemaParams = {
  objects: Record<string, RuntimeObjectFields>
  modelName: string
  root: JSONSchema.Object
  schema?: SubSchema
  parentName?: string
  ownName?: string
  required?: boolean
  localRef?: boolean
}

export function extractRuntimeObjects(
  modelName: string,
  definition: ModelDefinition
): Record<string, RuntimeObjectFields> {
  const objects: Record<string, RuntimeObjectFields> = {}
  extractSchema({ objects, root: definition.schema, modelName })
  const modelObject = objects[modelName]
  if (modelObject == null) {
    throw new Error(`Object for model ${modelName} has not been created`)
  }
  // TODO: extract relations
  extractViews(modelObject, definition.views)
  return objects
}

export function extractSchema({
  objects,
  modelName,
  parentName,
  root,
  ...params
}: ExtractSchemaParams): RuntimeObjectField {
  const required = params.required ?? false
  const schema = params.schema ?? root
  const ownName =
    params.localRef && typeof schema.title === 'string'
      ? getName(schema.title, modelName)
      : params.ownName ?? modelName

  if (typeof schema.$ref === 'string') {
    const ref = new JsonReference(schema.$ref)
    const deref = ref.resolve(root)
    if (deref == null) {
      throw new Error(`Missing reference: ${schema.$ref}`)
    }
    return extractSchema({
      objects,
      ownName,
      parentName,
      modelName,
      required,
      root,
      schema: deref as SubSchema,
      localRef: true,
    })
  }

  switch (schema.type) {
    // TODO: DID/StreamID support
    case 'boolean':
    case 'integer':
    case 'string':
      return { type: schema.type, required }
    case 'number':
      return { type: 'float', required }
    case 'array': {
      if (typeof schema.items !== 'object') {
        throw new Error('Unsupported schema items')
      }

      const itemSchema = schema.items as SubSchema
      let item: RuntimeScalar | RuntimeReference<'object'>

      if (typeof itemSchema.$ref === 'string') {
        const ref = new JsonReference(itemSchema.$ref)
        const deref = ref.resolve(root)
        if (deref == null) {
          throw new Error(`Missing item reference: ${itemSchema.$ref}`)
        }
        item = extractSchema({
          objects,
          ownName: getName(ownName, parentName),
          parentName,
          modelName,
          required,
          root,
          schema: deref as SubSchema,
          localRef: true,
        }) as RuntimeScalar | RuntimeReference<'object'>
      } else {
        switch (itemSchema.type) {
          case 'array':
            throw new Error('Unsupported list in list')
          // TODO: DID/StreamID support
          case 'boolean':
          case 'integer':
          case 'string':
            // TODO: required support?
            item = { type: itemSchema.type, required: false }
            break
          case 'object': {
            const refName = getName(ownName, parentName)
            extractSchema({
              root,
              objects,
              modelName,
              ownName: refName,
              schema: schema.items as SubSchema,
            })
            item = { type: 'reference', refType: 'object', refName, required: false }
            break
          }
          default:
            console.log('missing schema item type', schema)
            throw new Error(`Unsupported schema item type: ${itemSchema.type}`)
        }
      }

      return { type: 'list', required, item }
    }
    case 'object': {
      const fields: RuntimeObjectFields = {}
      const requiredProps = (schema.required as Array<string>) ?? []
      for (const [propKey, propSchema] of Object.entries(schema.properties ?? {})) {
        fields[propKey] = extractSchema({
          root,
          objects,
          modelName,
          ownName: propKey,
          parentName: ownName,
          schema: propSchema as SubSchema,
          required: requiredProps.includes(propKey),
        })
      }
      objects[ownName] = fields
      return { type: 'reference', refType: 'object', refName: ownName, required }
    }
    default:
      console.log('missing schema type', schema)
      throw new Error(`Unsupported schema type: ${schema.type}`)
  }
}

export function extractViews(object: RuntimeObjectFields, views: ModelViewsDefinition = {}): void {
  for (const [key, view] of Object.entries(views)) {
    switch (view.type) {
      case 'documentAccount':
      case 'documentVersion':
        object[key] = { type: 'view', viewType: view.type }
        continue
      default:
        throw new Error(`Unsupported view type: ${view.type}`)
    }
  }
}
