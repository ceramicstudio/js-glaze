/**
 * Common types used by Glaze packages.
 *
 * @module types
 */

import type { ModelDefinition } from '@ceramicnetwork/stream-model'
import type { DagJWSResult, JWSSignature } from 'dids'

export type { Model, ModelAccountRelation, ModelDefinition } from '@ceramicnetwork/stream-model'
export type { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
export type { JSONSchema } from 'json-schema-typed/draft-2020-12'

/** JSON-encoded DAG-JWS. */
export type EncodedDagJWS = {
  payload: string
  signatures: Array<JWSSignature>
  link?: string
}

/** JSON-encoded DAG-JWS result representing a Ceramic stream commit. */
export type EncodedDagJWSResult = {
  jws: EncodedDagJWS
  linkedBlock: string // base64
}

/** Ceramic stream commits for a given stream. */
export type StreamCommits = Array<DagJWSResult>

/** JSON-encoded Ceramic stream commits for a given stream. */
export type EncodedStreamCommits = Array<EncodedDagJWSResult>

// export type ModelRelationDefinition =
//   | { type: 'account' }
//   | { type: 'document'; models: Array<string> }
//   | { type: 'setIndex' }

// export type ModelRelationsDefinition = Record<string, ModelRelationDefinition>

/** Definition for a model view, a read-only property. */
export type ModelViewDefinition = { type: 'documentAccount' } | { type: 'documentVersion' }
// | { type: 'referencedBy'; property: string }

/** Mapping of names to types of read-only properties. */
export type ModelViewsDefinition = Record<string, ModelViewDefinition>

// export type ReferencedFromViewDefinition = {
//   type: 'ReferencedFrom'
//   model: string
//   property: string
//   collection: boolean // TODO: use enum?
// }

// export type ReferencedFromViewDefinitions = Record<string, ReferencedFromViewDefinition>

/** Composite-level views definition. */
export type CompositeViewsDefinition = {
  // TODO: Account-based views
  account?: Record<string, unknown>
  // TODO: Query-level views
  root?: Record<string, unknown>
  models?: Record<string, ModelViewsDefinition>
}

/**
 * Composite definition type factory, used both for encoded and internal composites definitions.
 */
export type CompositeDefinitionType<T> = {
  /**
   * Version of the composite format.
   */
  version: string
  /**
   * Models defined in the composite, keyed by stream ID.
   */
  models: Record<string, T>
  /**
   * Optional mapping of model stream ID to alias name.
   */
  aliases?: Record<string, string>
  /**
   * Optional composite-level views.
   */
  views?: CompositeViewsDefinition
  /**
   * Optional common embeds shared by models in the composite.
   */
  commonEmbeds?: Array<string>
}

/**
 * Composite definition used internally by the {@linkcode devtools.Composite Composite}
 * development tools.
 */
export type InternalCompositeDefinition = CompositeDefinitionType<ModelDefinition>

/** JSON-encoded composite definition. */
export type EncodedCompositeDefinition = CompositeDefinitionType<EncodedStreamCommits>

/** Common runtime scalar properties. */
export type RuntimeScalarCommon = {
  required: boolean
}
/** Runtime scalar representation for a boolean. */
export type RuntimeBooleanScalar = RuntimeScalarCommon & {
  type: 'boolean'
}
/** Runtime scalar representation for an integer. */
export type RuntimeIntegerScalar = RuntimeScalarCommon & {
  type: 'integer'
}
/** Runtime scalar representation for a float. */
export type RuntimeFloatScalar = RuntimeScalarCommon & {
  type: 'float'
}
/** Runtime scalar representation for a string. */
export type RuntimeStringScalar = RuntimeScalarCommon & {
  type: 'string'
  maxLength?: number
}

/** Ceramic-specific runtime scalar types. */
export type CustomRuntimeScalarType = 'commitid' | 'did' | 'id'

type RuntimeStringScalarType<Type extends CustomRuntimeScalarType> = RuntimeScalarCommon & {
  type: Type
  maxLength?: number
}

/** Runtime scalar representations. */
export type RuntimeScalar =
  | RuntimeBooleanScalar
  | RuntimeIntegerScalar
  | RuntimeFloatScalar
  | RuntimeStringScalar
  | RuntimeStringScalarType<'commitid'>
  | RuntimeStringScalarType<'did'>
  | RuntimeStringScalarType<'id'>
// | RuntimeStringScalarType<'streamref'>

/** Runtime scalar types. */
export type RuntimeScalarType = RuntimeScalar['type']

/** Runtime references types. */
export type RuntimeReferenceType =
  | 'connection' // to many documents relation
  | 'node' // to single document relation
  | 'object' // embedded object in document
// | 'union'

/** Runtime reference representation. */
export type RuntimeReference<T extends RuntimeReferenceType = RuntimeReferenceType> =
  RuntimeScalarCommon & {
    type: 'reference'
    refType: T
    refName: string
  }

/** Runtime list representation. */
export type RuntimeList = RuntimeScalarCommon & {
  type: 'list'
  item: RuntimeScalar | RuntimeReference<'object'>
}

/** Runtime view types. */
export type RuntimeViewType = 'documentAccount' | 'documentVersion'
/** Runtime view field representation. */
export type RuntimeViewField = { type: 'view'; viewType: RuntimeViewType }

/**Runtime object fields representations. */
export type RuntimeObjectField = RuntimeScalar | RuntimeList | RuntimeReference | RuntimeViewField
/** Runtime object property name to field representation mapping. */
export type RuntimeObjectFields = Record<string, RuntimeObjectField>

/** Runtime views types. */
export type RuntimeViewReferenceType = 'collection' | 'model'
/** Runtime view reference representation. */
export type RuntimeViewReference = { type: RuntimeViewReferenceType; name: string }

/**
 * Runtime composite definition, used by the {@linkcode graph.GraphClient GraphClient class} to
 * create a GraphQL schema to interact with.
 */
export type RuntimeCompositeDefinition = {
  /**
   * Models names to stream IDs mapping.
   */
  models: Record<string, string>
  /**
   * Objects structures, keyed by name.
   */
  objects: Record<string, RuntimeObjectFields>
  /**
   * Account-based relations.
   */
  accountData: Record<string, RuntimeViewReference>
  /**
   * Optional query-level entry-points.
   */
  query?: Record<string, RuntimeViewReference>
}
