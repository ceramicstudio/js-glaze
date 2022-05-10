// import { CeramicClient } from '@ceramicnetwork/http-client'
// import { type EncodedCompositeDe, Composite } from '@glazed/devtools'
// import { printGraphQLSchema } from '@glazed/graphql'
// import type { EncodedComposite } from '@glazed/types'
// import fs from 'fs-extra'
import { resolve } from 'path'
import { cwd } from 'process'
// // fs-extra is a CommonJS module
// const { readJSON, writeFile, writeJSON } = fs

export function getFilePath(path: URL | string): string {
  return path instanceof URL ? path.pathname : resolve(cwd(), path)
}

// export async function readEncodedModel(
//   ceramic: CeramicClient | string,
//   path: URL | string
// ): Promise<ModelManager> {
//   const client = ceramic instanceof CeramicClient ? ceramic : new CeramicClient(ceramic)
//   const file = getFilePath(path)
//   const model = (await readJSON(file)) as EncodedManagedModel
//   return ModelManager.fromJSON({ ceramic: client, model })
// }

// export async function writeEncodedModel(
//   manager: ModelManager,
//   path: URL | string
// ): Promise<string> {
//   const file = getFilePath(path)
//   await writeJSON(file, manager.toJSON())
//   return file
// }

// export async function writeGraphQLSchema(
//   manager: ModelManager,
//   path: URL | string
// ): Promise<string> {
//   const file = getFilePath(path)
//   const model = await createGraphModel(manager)
//   await writeJSON(file, printGraphQLSchema(model))
//   return file
// }

// export async function writeGraphRuntime(
//   manager: ModelManager,
//   path: URL | string
// ): Promise<string> {
//   const file = getFilePath(path)
//   const graphModel = await deployGraph(manager)
//   await writeFile(
//     file,
//     `// This is an auto-generated file, do not edit manually
// export const graph = ${JSON.stringify(graphModel)}`
//   )
//   return file
// }

// export async function writeEncodedModelGraphRuntime(
//   ceramic: CeramicClient | string,
//   modelPath: URL | string,
//   runtimePath: URL | string
// ): Promise<string> {
//   const model = await readEncodedModel(ceramic, modelPath)
//   return await writeGraphRuntime(model, runtimePath)
// }

// export async function writeModelRuntime(
//   manager: ModelManager,
//   path: URL | string
// ): Promise<string> {
//   const file = getFilePath(path)
//   const aliases = await manager.deploy()
//   await writeFile(
//     file,
//     `// This is an auto-generated file, do not edit manually
// export const aliases = ${JSON.stringify(aliases)}`
//   )
//   return file
// }

// export async function writeEncodedModelRuntime(
//   ceramic: CeramicClient | string,
//   modelPath: URL | string,
//   runtimePath: URL | string
// ): Promise<string> {
//   const model = await readEncodedModel(ceramic, modelPath)
//   return await writeModelRuntime(model, runtimePath)
// }
