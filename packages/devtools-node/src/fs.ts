import { CeramicClient } from '@ceramicnetwork/http-client'
import { Composite } from '@glazed/devtools'
import { printGraphQLSchema } from '@glazed/graph'
import type { EncodedCompositeDefinition, RuntimeCompositeDefinition } from '@glazed/types'
import fs from 'fs-extra'
import { resolve } from 'path'
import { cwd } from 'process'
// // fs-extra is a CommonJS module
const { readFile, readJSON, writeFile, writeJSON } = fs

import type { PathInput } from './types.js'

/** @internal */
export function getFilePath(path: PathInput): string {
  return path instanceof URL ? path.pathname : resolve(cwd(), path)
}

/**
 * Create a Composite from a GraphQL schema path.
 */
export async function createComposite(
  ceramic: CeramicClient | string,
  path: PathInput
): Promise<Composite> {
  const client = ceramic instanceof CeramicClient ? ceramic : new CeramicClient(ceramic)
  const file = await readFile(getFilePath(path))
  return await Composite.create({ ceramic: client, schema: file.toString() })
}

/**
 * Create a Composite from a JSON-encoded definition path.
 */
export async function readEncodedComposite(
  ceramic: CeramicClient | string,
  path: PathInput
): Promise<Composite> {
  const client = ceramic instanceof CeramicClient ? ceramic : new CeramicClient(ceramic)
  const file = getFilePath(path)
  const definition = (await readJSON(file)) as EncodedCompositeDefinition
  return Composite.fromJSON({ ceramic: client, definition })
}

/**
 * Write a JSON-encoded definition for the given composite to the given file path.
 */
export async function writeEncodedComposite(
  composite: Composite,
  path: PathInput
): Promise<string> {
  const file = getFilePath(path)
  await writeJSON(file, composite.toJSON())
  return file
}

/**
 * Write the runtime GraphQL schema from the runtime composite definition.
 */
export async function writeGraphQLSchema(
  definition: RuntimeCompositeDefinition,
  path: PathInput,
  readonly?: boolean
): Promise<string> {
  const file = getFilePath(path)
  await writeFile(file, printGraphQLSchema(definition, readonly))
  return file
}

/**
 * Write the runtime definition for a given path, based on the file extension. Supports `.json`,
 * `.js` and `.ts` extensions.
 */
export async function writeRuntimeDefinition(
  definition: RuntimeCompositeDefinition,
  path: PathInput
): Promise<string> {
  const file = getFilePath(path)

  if (file.endsWith('.json')) {
    await writeJSON(file, definition)
  } else if (file.endsWith('.js')) {
    await writeFile(
      file,
      `// This is an auto-generated file, do not edit manually
export const definition = ${JSON.stringify(definition)}`
    )
  } else if (file.endsWith('.ts')) {
    await writeFile(
      file,
      `// This is an auto-generated file, do not edit manually
import type { RuntimeCompositeDefinition } from '@glazed/types'
export const definition: RuntimeCompositeDefinition = ${JSON.stringify(definition)}`
    )
  } else {
    throw new Error('Unsupported file type: only .json, .js and .ts extensions are supported')
  }

  return file
}

/**
 * Write the runtime definition based on the encoded definition path.
 */
export async function writeEncodedCompositeRuntime(
  ceramic: CeramicClient | string,
  definitionPath: PathInput,
  runtimePath: PathInput,
  schemaPath?: PathInput
): Promise<void> {
  const definition = await readEncodedComposite(ceramic, definitionPath)
  const runtime = definition.toRuntime()
  await writeRuntimeDefinition(runtime, runtimePath)
  if (schemaPath != null) {
    await writeGraphQLSchema(runtime, schemaPath)
  }
}

/**
 * Merge the encoded `source` composite(s) to the `destination` path.
 */
export async function mergeEncodedComposites(
  ceramic: CeramicClient | string,
  source: PathInput | Array<PathInput>,
  destination: PathInput
): Promise<string> {
  const sources = Array.isArray(source) ? source : [source]
  const composites = await Promise.all(
    sources.map(async (path) => await readEncodedComposite(ceramic, path))
  )
  const file = getFilePath(destination)
  await writeEncodedComposite(Composite.from(composites), file)
  return file
}
