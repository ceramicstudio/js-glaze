import type {
  CustomRuntimeScalarType,
  InternalCompositeDefinition,
  JSONSchema,
  ModelDefinition,
  ModelViewsDefinition,
  RuntimeCompositeDefinition,
  RuntimeList,
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

type ScalarSchema = JSONSchema.Boolean | JSONSchema.Integer | JSONSchema.Number | JSONSchema.String

type AnySchema = ScalarSchema | JSONSchema.Array | JSONSchema.Object

const CUSTOM_SCALARS_TITLES: Record<string, CustomRuntimeScalarType> = {
  CeramicStreamReference: 'streamref',
  GraphQLDID: 'did',
  GraphQLID: 'id',
}
type CustomScalarTitle = keyof typeof CUSTOM_SCALARS_TITLES

export type RuntimeModelBuilderParams = {
  name: string
  definition: ModelDefinition
  commonEmbeds?: Array<string>
}

export type ExtractSchemaParams = {
  parentName?: string
  ownName?: string
  required?: boolean
  localRef?: boolean
}

export class RuntimeModelBuilder {
  #commonEmbeds: Array<string>
  #modelName: string
  #modelSchema: JSONSchema.Object
  #modelViews: ModelViewsDefinition
  #objects: Record<string, RuntimeObjectFields> = {}

  constructor(params: RuntimeModelBuilderParams) {
    this.#commonEmbeds = params.commonEmbeds ?? []
    this.#modelName = params.name
    this.#modelSchema = params.definition.schema
    this.#modelViews = params.definition.views ?? {}
  }

  build(): Record<string, RuntimeObjectFields> {
    const modelObject = this._buildObject(this.#modelSchema)
    this.#objects[this.#modelName] = modelObject
    // TODO: build relations
    this._buildViews(modelObject, this.#modelViews)
    return this.#objects
  }

  _getName(schema: AnySchema, params: ExtractSchemaParams, isReference = false): string {
    return isReference && typeof schema.title === 'string'
      ? this.#commonEmbeds.includes(schema.title)
        ? schema.title
        : getName(schema.title, this.#modelName)
      : params.ownName ?? this.#modelName
  }

  _getReferenceSchema<T extends AnySchema = AnySchema>(reference: string): T {
    const ref = new JsonReference(reference)
    const schema = ref.resolve(this.#modelSchema)
    if (schema == null) {
      throw new Error(`Missing reference: ${reference}`)
    }
    return schema as T
  }

  _buildObject(schema: JSONSchema.Object, params: ExtractSchemaParams = {}): RuntimeObjectFields {
    const ownName = this._getName(schema, params)
    const requiredProps = schema.required ?? []

    const fields: RuntimeObjectFields = {}
    for (const [propKey, propSchema] of Object.entries(schema.properties ?? {})) {
      fields[propKey] = this._buildObjectField(propSchema as AnySchema, {
        ownName: propKey,
        parentName: ownName,
        required: requiredProps.includes(propKey),
      })
    }
    return fields
  }

  _buildObjectField(schema: AnySchema, params: ExtractSchemaParams = {}): RuntimeObjectField {
    if (schema.$ref != null) {
      return this._buildReferenceSchema(schema.$ref, params)
    }
    switch (schema.type) {
      case 'array':
        return this._buildList(schema, params)
      case 'object':
        return this._buildObjectReferenceField(schema, params)
      default:
        return this._buildScalar(schema as ScalarSchema, params)
    }
  }

  _buildList(schema: JSONSchema.Array, params: ExtractSchemaParams = {}): RuntimeList {
    if (typeof schema.items !== 'object' || Array.isArray(schema.items)) {
      throw new Error('Unsupported items schema in array')
    }

    const required = params.required ?? false
    const items = schema.items as AnySchema

    if (items.$ref != null) {
      return { type: 'list', required, item: this._buildListReference(items.$ref, params) }
    }
    if (items.type == null) {
      throw new Error('Missing schema $ref or type for array items')
    }

    let item: RuntimeScalar | RuntimeReference<'object'>
    switch (items.type) {
      case 'array':
        throw new Error('Unsupported array in array')
      case 'object':
        item = this._buildObjectReferenceField(items, params)
        break
      default:
        item = this._buildScalar(items as ScalarSchema, params)
        break
    }
    return { type: 'list', required, item }
  }

  _buildListReference(
    reference: string,
    params: ExtractSchemaParams = {}
  ): RuntimeScalar | RuntimeReference<'object'> {
    const schema = this._getReferenceSchema(reference)
    switch (schema.type) {
      case 'array':
        throw new Error('Unsupported array in array reference')
      case 'object':
        return this._buildObjectReferenceField(schema, params)
      default:
        return this._buildScalar(schema as ScalarSchema, params)
    }
  }

  _buildObjectReferenceField(
    schema: JSONSchema.Object,
    params: ExtractSchemaParams = {}
  ): RuntimeReference<'object'> {
    const ownName = this._getName(schema, params, true)
    if (this.#objects[ownName] == null) {
      this.#objects[ownName] = this._buildObject(schema, { ...params, ownName })
    }
    return {
      type: 'reference',
      refType: 'object',
      refName: ownName,
      required: params.required ?? false,
    }
  }

  _buildReferenceSchema(reference: string, params: ExtractSchemaParams = {}): RuntimeObjectField {
    const schema = this._getReferenceSchema(reference)
    switch (schema.type) {
      case 'array':
        return this._buildList(schema, params)
      case 'object':
        return this._buildObjectReferenceField(schema, params)
      default:
        return this._buildScalar(schema as ScalarSchema, params)
    }
  }

  _buildScalar(schema: ScalarSchema, params: ExtractSchemaParams = {}): RuntimeScalar {
    if (schema.type == null) {
      throw new Error('Missing scalar type')
    }

    const required = params.required ?? false

    switch (schema.type) {
      case 'boolean':
      case 'integer':
        return { type: schema.type, required }
      case 'number':
        return { type: 'float', required }
      case 'string':
        return {
          type: CUSTOM_SCALARS_TITLES[schema.title as CustomScalarTitle] ?? 'string',
          required,
        }
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
  definition: InternalCompositeDefinition
): RuntimeCompositeDefinition {
  const runtime: RuntimeCompositeDefinition = {
    models: {},
    objects: {},
    accountData: {},
  }

  for (const [modelID, modelDefinition] of Object.entries(definition.models)) {
    const modelName = definition.aliases?.[modelID] ?? modelDefinition.name
    // Add name to model ID mapping
    runtime.models[modelName] = modelID
    // Extract objects from model schema, relations and views
    const modelBuilder = new RuntimeModelBuilder({
      commonEmbeds: definition.commonEmbeds,
      name: modelName,
      definition: modelDefinition,
    })
    Object.assign(runtime.objects, modelBuilder.build())
    // Attach entry-point to account store based on relation type
    if (modelDefinition.accountRelation !== 'none') {
      const key = camelCase(modelName)
      if (modelDefinition.accountRelation === 'link') {
        runtime.accountData[key] = { type: 'model', name: modelName }
      } else {
        runtime.accountData[key + 'Collection'] = { type: 'collection', name: modelName }
      }
    }
  }

  // TODO: handle definition.views for additional models, accountData and root view

  return runtime
}