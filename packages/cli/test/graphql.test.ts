import { execa } from 'execa'

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
      expect.assertions(2)
      try {
        await execa(
          'glaze',
          ['graphql:server', 'test/mocks/runtime.composite.picture.post.json', '--port=62433'],
          {
            timeout: 15000,
          }
        )
      } catch (e) {
        expect((e as Error).message.includes('Timed out')).toBe(true)
        expect(
          (e as Error).message.includes(
            'GraphQL server is listening on http://localhost:62433/graphql'
          )
        ).toBe(true)
      }
    }, 60000)

    test('graphql server starts with --readonly flag', async () => {
      expect.assertions(2)
      try {
        await execa(
          'glaze',
          [
            'graphql:server',
            'test/mocks/runtime.composite.picture.post.json',
            '--port=62610',
            '--readonly',
          ],
          {
            timeout: 15000,
          }
        )
      } catch (e) {
        expect((e as Error).message.includes('Timed out')).toBe(true)
        expect(
          (e as Error).message.includes(
            'GraphQL server is listening on http://localhost:62610/graphql'
          )
        ).toBe(true)
      }
    }, 60000)
  })
})
