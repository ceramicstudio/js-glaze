import { PassThrough } from 'stream'

describe('streams', () => {
  let spy = jest.spyOn(PassThrough, 'prototype', 'get')
})

// IF THE ABOVE FAILS RETURN TO OCLIF TESTING & MOCK:
// https://github.com/sindresorhus/ora/blob/main/test.js#L13
// import { expect, test } from '@oclif/test'

// // require('debug').enable('*')
// describe('stream', () => {
//   test
//     .stdout()
//     .command(['did:create'])
//     .it('errors', (ctx) => {
//       expect(ctx.stdout).to.contain('Created DID')
//     })
// })
