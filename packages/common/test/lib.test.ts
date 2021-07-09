import { CIP88_APPEND_COLLECTION_PREFIX, CIP88_REF_PREFIX } from '..'

test('AppendCollection prefix', () => {
  expect(CIP88_APPEND_COLLECTION_PREFIX).toBeDefined()
})

test('Ref prefix', () => {
  expect(CIP88_REF_PREFIX).toBeDefined()
})
