import type {
  CeramicApi,
  CeramicCommit,
  GenesisCommit,
  StreamMetadata,
} from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { schemas as publishedSchemas } from '@ceramicstudio/idx-constants'
import type {
  DefinitionName,
  PublishedDefinitions,
  PublishedSchemas,
  SchemaName,
} from '@ceramicstudio/idx-constants'
import isEqual from 'fast-deep-equal'

import { signedDefinitions, signedSchemas } from './signed'
import type {
  Definition,
  DefinitionDoc,
  PublishDoc,
  PublishedConfig,
  SchemaDoc,
  SignedDefinitions,
  SignedSchemas,
} from './types'
import { promiseMap, docIDToString } from './utils'
import { isValidDefinition, isSecureSchema } from './validate'

const PUBLISH_OPTS = { anchor: false, publish: false }

export async function createTile<T = unknown>(
  ceramic: CeramicApi,
  content: T,
  metadata: Partial<StreamMetadata> = {}
): Promise<TileDocument> {
  if (ceramic.did == null) {
    throw new Error('Ceramic instance is not authenticated')
  }

  if (metadata.controllers == null || metadata.controllers.length === 0) {
    metadata.controllers = [ceramic.did.id]
  }

  const doc = await TileDocument.create(ceramic, content, metadata)
  await ceramic.pin.add(doc.id)
  return doc
}

export async function publishDoc<T = unknown>(
  ceramic: CeramicApi,
  doc: PublishDoc<T>
): Promise<TileDocument> {
  if (doc.id == null) {
    return await createTile(ceramic, doc.content, {
      controllers: doc.controllers,
      schema: doc.schema ? docIDToString(doc.schema) : undefined,
    })
  }

  const loaded = await ceramic.loadStream<TileDocument>(doc.id)
  if (!isEqual(loaded.content, doc.content)) {
    await loaded.update(doc.content)
  }
  return loaded
}

export async function createDefinition(
  ceramic: CeramicApi,
  definition: Definition
): Promise<TileDocument> {
  if (!isValidDefinition(definition)) {
    throw new Error('Invalid definition')
  }
  return await createTile(ceramic, definition, { schema: publishedSchemas.Definition })
}

export async function updateDefinition(ceramic: CeramicApi, doc: DefinitionDoc): Promise<boolean> {
  const loaded = await ceramic.loadStream<TileDocument>(doc.id)
  if (loaded.metadata.schema !== publishedSchemas.Definition) {
    throw new Error('Document is not a valid Definition')
  }

  if (!isEqual(loaded.content, doc.content)) {
    await loaded.update(doc.content)
    return true
  }
  return false
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

export async function publishSchema(ceramic: CeramicApi, doc: SchemaDoc): Promise<TileDocument> {
  if (!isSecureSchema(doc.content)) {
    throw new Error(`Schema ${doc.name} is not secure`)
  }
  return await publishDoc(ceramic, doc)
}

export async function publishSignedMap<T extends string = string>(
  ceramic: CeramicApi,
  signed: Record<T, Array<CeramicCommit>>
): Promise<Record<T, TileDocument>> {
  return await promiseMap(signed, async (commits) => await publishCommits(ceramic, commits))
}

export async function publishIDXSignedDefinitions(
  ceramic: CeramicApi,
  definitions: SignedDefinitions = signedDefinitions
): Promise<PublishedDefinitions> {
  const signedMap = await publishSignedMap(ceramic, definitions)
  return Object.entries(signedMap).reduce((acc, [key, doc]) => {
    acc[key as DefinitionName] = doc.id.toString()
    return acc
  }, {} as PublishedDefinitions)
}

export async function publishIDXSignedSchemas(
  ceramic: CeramicApi,
  schemas: SignedSchemas = signedSchemas
): Promise<PublishedSchemas> {
  const signedMap = await publishSignedMap(ceramic, schemas)
  return Object.entries(signedMap).reduce((acc, [key, doc]) => {
    acc[key as SchemaName] = doc.commitId.toUrl()
    return acc
  }, {} as PublishedSchemas)
}

export async function publishIDXConfig(ceramic: CeramicApi): Promise<PublishedConfig> {
  const [definitions, schemas] = await Promise.all([
    publishIDXSignedDefinitions(ceramic),
    publishIDXSignedSchemas(ceramic),
  ])
  return { definitions, schemas }
}
