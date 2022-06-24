import { setup } from 'jest-dev-server'

export default async function globalSetup() {
  await setup({
    command:
      'rm -rf ~/.goipfs && rm -rf ./test/statestore && rm -rf ./test/test_output_files && mkdir ./test/test_output_files  && ceramic daemon --network inmemory --state-store-directory ./test/statestore',
    debug: true,
    launchTimeout: 60000,
    port: 7007,
  })
}
