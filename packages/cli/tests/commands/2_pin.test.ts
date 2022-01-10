test('hello', () => {
  expect(true).toBe(true)
})

// import { expect, test } from '@oclif/test'

// import { makeDID, createTile, globalKey } from '../utils'

// import Add from '../../src/commands/pin/add'
// import Remove from '../../src/commands/pin/rm'
// import List from '../../src/commands/pin/ls'

// describe('pins', () => {
//   let id: string
//   beforeEach(async () => {
//     if (!globalKey) {
//       await makeDID()
//     }
//     if (!id) {
//       const tile = await createTile()
//       id = tile.id.toString()
//     }
//   })

//   describe('add', () => {
//     test
//       .stderr()
//       .stdout({ print: false })
//       .it('pins the stream.', async (ctx) => {
//         await Add.run([id])
//         expect(ctx.stderr).to.contain('Stream pinned.')
//       })
//   })
//   describe('remove', () => {
//     test
//       .stderr()
//       .stdout({ print: false })
//       .it('unpins the stream', async (ctx) => {
//         await Remove.run([id])
//         expect(ctx.stderr).to.contain('Stream unpinned')
//       })
//   })
//   describe('list', () => {
//     test
//       .stderr()
//       .stdout({ print: false })
//       .it('list all pinned streamIDs', async (ctx) => {
//         await List.run([])
//         expect(ctx.stderr).to.contain('Loaded pins list.')
//       })
//   })
// })
