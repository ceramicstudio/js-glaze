import { readFile, writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager, deployGraph } from '@glazed/devtools'

const CERAMIC_URL = process.env.CERAMIC_URL || 'https://ceramic-clay.3boxlabs.com'

// Connect to the Ceramic node
const ceramic = new CeramicClient(CERAMIC_URL)

// Load and create a manager for the model
const bytes = await readFile(new URL('../data/model.json', import.meta.url))
const manager = ModelManager.fromJSON({ ceramic, model: JSON.parse(bytes.toString()) })

// Write deployed model aliases to file
const graphModel = await deployGraph(manager)
await writeFile(
  new URL('../src/__generated__/model.ts', import.meta.url),
  `// This is an auto-gerated file, do not edit manually

import type { GraphModel } from '@glazed/types'

export const graph: GraphModel = ${JSON.stringify(graphModel)}`
)

console.log('Deployed model written to src/__generated__/model.ts file')
