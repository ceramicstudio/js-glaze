import type StreamID from '@ceramicnetwork/streamid'
import type {
  Definition,
  DefinitionName,
  SchemaName,
  PublishedDefinitions,
  PublishedSchemas,
} from '@ceramicstudio/idx-constants'
import type { JSONSchemaType } from 'ajv'
import type { DagJWSResult, JWSSignature } from 'dids'

export type { Definition } from '@ceramicstudio/idx-constants'

export type Schema<T = Record<string, any>> = JSONSchemaType<T> & {
  $comment?: string
  title?: string
}

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

export interface PublishDoc<T = Record<string, any>> {
  id?: StreamID | string
  content: T
  controllers?: Array<string>
  schema?: StreamID | string
}
export interface DefinitionDoc extends PublishDoc<Definition> {
  id: StreamID | string
}
export interface SchemaDoc<T = Record<string, any>> extends PublishDoc<Schema<T>> {
  name: string
}
