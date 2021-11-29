import { expect, test } from '@oclif/test'

import { Command as cmd } from '../../src/command'

describe('stream', () => {
  test
    .stdout()
    .do(() => cmd.run([]))
    .it('displays a help message', (ctx) => {
      expect(ctx.stdout).to.contain('Usage:')
    })
})
