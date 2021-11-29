import { expect, test } from '@oclif/test'

// describe('stream', () => {
//   test.command(['stream:commits', '', '--help']).it('displays a help message', (ctx) => {
//     expect(ctx.stdout).to.contain('Usage:')
//   })
// })

describe('stream functions', () => {
  test
    .stdout()
    .command(['stream:commits', '', '--help'])
    .it('displays a help message', (ctx) => {
      expect(ctx.stdout).to.contain('Usage:')
    })
  // Test.stdout()
  //   .command(['stream:commits', 'notAStreamID'])
  //   .it('Displays an error', (ctx) => {
  //     ctx.Expect(ctx.stdout).to.contain('Error: Missing 1 required arg:')
  //   })
})
