import { teardown } from 'jest-dev-server'

export default async function globalTeardown() {
  await teardown({
    command:
      'rm -rf ./test/statestore && ceramic daemon --network inmemory --state-store-directory ./test/statestore',
    port: 7007,
    usedPortAction: 'kill',
  })
}
