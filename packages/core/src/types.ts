import type StreamID from '@ceramicnetwork/streamid'
import type { Definition } from '@ceramicstudio/idx-constants'

export type Aliases = Record<string, string>

export type DefinitionWithID<C extends Record<string, unknown> = Record<string, unknown>> =
  Definition<C> & { id: StreamID }

export type IndexKey = string
export type Index = Record<IndexKey, string>

export type Entry = {
  key: IndexKey
  id: string
  record: unknown
}
