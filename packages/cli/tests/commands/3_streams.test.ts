test('hello', () => {
  expect(true).toBe(true)
})

// import { expect, test } from '@oclif/test'

// import { makeDID, createTile, globalKey } from '../utils'

// import Commits from '../../src/commands/stream/commits'
// import State from '../../src/commands/stream/state'

// describe('streams', async () => {
//   beforeEach(async () => {
//     if (!globalKey) {
//       await makeDID()
//     }
//   })
//   let tile: string
//   beforeEach(async () => {
//     if (!tile) {
//       tile = (await createTile()).id.toString()
//     }
//   })
//   describe('commits', () => {
//     test
//       .stderr()
//       .stdout({ print: false })
//       .it('loads all known commits', async (ctx) => {
//         await Commits.run([tile])
//         expect(ctx.stderr).to.contain('Stream commits loaded.')
//       })
//   })
//   describe('state', () => {
//     test
//       .stderr()
//       .stdout({ print: false })
//       .it('displays the requested streamID state', async (ctx) => {
//         await State.run([tile])
//         expect(ctx.stderr).to.contain('Successfully queried stream')
//       })
//   })
// })
