import { teardown } from 'jest-dev-server'

export default async function globalTeardown() {
  await teardown({
    command: 'ceramic daemon --network inmemory',
    port: 7007,
    usedPortAction: 'kill',
  })
}
