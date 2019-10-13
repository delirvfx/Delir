import { validateSchema } from './models'

describe('PreferenceStore', () => {
  describe('Schema validation', () => {
    it('Should passing validation with correct schema', () => {
      const actual = validateSchema({
        renderer: {
          ignoreMissingEffect: true,
        },
      })

      expect(actual).toBe(null)
    })

    it('Should failed validation with correct schema', () => {
      const actual = validateSchema({
        renderer: {
          ignoreMissingEffect: '💩',
        },
      })

      expect(actual).toBeInstanceOf(Error)
    })
  })
})
