/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { profilesSchema } from '@glazed/test-schemas'

import { createRuntimeDefinition, getName, parseCompositeSchema } from '../src'

describe('Runtime format', () => {
  const parsedProfiles = parseCompositeSchema(profilesSchema)
  const profilesDefinition = {
    version: '1.0',
    commonEmbeds: parsedProfiles.commonEmbeds,
    models: parsedProfiles.models.reduce((acc, model) => {
      acc[`${model.name}ID`] = model
      return acc
    }, {}),
  }

  describe('getName()', () => {
    test('converts input to pascal case', () => {
      expect(getName('Foo bar')).toBe('FooBar')
      expect(getName('foo_bar')).toBe('FooBar')
      expect(getName('Foo-bar')).toBe('FooBar')
    })

    test('adds the prefix', () => {
      expect(getName('bar', 'Foo')).toBe('FooBar')
      expect(getName('foo_bar', 'Bar')).toBe('BarFooBar')
    })

    test('ignores the prefix if already included', () => {
      expect(getName('foo_bar', 'Foo')).toBe('FooBar')
    })
  })

  test('Profile - multiples models with common local references', () => {
    const runtime = createRuntimeDefinition(profilesDefinition)
    expect(runtime).toMatchSnapshot()
  })

  test('Profile definition with added model view', () => {
    const runtime = createRuntimeDefinition({
      ...profilesDefinition,
      views: { models: { GenericProfileID: { version: { type: 'documentVersion' } } } },
    })
    expect(runtime).toMatchSnapshot()
  })
})
