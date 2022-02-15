import type { JSONSchemaType } from 'ajv'
import type { DagJWSResult, JWSSignature } from 'dids'

export type EncodedDagJWS = {
  payload: string
  signatures: Array<JWSSignature>
  link?: string
}

export type EncodedDagJWSResult = {
  jws: EncodedDagJWS
  linkedBlock: string // base64
}

export type Schema<T = Record<string, any>> = JSONSchemaType<T> & {
  $comment?: string
  title?: string
}

export type ModelData<T> = {
  definitions: Record<string, T>
  schemas: Record<string, T>
  tiles: Record<string, T>
}

export type MapModelTypes<Model extends ModelData<any>, ToType> = {
  schemas: Record<keyof Model['schemas'], ToType>
  definitions: Record<keyof Model['definitions'], ToType>
  tiles: Record<keyof Model['tiles'], ToType>
}

export type CastModelTo<Model extends ModelData<any> | void, ToType> = Model extends ModelData<any>
  ? MapModelTypes<Model, ToType>
  : ModelData<ToType>

export type ModelAliases<Model extends ModelData<any> | void = void> = CastModelTo<Model, string>

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

export type ModelTypesToAliases<TypeAliases extends ModelTypeAliases> = MapModelTypes<
  TypeAliases,
  string
>

export type ManagedID = string // StreamID

export type ManagedDoc<CommitType = DagJWSResult> = {
  alias: string
  commits: Array<CommitType>
  version: string // CommitID
}

export type ManagedEntry<CommitType = DagJWSResult> = ManagedDoc<CommitType> & {
  schema: ManagedID
}

export type ManagedSchema<CommitType = DagJWSResult> = ManagedDoc<CommitType> & {
  dependencies: Record<string, Array<ManagedID>> // path to schemas ManagedID
}

export type ManagedModel<CommitType = DagJWSResult> = {
  schemas: Record<ManagedID, ManagedSchema<CommitType>>
  definitions: Record<ManagedID, ManagedEntry<CommitType>>
  tiles: Record<ManagedID, ManagedEntry<CommitType>>
}

export type EncodedManagedModel = ManagedModel<EncodedDagJWSResult>
