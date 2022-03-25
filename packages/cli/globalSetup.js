import { setup } from 'jest-dev-server'

export default async function globalSetup() {
  await setup({
    command: 'ceramic daemon --network inmemory',
    debug: true,
    launchTimeout: 60000,
    port: 7007,
  })
}
