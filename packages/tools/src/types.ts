import type DocID from '@ceramicnetwork/docid'
import type {
  Definition,
  DefinitionName,
  SchemaName,
  PublishedDefinitions,
  PublishedSchemas,
} from '@ceramicstudio/idx-constants'
import type { DagJWSResult, JWSSignature } from 'dids'

export type { Definition } from '@ceramicstudio/idx-constants'

export type Schema = Record<string, any>

export interface EncodedDagJWS {
  payload: string
  signatures: Array<JWSSignature>
  link?: string
}

export interface EncodedDagJWSResult {
  jws: EncodedDagJWS
  linkedBlock: string // base64
}

type SignedRecord<K extends string> = Record<K, Array<DagJWSResult>>
export type SignedDefinitions = SignedRecord<DefinitionName>
export type SignedSchemas = SignedRecord<SchemaName>

export interface PublishedConfig {
  definitions: PublishedDefinitions
  schemas: PublishedSchemas
}

export interface PublishDoc<T = unknown> {
  id?: DocID | string
  content: T
  controllers?: Array<string>
  schema?: DocID | string
}
export interface DefinitionDoc extends PublishDoc<Definition> {
  id: DocID | string
}
export interface SchemaDoc extends PublishDoc<Schema> {
  name: string
}
