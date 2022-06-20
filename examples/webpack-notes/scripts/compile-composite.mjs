import { CeramicClient } from '@ceramicnetwork/http-client'
import { writeEncodedCompositeRuntime } from '@glazed/devtools-node'

await writeEncodedCompositeRuntime(
  new CeramicClient('http://localhost:7007'),
  new URL('../data/src/composite.json', import.meta.url),
  new URL('../src/__generated__/definition.ts', import.meta.url),
  new URL('../data/schema.graphql', import.meta.url)
)

console.log('Runtime files successfully written')
