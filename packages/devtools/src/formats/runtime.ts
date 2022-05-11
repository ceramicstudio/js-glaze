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

type SubSchema =
  | JSONSchema.Array
  | JSONSchema.Boolean
  | JSONSchema.Integer
  | JSONSchema.Number
  | JSONSchema.Object
  | JSONSchema.String

export type RuntimeModelBuilderParams = {
  name: string
  definition: ModelDefinition
  commonShapes?: Array<string>
}

export type ExtractSchemaParams = {
  parentName?: string
  ownName?: string
  required?: boolean
  localRef?: boolean
}

export class RuntimeModelBuilder {
  #commonShapes: Array<string>
  #modelName: string
  #modelSchema: JSONSchema.Object
  #modelViews: ModelViewsDefinition
  #objects: Record<string, RuntimeObjectFields> = {}

  constructor(params: RuntimeModelBuilderParams) {
    this.#commonShapes = params.commonShapes ?? []
    this.#modelName = params.name
    this.#modelSchema = params.definition.schema
    this.#modelViews = params.definition.views ?? {}
  }

  build(): Record<string, RuntimeObjectFields> {
    this._buildSchema(this.#modelSchema)
    const modelObject = this.#objects[this.#modelName]
    if (modelObject == null) {
      throw new Error(`Object for model ${this.#modelName} has not been created`)
    }
    // TODO: build relations
    this._buildViews(modelObject, this.#modelViews)
    return this.#objects
  }

  _buildSchema(
    schema: SubSchema,
    { parentName, ...params }: ExtractSchemaParams = {}
  ): RuntimeObjectField {
    const required = params.required ?? false
    const ownName =
      params.localRef && typeof schema.title === 'string'
        ? this.#commonShapes.includes(schema.title)
          ? schema.title
          : getName(schema.title, this.#modelName)
        : params.ownName ?? this.#modelName

    if (typeof schema.$ref === 'string') {
      const ref = new JsonReference(schema.$ref)
      const deref = ref.resolve(this.#modelSchema)
      if (deref == null) {
        throw new Error(`Missing reference: ${schema.$ref}`)
      }
      return this._buildSchema(deref as SubSchema, {
        ownName,
        parentName,
        required,
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
          const deref = ref.resolve(this.#modelSchema)
          if (deref == null) {
            throw new Error(`Missing item reference: ${itemSchema.$ref}`)
          }
          item = this._buildSchema(deref as SubSchema, {
            ownName: getName(ownName, parentName),
            parentName,
            required,
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
              this._buildSchema(schema.items as SubSchema, { ownName: refName })
              item = { type: 'reference', refType: 'object', refName, required: false }
              break
            }
            default:
              throw new Error(`Unsupported schema item type: ${itemSchema.type}`)
          }
        }

        return { type: 'list', required, item }
      }
      case 'object': {
        const fields: RuntimeObjectFields = {}
        const requiredProps = (schema.required as Array<string>) ?? []
        for (const [propKey, propSchema] of Object.entries(schema.properties ?? {})) {
          fields[propKey] = this._buildSchema(propSchema as SubSchema, {
            ownName: propKey,
            parentName: ownName,
            required: requiredProps.includes(propKey),
          })
        }
        this.#objects[ownName] = fields
        return { type: 'reference', refType: 'object', refName: ownName, required }
      }
      default:
        throw new Error(`Unsupported schema type: ${schema.type}`)
    }
  }

  _buildViews(object: RuntimeObjectFields, views: ModelViewsDefinition = {}): void {
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
    const modelBuilder = new RuntimeModelBuilder({
      commonShapes: definition.commonShapes,
      name: modelName,
      definition: modelDefinition,
    })
    Object.assign(runtime.objects, modelBuilder.build())
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
