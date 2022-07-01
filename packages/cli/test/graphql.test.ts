import { execa } from 'execa'
import { Readable } from 'node:stream'

describe('graphql', () => {
  describe('graphql:schema', () => {
    test('printing graphql schema succeeds', async () => {
      const schema = await execa('glaze', [
        'graphql:schema',
        'test/mocks/runtime.composite.picture.post.json',
      ])
      expect(schema.stdout.toString()).toMatchSnapshot()
    }, 60000)

    test('printing graphql schema succeeds with --readonly flag', async () => {
      const schema = await execa('glaze', [
        'graphql:schema',
        'test/mocks/runtime.composite.picture.post.json',
        '--readonly',
      ])
      expect(schema.stdout.toString()).toMatchSnapshot()
    }, 60000)
  })

  describe('graphql:server', () => {
    test('graphql server starts', async () => {
      const serverProcess = execa('glaze', [
        'graphql:server',
        'test/mocks/runtime.composite.picture.post.json',
        '--port=62433',
      ])
      let numChecks = 0
      serverProcess.stdout?.on('data', (data: Readable) => {
        if (numChecks === 0) {
          expect(
            data
              .toString()
              .includes('GraphQL server is listening on http://localhost:62433/graphql')
          ).toBe(true)
          numChecks++
        } else if (numChecks === 1) {
          expect(data.toString().includes('Server stopped')).toBe(true)
        }
      })
      await Promise.race([
        new Promise((resolve) =>
          setTimeout(() => {
            serverProcess.kill()
            resolve(true)
          }, 10000)
        ),
        serverProcess,
      ])
    }, 60000)

    test('graphql server starts with --readonly flag', async () => {
      const serverProcess = execa('glaze', [
        'graphql:server',
        'test/mocks/runtime.composite.picture.post.json',
        '--port=62610',
        '--readonly',
      ])
      let numChecks = 0
      serverProcess.stdout?.on('data', (data: Readable) => {
        if (numChecks === 0) {
          expect(
            data
              .toString()
              .includes('GraphQL server is listening on http://localhost:62610/graphql')
          ).toBe(true)
          numChecks++
        } else if (numChecks === 1) {
          expect(data.toString().includes('Server stopped')).toBe(true)
        }
      })
      await Promise.race([
        new Promise((resolve) =>
          setTimeout(() => {
            serverProcess.kill()
            resolve(true)
          }, 10000)
        ),
        serverProcess,
      ])
    }, 60000)
  })
})
