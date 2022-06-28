import type {
  BaseQuery,
  CeramicApi,
  PageInfo as QueryPageInfo,
  Pagination,
  RunningStateLike,
  StreamState,
} from '@ceramicnetwork/common'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { StreamID } from '@ceramicnetwork/streamid'
import type {
  Connection,
  ConnectionArguments,
  Edge,
  PageInfo as RelayPageInfo,
} from 'graphql-relay'

export type ConnectionQuery = BaseQuery & ConnectionArguments
export type IndexQuery = BaseQuery & Pagination

export class RunningState implements RunningStateLike {
  #id: StreamID
  #state: StreamState

  constructor(state: StreamState) {
    this.#id = new StreamID(state.type, state.log[0].cid)
    this.#state = state
  }

  get id(): StreamID {
    return this.#id
  }

  get state(): StreamState {
    return this.#state
  }

  get value(): StreamState {
    return this.#state
  }

  next(): never {
    throw new Error('Unsupported method')
  }

  pipe(): never {
    throw new Error('Unsupported method')
  }

  subscribe(): never {
    throw new Error('Unsupported method')
  }
}

export function createModelInstance(state: StreamState): ModelInstanceDocument {
  if (state.type !== ModelInstanceDocument.STREAM_TYPE_ID) {
    throw new Error(`Unexpected stream type: ${state.type}`)
  }
  return new ModelInstanceDocument(new RunningState(state), {})
}

export function toIndexQuery(source: ConnectionQuery): IndexQuery {
  const { after, before, first, last, ...base } = source
  let query: IndexQuery
  if (first != null) {
    query = { ...base, first }
    if (after != null) {
      // eslint-disable-next-line
      // @ts-ignore defined as read-only
      query.after = after
    }
    return query
  }
  if (last != null) {
    query = { ...base, last }
    if (before != null) {
      // eslint-disable-next-line
      // @ts-ignore defined as read-only
      query.before = before
    }
    return query
  }
  throw new Error('Missing "first" or "last" connection argument')
}

export function toRelayPageInfo(info: QueryPageInfo): RelayPageInfo {
  return { ...info, startCursor: info.startCursor ?? null, endCursor: info.endCursor ?? null }
}

export async function queryConnection(
  ceramic: CeramicApi,
  query: ConnectionQuery
): Promise<Connection<ModelInstanceDocument>> {
  const result = await ceramic.index.queryIndex(toIndexQuery(query))
  const edges: Array<Edge<ModelInstanceDocument>> = result.entries.map((state) => {
    const node = createModelInstance(state)
    return { node } as Edge<ModelInstanceDocument>
  })
  return { edges, pageInfo: toRelayPageInfo(result.pageInfo) }
}

export async function querySingle(
  ceramic: CeramicApi,
  query: BaseQuery
): Promise<ModelInstanceDocument | null> {
  const result = await ceramic.index.queryIndex({ ...query, last: 1 })
  const state = result.entries[0]
  return state ? createModelInstance(state) : null
}
