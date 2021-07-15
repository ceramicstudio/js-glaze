const { publishIDXConfig } = require('..')
const { ceramic, logJSON } = require('./common')

async function run() {
  const config = await publishIDXConfig(ceramic)
  console.log('IDX config published:')
  logJSON(config)

  process.exit(0)
}

run().catch(console.error)
