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

export type PublishedModel<Model extends ModelData<any> | void = void> = CastModelTo<Model, string>

export type SignedModel<Model extends ModelData<any> | void = void> = CastModelTo<
  Model,
  Array<DagJWSResult>
>

export type EncodedSignedModel<Model extends ModelData<any> | void = void> = CastModelTo<
  Model,
  Array<EncodedDagJWSResult>
>

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
