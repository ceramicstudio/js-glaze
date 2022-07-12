import { setup } from 'jest-dev-server'
import { Model } from '@ceramicnetwork/stream-model'
import fs from 'fs-extra';

export default async function globalSetup() {
  const CWD = new URL(`file://${process.cwd()}/`);
  const TEST_DIR_PATH = new URL('test/', CWD)
  const CONFIG_DIR_PATH = new URL('config/', TEST_DIR_PATH)
  const CONFIG_PATH = new URL('daemon.config.json', CONFIG_DIR_PATH)
  const STATE_STORE_DIRECTORY = new URL('statestore/', TEST_DIR_PATH)
  const INDEXING_DB_FILENAME = new URL('indexing.sqlite', CONFIG_DIR_PATH)

  // Create the custom config here to make sure that we start with a clear indexing db setup each time
  // TODO: Investigate why the indexing API throws errors when we run tests several times without cleaning the db
  const TEST_DAEMON_CONFIG = {
    anchor: {},
    'http-api': { 'cors-allowed-origins': [new RegExp('.*')] },
    ipfs: { mode: 'bundled' },
    logger: { 'log-level': 2, 'log-to-files': false },
    metrics: {
      'metrics-exporter-enabled': false,
      'metrics-port': 9090,
    },
    network: { name: 'testnet-clay' },
    node: {},
    'state-store': {
      mode: 'fs',
      'local-directory': STATE_STORE_DIRECTORY.pathname,
    },
    indexing: {
      db: `sqlite://${INDEXING_DB_FILENAME.pathname}`,
      models: [Model.MODEL.toString()],
    },
  }

  await fs.ensureDir(CONFIG_DIR_PATH)
  await fs.writeJson(CONFIG_PATH, TEST_DAEMON_CONFIG)

  await setup({
    command:
      `CERAMIC_ENABLE_EXPERIMENTAL_INDEXING=\'true\' rm -rf ~/.goipfs && rm -rf ${STATE_STORE_DIRECTORY.pathname} && rm -rf ./test/test_output_files && rm -rf ${INDEXING_DB_FILENAME.pathname} && rm -rf ${CONFIG_PATH} && mkdir ./test/test_output_files  && ceramic daemon --network inmemory --state-store-directory ./test/statestore --config ${CONFIG_PATH}`,
    debug: true,
    launchTimeout: 60000,
    port: 7007,
  })
}
