import type { ModelDefinition } from '@glazed/types'

import { Composite, type CompositeParams } from '../src'

describe('composite', () => {
  describe('Composite instance', () => {
    describe('constructor()', () => {
      test('throws if the version is not compatible', () => {
        expect(
          () => new Composite({ commits: {}, definition: { version: '2.0', models: {} } })
        ).toThrow('Unsupported Composite version 2.0, expected version 1.0')
      })

      test('throws if commits do not match the definition models', () => {
        expect(() => {
          new Composite({
            commits: { fooID: [] },
            definition: {
              version: '1.1',
              models: {
                fooID: {} as unknown as ModelDefinition,
                barID: {} as unknown as ModelDefinition,
              },
            },
          })
        }).toThrow('Missing commits for model barID')
      })
    })

    test('hash() getter returns a stable hash', () => {
      const source = new Composite({
        commits: { fooID: [], barID: [] },
        definition: {
          version: '1.0',
          models: {
            fooID: { name: 'Foo', accountRelation: 'link', schema: {} },
            barID: { name: 'Bar', accountRelation: 'link', schema: {} },
          },
          aliases: { fooID: 'Test', barID: 'Other' },
        },
      })
      const hash = source.hash
      const clone = source.clone()
      expect(clone.hash).toBe(hash)
      expect(source.hash).toBe(hash)
    })

    describe('equals()', () => {
      const params: CompositeParams = {
        commits: { fooID: [], barID: [] },
        definition: {
          version: '1.0',
          models: {
            fooID: { name: 'Foo', accountRelation: 'link', schema: {} },
            barID: { name: 'Bar', accountRelation: 'link', schema: {} },
          },
          aliases: { fooID: 'Test', barID: 'Other' },
        },
      }
      const source = new Composite(params)

      test('with CompositeParams', () => {
        expect(source.equals(params)).toBe(true)
        expect(source.equals({ commits: {}, definition: { version: '1.0', models: {} } })).toBe(
          false
        )
      })

      test('with Composite instance', () => {
        expect(source.equals(source.clone())).toBe(true)
        expect(source.equals(source.setAliases({ fooID: 'Test' }))).toBe(true)
        expect(source.equals(source.setAliases({ bazID: 'Baz' }))).toBe(false)
      })
    })

    test('toJSON() returns a JSON-encoded composite', () => {
      const composite = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
      const encoded = composite.toJSON()
      expect(encoded).toMatchSnapshot()
    })

    test('toParams() returns copies of the Composite commits and definition', () => {
      const inputParams = { commits: {}, definition: { version: '1.0', models: {} } }
      const composite = new Composite(inputParams)
      expect(composite.toParams()).toMatchObject(inputParams)
    })

    test('toRuntime() returns the runtime definition for the Composite', () => {
      const composite = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
      const runtime = composite.toRuntime()
      expect(runtime).toMatchSnapshot()
    })

    test('clone() returns a cloned Composite instance', () => {
      const source = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
      const sourceParams = source.toParams()
      const clone = source.clone()
      expect(clone.toParams()).toEqual(sourceParams)
    })

    describe('copy() creates a copy of the composite with only selected models', () => {
      const source = new Composite({
        commits: { fooID: [], barID: [] },
        definition: {
          version: '1.0',
          models: {
            fooID: { name: 'Foo', accountRelation: 'link', schema: {} },
            barID: { name: 'Bar', accountRelation: 'link', schema: {} },
          },
          aliases: { fooID: 'Test', barID: 'Other' },
        },
      })

      test('throws an error if no model is set', () => {
        expect(() => {
          source.copy([])
        }).toThrow('Missing models to copy')
      })

      test('throws an error if a model is not found', () => {
        expect(() => {
          source.copy(['unknown'])
        }).toThrow('Model not found: unknown')
      })

      test('identifies models by ID', () => {
        const copy = source.copy(['fooID'])
        expect(copy.toParams()).toEqual({
          commits: { fooID: [] },
          definition: {
            version: '1.0',
            models: { fooID: { name: 'Foo', accountRelation: 'link', schema: {} } },
            aliases: { fooID: 'Test' },
            commonEmbeds: [],
            views: { account: {}, models: {}, root: {} },
          },
        })
      })

      test('identifies models by name', () => {
        const copy = source.copy(['Foo'])
        expect(copy.toParams()).toEqual({
          commits: { fooID: [] },
          definition: {
            version: '1.0',
            models: { fooID: { name: 'Foo', accountRelation: 'link', schema: {} } },
            aliases: { fooID: 'Test' },
            commonEmbeds: [],
            views: { account: {}, models: {}, root: {} },
          },
        })
      })

      test('identifies models by alias', () => {
        const copy = source.copy(['Test'])
        expect(copy.toParams()).toEqual({
          commits: { fooID: [] },
          definition: {
            version: '1.0',
            models: { fooID: { name: 'Foo', accountRelation: 'link', schema: {} } },
            aliases: { fooID: 'Test' },
            commonEmbeds: [],
            views: { account: {}, models: {}, root: {} },
          },
        })
      })
    })

    describe('setAliases()', () => {
      test('merging with existing', () => {
        const source = new Composite({
          commits: {},
          definition: { version: '1.0', models: {}, aliases: { fooID: 'foo', barID: 'bar' } },
        })
        const copy = source.setAliases({ barID: 'test', bazID: 'baz' })
        expect(source.toParams().definition.aliases).toEqual({ fooID: 'foo', barID: 'bar' })
        expect(copy.toParams().definition.aliases).toEqual({
          fooID: 'foo',
          barID: 'test',
          bazID: 'baz',
        })
      })

      test('replacing existing', () => {
        const source = new Composite({
          commits: {},
          definition: { version: '1.0', models: {}, aliases: { fooID: 'foo', barID: 'bar' } },
        })
        const copy = source.setAliases({ barID: 'test', bazID: 'baz' }, true)
        expect(source.toParams().definition.aliases).toEqual({ fooID: 'foo', barID: 'bar' })
        expect(copy.toParams().definition.aliases).toEqual({ barID: 'test', bazID: 'baz' })
      })
    })

    describe('setCommonEmbeds()', () => {
      test('merging with existing', () => {
        const source = new Composite({
          commits: {},
          definition: { version: '1.0', models: {}, commonEmbeds: ['Foo', 'Bar'] },
        })
        const copy = source.setCommonEmbeds(['Bar', 'Baz'])
        expect(source.toParams().definition.commonEmbeds).toEqual(['Foo', 'Bar'])
        expect(copy.toParams().definition.commonEmbeds).toEqual(['Foo', 'Bar', 'Baz'])
      })

      test('replacing existing', () => {
        const source = new Composite({
          commits: {},
          definition: { version: '1.0', models: {}, commonEmbeds: ['Foo', 'Bar'] },
        })
        const copy = source.setCommonEmbeds(['Bar', 'Baz'], true)
        expect(source.toParams().definition.commonEmbeds).toEqual(['Foo', 'Bar'])
        expect(copy.toParams().definition.commonEmbeds).toEqual(['Bar', 'Baz'])
      })
    })

    describe('setViews()', () => {
      test('merging with existing', () => {
        const source = new Composite({
          commits: {},
          definition: {
            version: '1.0',
            models: {},
            views: {
              account: { foo: {} },
              models: {
                model: {
                  foo: {
                    type: 'ReferencedFrom',
                    model: 'foo',
                    property: 'foo',
                    collection: false,
                  },
                  bar: {
                    type: 'ReferencedFrom',
                    model: 'bar',
                    property: 'bar',
                    collection: false,
                  },
                },
              },
              root: { foo: {} },
            },
          },
        })
        const copy = source.setViews({
          account: {},
          models: {
            model: {
              bar: {
                type: 'ReferencedFrom',
                model: 'test',
                property: 'test',
                collection: false,
              },
            },
          },
          root: { foo: 'test', bar: 'test' },
        })
        expect(source.toParams().definition.views).toEqual({
          account: { foo: {} },
          models: {
            model: {
              foo: {
                type: 'ReferencedFrom',
                model: 'foo',
                property: 'foo',
                collection: false,
              },
              bar: {
                type: 'ReferencedFrom',
                model: 'bar',
                property: 'bar',
                collection: false,
              },
            },
          },
          root: { foo: {} },
        })
        expect(copy.toParams().definition.views).toEqual({
          account: { foo: {} },
          models: {
            model: {
              foo: {
                type: 'ReferencedFrom',
                model: 'foo',
                property: 'foo',
                collection: false,
              },
              bar: {
                type: 'ReferencedFrom',
                model: 'test',
                property: 'test',
                collection: false,
              },
            },
          },
          root: { foo: 'test', bar: 'test' },
        })
      })
    })

    describe('merge() merges composites into the instance', () => {
      test('supports Composite instances and params inputs', () => {
        const source = new Composite({
          commits: { fooID: [] },
          definition: {
            version: '1.0',
            models: { fooID: { name: 'Foo', accountRelation: 'link', schema: {} } },
          },
        })
        const otherInstance = new Composite({
          commits: { barID: [] },
          definition: {
            version: '1.0',
            models: { barID: { name: 'Bar', accountRelation: 'link', schema: {} } },
          },
        })
        const otherParams: CompositeParams = {
          commits: { bazID: [] },
          definition: {
            version: '1.0',
            models: { bazID: { name: 'Baz', accountRelation: 'link', schema: {} } },
            aliases: { bazID: 'Test' },
          },
        }
        const composite = source.merge([otherInstance, otherParams])
        expect(composite.toParams()).toEqual({
          commits: { fooID: [], barID: [], bazID: [] },
          definition: {
            version: '1.0',
            models: {
              fooID: { name: 'Foo', accountRelation: 'link', schema: {} },
              barID: { name: 'Bar', accountRelation: 'link', schema: {} },
              bazID: { name: 'Baz', accountRelation: 'link', schema: {} },
            },
            aliases: { bazID: 'Test' },
            commonEmbeds: [],
            views: {
              account: {},
              models: {},
              root: {},
            },
          },
        })
      })

      test('throws if any input uses an unsupported version', () => {
        const composite = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const other = { commits: {}, definition: { version: '2.0', models: {} } }
        expect(() => composite.merge(other)).toThrow(
          'Unsupported Composite version 2.0, expected version 1.0'
        )
      })

      test('throws if any input does not have matching commits', () => {
        const composite = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const other: CompositeParams = {
          commits: {},
          definition: {
            version: '1.5',
            models: { fooID: { name: 'Foo', accountRelation: 'link', schema: {} } },
          },
        }
        expect(() => composite.merge(other)).toThrow('Missing commits for model fooID')
      })

      test('with aliases', () => {
        const source = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const composite = source.merge(
          [
            {
              commits: {},
              definition: { version: '1.0', models: {}, aliases: { fooID: 'Foo', barID: 'Bar' } },
            },
            {
              commits: {},
              definition: { version: '1.0', models: {}, aliases: { barID: 'Test', bazID: 'Baz' } },
            },
          ],
          { aliases: { bazID: 'Test' } }
        )
        expect(composite.toParams().definition.aliases).toEqual({
          fooID: 'Foo',
          barID: 'Test',
          bazID: 'Test',
        })
      })

      test('with no common embeds (default)', () => {
        const source = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const composite = source.merge([
          {
            commits: {},
            definition: { version: '1.0', models: {}, commonEmbeds: ['Foo', 'Bar'] },
          },
          { commits: {}, definition: { version: '1.0', models: {} } },
        ])
        expect(composite.toParams().definition.commonEmbeds).toHaveLength(0)
      })

      test('with all common embeds', () => {
        const source = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const composite = source.merge(
          [
            {
              commits: {},
              definition: { version: '1.0', models: {}, commonEmbeds: ['Foo', 'Bar'] },
            },
            {
              commits: {},
              definition: { version: '1.0', models: {}, commonEmbeds: ['Bar', 'Baz'] },
            },
          ],
          { commonEmbeds: 'all' }
        )
        expect(composite.toParams().definition.commonEmbeds).toEqual(['Foo', 'Bar', 'Baz'])
      })

      test('with specific common embeds', () => {
        const source = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const composite = source.merge(
          [
            {
              commits: {},
              definition: { version: '1.0', models: {}, commonEmbeds: ['Foo', 'Bar'] },
            },
            {
              commits: {},
              definition: { version: '1.0', models: {}, commonEmbeds: ['Bar', 'Baz'] },
            },
          ],
          { commonEmbeds: ['Some', 'Other'] }
        )
        expect(composite.toParams().definition.commonEmbeds).toEqual(['Some', 'Other'])
      })

      test('with views', () => {
        const source = new Composite({ commits: {}, definition: { version: '1.0', models: {} } })
        const composite = source.merge(
          [
            {
              commits: {},
              definition: {
                version: '1.0',
                models: {},
                views: { account: { foo: {} }, models: {}, root: {} },
              },
            },
            {
              commits: {},
              definition: {
                version: '1.0',
                models: {},
                views: { account: { bar: {} }, models: {}, root: { foo: {} } },
              },
            },
          ],
          { views: { account: {}, models: {}, root: { foo: 'test' } } }
        )
        expect(composite.toParams().definition.views).toEqual({
          account: { foo: {}, bar: {} },
          models: {},
          root: { foo: 'test' },
        })
      })
    })
  })

  test('Composite.compose() merges composites into a new instance', () => {
    const first: CompositeParams = {
      commits: { fooID: [] },
      definition: {
        version: '1.0',
        commonEmbeds: ['First'],
        models: { fooID: { name: 'Foo', accountRelation: 'link', schema: {} } },
      },
    }
    const second: CompositeParams = {
      commits: { barID: [] },
      definition: {
        version: '1.0',
        commonEmbeds: ['First', 'Second'],
        models: { barID: { name: 'Bar', accountRelation: 'link', schema: {} } },
      },
    }
    const third: CompositeParams = {
      commits: { bazID: [] },
      definition: {
        version: '1.0',
        models: { bazID: { name: 'Baz', accountRelation: 'link', schema: {} } },
        aliases: { bazID: 'Test' },
      },
    }
    const composite = Composite.compose([new Composite(first), second, third], {
      commonEmbeds: 'all',
    })
    const params = composite.toParams()
    expect(params).toEqual({
      commits: { fooID: [], barID: [], bazID: [] },
      definition: {
        version: '1.0',
        models: {
          fooID: { name: 'Foo', accountRelation: 'link', schema: {} },
          barID: { name: 'Bar', accountRelation: 'link', schema: {} },
          bazID: { name: 'Baz', accountRelation: 'link', schema: {} },
        },
        aliases: { bazID: 'Test' },
        commonEmbeds: ['First', 'Second'],
        views: {
          account: {},
          models: {},
          root: {},
        },
      },
    })
    // Source composites should not be altered
    expect(params).not.toEqual(first)
    expect(params).not.toEqual(second)
    expect(params).not.toEqual(third)
  })
})
