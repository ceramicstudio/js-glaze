import type {
  CeramicApi,
  CeramicCommit,
  CreateOpts,
  GenesisCommit,
  UpdateOpts,
} from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { promiseMap } from './utils'

/** @internal */
export async function publishCommits(
  ceramic: CeramicApi,
  [genesis, ...updates]: Array<CeramicCommit>,
  createOpts: CreateOpts = { anchor: false, pin: true },
  commitOpts: UpdateOpts = { anchor: false }
): Promise<TileDocument<Record<string, any>>> {
  const doc = await TileDocument.createFromGenesis<TileDocument<Record<string, any>>>(
    ceramic,
    genesis as GenesisCommit,
    createOpts
  )
  for (const commit of updates) {
    await ceramic.applyCommit(doc.id, commit, commitOpts)
  }
  return doc
}

/** @internal */
export async function publishSignedMap<T extends string = string>(
  ceramic: CeramicApi,
  signed: Record<T, Array<CeramicCommit>>,
  createOpts?: CreateOpts,
  commitOpts?: UpdateOpts
): Promise<Record<T, TileDocument>> {
  return await promiseMap(
    signed,
    async (commits) => await publishCommits(ceramic, commits, createOpts, commitOpts)
  )
}
