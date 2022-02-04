const { teardown: teardownDevServer } = require('jest-dev-server')

module.exports = async function globalTeardown() {
  await teardownDevServer({
    command: 'ceramic daemon --network inmemory',
    port: 7007,
    usedPortAction: 'kill',
  })
}
