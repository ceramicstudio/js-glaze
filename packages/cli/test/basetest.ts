import { expect, test } from '@oclif/test'
// require('debug').enable('*')

describe('stream', async () => {
  test
    .stderr()
    .command(['did:create', '--help'])
    .it('creates a did', async (ctx) => {
      console.log(ctx.stderr)
      expect(ctx.stderr).to.contain('Created DID')
    })
})
