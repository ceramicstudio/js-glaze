import { CeramicClient } from '@ceramicnetwork/http-client'
import { Composite } from '@glazed/devtools'
import { printGraphQLSchema } from '@glazed/graphql'
import type { EncodedCompositeDefinition, RuntimeCompositeDefinition } from '@glazed/types'
import fs from 'fs-extra'
import { resolve } from 'path'
import { cwd } from 'process'
// // fs-extra is a CommonJS module
const { readJSON, writeFile, writeJSON } = fs

import type { PathInput } from './types.js'

export function getFilePath(path: PathInput): string {
  return path instanceof URL ? path.pathname : resolve(cwd(), path)
}

export async function readEncodedComposite(
  ceramic: CeramicClient | string,
  path: PathInput
): Promise<Composite> {
  const client = ceramic instanceof CeramicClient ? ceramic : new CeramicClient(ceramic)
  const file = getFilePath(path)
  const definition = (await readJSON(file)) as EncodedCompositeDefinition
  return Composite.fromJSON({ ceramic: client, definition })
}

export async function writeEncodedComposite(
  composite: Composite,
  path: PathInput
): Promise<string> {
  const file = getFilePath(path)
  await writeJSON(file, composite.toJSON())
  return file
}

export async function writeGraphQLSchema(
  definition: RuntimeCompositeDefinition,
  path: PathInput,
  readonly?: boolean
): Promise<string> {
  const file = getFilePath(path)
  await writeFile(file, printGraphQLSchema(definition, readonly))
  return file
}

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

export async function composeEncodedComposites(
  ceramic: CeramicClient | string,
  source: PathInput | Array<PathInput>,
  destination: PathInput
): Promise<string> {
  const sources = Array.isArray(source) ? source : [source]
  const composites = await Promise.all(
    sources.map(async (path) => await readEncodedComposite(ceramic, path))
  )
  const file = getFilePath(destination)
  await writeEncodedComposite(Composite.compose(composites), file)
  return file
}
