import { writeEncodedModelRuntime } from '@glazed/devtools-node'

await writeEncodedModelRuntime(
  process.env.CERAMIC_URL || 'https://ceramic-clay.3boxlabs.com',
  new URL('model.json', import.meta.url),
  new URL('../src/__generated__/aliases.ts', import.meta.url)
)

console.log('Model aliases written to src/__generated__/aliases.ts file')
