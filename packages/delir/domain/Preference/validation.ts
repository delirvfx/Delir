import * as Joi from 'joi'
import { Preference } from './PreferenceStore'

const preferenceSchema = Joi.object().keys({
    renderer: Joi.object().keys({
        ignoreMissingEffect: Joi.boolean().required()
    }).strict(true)
}).strict(true)

export const validateSchema = (obj: any): Joi.ValidationError | null => {
    const result = Joi.validate(obj, preferenceSchema)
    return result.error
}
