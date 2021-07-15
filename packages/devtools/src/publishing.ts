import type {
  CeramicApi,
  CeramicCommit,
  GenesisCommit,
  StreamMetadata,
} from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { promiseMap } from './utils'

const PUBLISH_OPTS = { anchor: false, publish: false }

export async function createTile<T = Record<string, any>>(
  ceramic: CeramicApi,
  content: T,
  metadata: Partial<StreamMetadata> = {}
): Promise<TileDocument<T>> {
  if (ceramic.did == null) {
    throw new Error('Ceramic instance is not authenticated')
  }

  if (metadata.controllers == null || metadata.controllers.length === 0) {
    metadata.controllers = [ceramic.did.id]
  }

  const doc = await TileDocument.create<T>(ceramic, content, metadata)
  await ceramic.pin.add(doc.id)
  return doc
}

export async function publishCommits(
  ceramic: CeramicApi,
  [genesis, ...updates]: Array<CeramicCommit>
): Promise<TileDocument<Record<string, any>>> {
  const doc = await TileDocument.createFromGenesis<TileDocument<Record<string, any>>>(
    ceramic,
    genesis as GenesisCommit,
    PUBLISH_OPTS
  )
  await ceramic.pin.add(doc.id)
  for (const commit of updates) {
    await ceramic.applyCommit(doc.id, commit, PUBLISH_OPTS)
  }
  return doc
}

export async function publishSignedMap<T extends string = string>(
  ceramic: CeramicApi,
  signed: Record<T, Array<CeramicCommit>>
): Promise<Record<T, TileDocument>> {
  return await promiseMap(signed, async (commits) => await publishCommits(ceramic, commits))
}
