import Joi from 'joi'

const preferenceSchema = Joi.object()
  .keys({
    editor: Joi.object()
      .keys({
        audioVolume: Joi.number()
          .min(0)
          .max(100)
          .required(),
      })
      .strict(),
    develop: Joi.object()
      .keys({
        pluginDirs: Joi.array().items(Joi.string()),
      })
      .strict(),
    renderer: Joi.object()
      .keys({
        ignoreMissingEffect: Joi.boolean().required(),
      })
      .strict(),
  })
  .strict()

export const validateSchema = (obj: any): Joi.ValidationError | null => {
  const result = Joi.validate(obj, preferenceSchema)
  return result.error
}
