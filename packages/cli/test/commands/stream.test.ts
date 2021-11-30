import { expect, test } from '@oclif/test'
// require('debug').enable('*')

describe('streams', async () => {
  test
    .stderr()
    .command(['stream:create', ''])
    .it('does not create a stream & returns an informative error', async (ctx) => {
      console.log('CTX: ', ctx.stderr)
      expect(ctx.stderr).to.contain('Error: Invalid argument spec:')
    })
})
