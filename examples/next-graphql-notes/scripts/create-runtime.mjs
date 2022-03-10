import { writeEncodedModelGraphRuntime } from '@glazed/devtools-node'

await writeEncodedModelGraphRuntime(
  process.env.CERAMIC_URL || 'https://ceramic-clay.3boxlabs.com',
  new URL('../data/model.json', import.meta.url),
  new URL('../src/__generated__/model.ts', import.meta.url)
)

console.log('Deployed model written to src/__generated__/model.ts file')
