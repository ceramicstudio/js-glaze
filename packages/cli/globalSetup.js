import { setup } from 'jest-dev-server'

export default async function globalSetup() {
  await setup({
    command:
      'rm -rf ~/.goipfs && rm -rf ./test/statestore && ceramic daemon --network inmemory --state-store-directory ./test/statestore',
    debug: true,
    launchTimeout: 60000,
    port: 7007,
  })
}
