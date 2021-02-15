const { inspect } = require('util')
const Ceramic = require('@ceramicnetwork/http-client').default
const { outputJSON } = require('fs-extra')

const { encodeSignedMap } = require('..')

const ceramic = new Ceramic(process.env.CERAMIC_URL)

function logJSON(data) {
  console.log(inspect(data, { colors: true, depth: null }))
}

async function writeJSON(path, data) {
  await outputJSON(path, data, { spaces: 2 })
}

async function writeSigned(path, data) {
  await writeJSON(path, encodeSignedMap(data))
}

module.exports = { ceramic, logJSON, writeJSON, writeSigned }
