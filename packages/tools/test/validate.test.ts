import { isSecureSchema, validateSchemaSecure } from '../src'

describe('validate', () => {
  describe('validateSchemaSecure', () => {
    it('returns false for an insecure schema', () => {
      const schema = {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            pattern: '^a',
          },
        },
      }
      expect(validateSchemaSecure(schema)).toBe(false)
    })

    it('returns true for an secure schema', () => {
      const schema = {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            pattern: '^a',
            maxLength: 5,
          },
        },
      }
      expect(validateSchemaSecure(schema)).toBe(true)
    })
  })

  describe('isSecureSchema', () => {
    it('throws an error for an invalid schema', () => {
      expect(() => isSecureSchema({ type: 'foo' })).toThrow()
    })

    it('returns false for an insecure schema', () => {
      const schema = {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            pattern: '^a',
          },
        },
      }
      expect(isSecureSchema(schema)).toBe(false)
    })

    it('returns true for an secure schema', () => {
      const schema = {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            pattern: '^a',
            maxLength: 5,
          },
        },
      }
      expect(isSecureSchema(schema)).toBe(true)
    })
  })
})
