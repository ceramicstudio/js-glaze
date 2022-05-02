/**
 * Common types used by Glaze packages.
 *
 * @module types
 */

import type { JSONSchemaType } from 'ajv'
import type { DagJWSResult, JWSSignature } from 'dids'

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

/** JSON schema declaration, used for validating Ceramic streams. */
export type Schema<T = Record<string, any>> = JSONSchemaType<T> & {
  $comment?: string
  title?: string
}

/** Generic structure for storing model data. */
export type ModelData<T> = {
  definitions: Record<string, T>
  schemas: Record<string, T>
  tiles: Record<string, T>
}

/** Utility type for mapping a model structure of a given type to another. */
export type MapModelTypes<Model extends ModelData<any>, ToType> = {
  schemas: Record<keyof Model['schemas'], ToType>
  definitions: Record<keyof Model['definitions'], ToType>
  tiles: Record<keyof Model['tiles'], ToType>
}

/** Utility type for mapping a model structure to a given type. */
export type CastModelTo<Model extends ModelData<any> | void, ToType> = Model extends ModelData<any>
  ? MapModelTypes<Model, ToType>
  : ModelData<ToType>

/**
 * Data model aliases created by {@linkcode devtools.ModelManager.deploy deploying a managed model}
 * and used at runtime by the {@linkcode datamodel.DataModel DataModel} class.
 */
export type ModelAliases<Model extends ModelData<any> | void = void> = CastModelTo<Model, string>

/** Model aliases relations between schemas and the definitions and tiles using them. */
export type ModelTypeAliases<
  // Schema alias to content type
  Schemas extends Record<string, any> = Record<string, any>,
  // Definition alias to schema alias
  Definitions extends Record<string, keyof Schemas> = Record<string, string>,
  // Tile alias to schema alias
  Tiles extends Record<string, keyof Schemas> = Record<string, string>
> = {
  schemas: Schemas
  definitions: Definitions
  tiles: Tiles
}

/** Utility type to cast {@linkcode ModelTypeAliases} to {@linkcode ModelAliases}. */
export type ModelTypesToAliases<TypeAliases extends ModelTypeAliases> = MapModelTypes<
  TypeAliases,
  string
>

/** ID of a stream used in a {@linkcode ManagedModel}. */
export type ManagedID = string // StreamID

/** Shared structure for representing streams used in a {@linkcode ManagedModel}. */
export type ManagedDoc<CommitType = DagJWSResult> = {
  alias: string
  commits: Array<CommitType>
  version: string // CommitID
}

/**
 * Structure for representing streams having a schema dependency, used in a
 * {@linkcode ManagedModel}.
 */
export type ManagedEntry<CommitType = DagJWSResult> = ManagedDoc<CommitType> & {
  schema: ManagedID
}

/**
 * Structure for representing schema streams and their dependencies, used in a
 * {@linkcode ManagedModel}.
 */
export type ManagedSchema<CommitType = DagJWSResult> = ManagedDoc<CommitType> & {
  dependencies: Record<string, Array<ManagedID>> // path to schemas ManagedID
}

/**
 * Structure used internally by the {@linkcode devtools.ModelManager ModelManager} to represent a
 * data model.
 */
export type ManagedModel<CommitType = DagJWSResult> = {
  schemas: Record<ManagedID, ManagedSchema<CommitType>>
  definitions: Record<ManagedID, ManagedEntry<CommitType>>
  tiles: Record<ManagedID, ManagedEntry<CommitType>>
}

/**
 * JSON-encoded version of the {@linkcode ManagedModel}, used by the
 * {@linkcode devtools.ModelManager ModelManager}.
 */
export type EncodedManagedModel = ManagedModel<EncodedDagJWSResult>

export type GraphFieldCommon = {
  title?: string
}

export type GraphFieldBoolean = GraphFieldCommon & {
  type: 'boolean'
}
export type GraphFieldInteger = GraphFieldCommon & {
  type: 'integer'
}
export type GraphFieldFloat = GraphFieldCommon & {
  type: 'float'
}
export type GraphFieldString = GraphFieldCommon & {
  type: 'string'
  format?: 'date-time' | 'date' | 'duration' | 'time'
  maxLength?: number
}
export type GraphFieldDIDString = GraphFieldCommon & {
  type: 'did'
  maxLength?: number
}

export type GraphReferenceEntry = {
  owner: string
  schemas: Array<string>
}

export type GraphFieldList = GraphFieldCommon & {
  type: 'list'
  name: string
}
export type GraphFieldObject = GraphFieldCommon & {
  type: 'object'
  name: string
}
export type GraphFieldReference = GraphFieldCommon &
  GraphReferenceEntry & {
    type: 'reference'
  }

export type GraphItemField =
  | GraphFieldBoolean
  | GraphFieldInteger
  | GraphFieldFloat
  | GraphFieldString
  | GraphFieldDIDString
  | GraphFieldObject
  | GraphFieldReference

export type GraphObjectField = (GraphFieldList | GraphItemField) & { required?: boolean }
export type GraphObjectFields = Record<string, GraphObjectField>
export type GraphObjectEntry = {
  fields: GraphObjectFields
  parents?: Array<string> | null
}

export type GraphReferencedEntry = {
  type: 'collection' | 'object'
  name: string
}
export type GraphTileEntry = {
  id: string
  schema: string
}

export type GraphModel = {
  index: Record<string, GraphTileEntry> // alias to tile entry
  lists: Record<string, GraphItemField> // list alias to item type
  objects: Record<string, GraphObjectEntry> // alias to entry
  roots: Record<string, GraphTileEntry> // alias to tile entry
  referenced: Record<string, GraphReferencedEntry> // schema URL to referenced type
  references: Record<string, GraphReferenceEntry> // alias to reference entry
}
