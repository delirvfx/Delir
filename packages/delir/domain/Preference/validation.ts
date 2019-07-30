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
        renderer: Joi.object()
            .keys({
                ignoreMissingEffect: Joi.boolean().required(),
            })
            .strict(true),
    })
    .strict(true)

export const validateSchema = (obj: any): Joi.ValidationError | null => {
    const result = Joi.validate(obj, preferenceSchema)
    return result.error
}
