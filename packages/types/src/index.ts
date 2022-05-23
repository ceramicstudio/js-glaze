/**
 * Common types used by Glaze packages.
 *
 * @module types
 */

import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import type { DagJWSResult, JWSSignature } from 'dids'
import type { JSONSchema } from 'json-schema-typed/draft-2020-12'

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

export type StreamCommits = Array<DagJWSResult>
export type EncodedStreamCommits = Array<EncodedDagJWSResult>

export type ModelAccountRelation =
  | 'list' // Multiple documents, ordered by insertion time in the local node's database
  | 'set' // Multiple documents, but only one per reference (streamID or DID). Which field gets the set semantics is configured in 'relations'
  | 'link' // Single document
  | 'none' // No indexing

export type ModelRelationDefinition =
  | { type: 'account' }
  | { type: 'document'; models: Array<string> }
  | { type: 'setIndex' }

export type ModelRelationsDefinition = Record<string, ModelRelationDefinition>

export type ModelViewDefinition =
  | { type: 'documentAccount' }
  | { type: 'documentVersion' }
  | { type: 'referencedBy'; property: string }

export type ModelViewsDefinition = Record<string, ModelViewDefinition>

export type ModelDefinition = {
  name: string
  description?: string
  schema: JSONSchema.Object
  accountRelation: ModelAccountRelation
  relations?: ModelRelationsDefinition
  views?: ModelViewsDefinition
}

export interface Model {
  id: StreamID
  content: ModelDefinition
}

export type ReferencedFromViewDefinition = {
  type: 'ReferencedFrom'
  model: string
  property: string
  collection: boolean // TODO: use enum?
}

export type ReferencedFromViewDefinitions = Record<string, ReferencedFromViewDefinition>

export type CompositeViewsDefinition = {
  // TODO: Account-based views
  account: any
  // TODO: Query-level views
  root: any
  models: Record<string, ReferencedFromViewDefinitions>
}

export type CompositeDefinitionType<T> = {
  version: string
  models: Record<string, T>
  aliases?: Record<string, string>
  views?: CompositeViewsDefinition
  commonEmbeds?: Array<string>
}

export type InternalCompositeDefinition = CompositeDefinitionType<ModelDefinition>
export type EncodedCompositeDefinition = CompositeDefinitionType<EncodedStreamCommits>

export type DocumentMetadata = {
  controller: string
  model: string
}

export interface ModelInstanceDocument<T = Record<string, unknown>> {
  get id(): StreamID
  get commitId(): CommitID
  get metadata(): DocumentMetadata
  get content(): T
}

// Response payload for collection pattern queries
export type CollectionResponse<T = Record<string, unknown>> = {
  results: Array<ModelInstanceDocument<T>>
  total: number
}

// Pagination parameters for collection requests
export type PaginationParams = {
  skip?: number
  sort?: 'asc' | 'desc'
  limit: number
}
// Collection request parameters, including pagination options
export type CollectionRequest = PaginationParams & {
  account?: string // DID
  model: string // StreamID
}

// Response payload for a single link request
export type LinkResponse<T = Record<string, unknown>> = {
  result: ModelInstanceDocument<T> | null
}

// Single link request parameters
export type LinkRequest = {
  account: string // DID
  model: string // StreamID
}

// Response payload for a multi-links request
export type MultiLinkResponse<T = Record<string, unknown>> = {
  results: Record<string, ModelInstanceDocument<T> | null>
}

// Multi-links request parameters
export type MultiLinkRequest = {
  accounts: Array<string> // DID
  model: string // StreamID
}

export interface QueryAPIs {
  getLink(request: LinkRequest): Promise<LinkResponse>
  getCollection(request: CollectionRequest): Promise<CollectionResponse>
}

export type RuntimeScalarCommon = {
  required: boolean
}
export type RuntimeBooleanScalar = RuntimeScalarCommon & {
  type: 'boolean'
}
export type RuntimeIntegerScalar = RuntimeScalarCommon & {
  type: 'integer'
}
export type RuntimeFloatScalar = RuntimeScalarCommon & {
  type: 'float'
}
export type RuntimeStringScalar = RuntimeScalarCommon & {
  type: 'string'
  maxLength?: number
}

export type CustomRuntimeScalarType = 'did' | 'id' | 'streamref'
type RuntimeStringScalarType<Type extends CustomRuntimeScalarType> = RuntimeScalarCommon & {
  type: Type
  maxLength?: number
}

export type RuntimeScalar =
  | RuntimeBooleanScalar
  | RuntimeIntegerScalar
  | RuntimeFloatScalar
  | RuntimeStringScalar
  | RuntimeStringScalarType<'did'>
  | RuntimeStringScalarType<'id'>
  | RuntimeStringScalarType<'streamref'>
export type RuntimeScalarType = RuntimeScalar['type']

export type RuntimeReferenceType =
  | 'connection' // to many documents relation
  | 'node' // to single document relation
  | 'object' // embedded object in document
// | 'union'
export type RuntimeReference<T extends RuntimeReferenceType = RuntimeReferenceType> =
  RuntimeScalarCommon & {
    type: 'reference'
    refType: T
    refName: string
  }

export type RuntimeList = RuntimeScalarCommon & {
  type: 'list'
  item: RuntimeScalar | RuntimeReference<'object'>
}

export type RuntimeViewType = 'documentAccount' | 'documentVersion'
export type RuntimeViewField = { type: 'view'; viewType: RuntimeViewType }

export type RuntimeObjectField = RuntimeScalar | RuntimeList | RuntimeReference | RuntimeViewField
export type RuntimeObjectFields = Record<string, RuntimeObjectField>

export type RuntimeViewReferenceType = 'collection' | 'model'
export type RuntimeViewReference = { type: RuntimeViewReferenceType; name: string }

export type RuntimeCompositeDefinition = {
  models: Record<string, string> // Name key, streamID value
  objects: Record<string, RuntimeObjectFields> // Name key
  accountData: Record<string, RuntimeViewReference>
  query?: Record<string, RuntimeViewReference>
}
