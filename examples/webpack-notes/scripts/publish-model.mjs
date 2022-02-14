import { readFile, writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'

// Connect to the local Ceramic node
const ceramic = new CeramicClient('http://localhost:7007')

// Load and create a manager for the model
const bytes = await readFile(new URL('model.json', import.meta.url))
const manager = ModelManager.fromJSON({ ceramic, model: JSON.parse(bytes.toString()) })

// Write model to JSON file
const publishedModel = await manager.toPublished()
await writeFile(new URL('../src/model.json', import.meta.url), JSON.stringify(publishedModel))

console.log('Model written to src/model.json file:', publishedModel)
