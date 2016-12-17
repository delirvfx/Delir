// @flow
import T from 'prop-types'
import * as semver from 'semver'

type ValidatorFunction = (props: Object, propName: string, descriptiveName: string, location: any) => Error|void

// type PluginFeatures = 'Effect' | 'CustomLayer' | 'ExpressionExtension'
// type DelirPluginPackageJson = {
//     name: string,
//     version: string,
//     author: string|Array<string>,
//     main?: string,
//     engines: {
//         delir: string,
//     },
//     delir: {
//         feature: PluginFeatures,
//         targetApi: Object,
//     },
// }

const _custom = (validate: ValidatorFunction) : {(): any, isRequired: Function} => {
    const checkType = (isRequired: boolean, props: {[key: string]: any}, propName: string, descriptiveName: string|null, location: any) => {
        descriptiveName = descriptiveName || '<<anoanymous>>'

        if (props[propName] == null) {
            let locationName = location

            if (isRequired) {
                return new Error(`Required ${locationName} \`${propName}\` was not specified in \`${descriptiveName}\`.`)
            }

            return null
        } else {
            return validate(props, propName, descriptiveName, location)
        }
    }

    const chainedCheckType = checkType.bind(null, false)
    chainedCheckType.isRequired = checkType.bind(null, true)

    return chainedCheckType
}

const _validate = (displayName: string, schema: Object) => (object: Object) => T.validateWithErrors(schema, object, displayName)
const customTypes = {
    semver: _custom((props: {[key: string]: any}, propName: string, descriptiveName: string) => {
        if (semver.valid(props[propName]) == null) {
            return new Error(`${propName} is invalid semantic-version`)
        }
    }),

    semverRange: _custom((props: {[key: string]: any}, propName: string, descriptiveName: string) => {
        if (semver.validRange(props[propName]) == null) {
            return new Error(`${propName} is invalid semantic-version range`)
        }
    }),

    hasIfShape: (shapeTypes: {[key: string]: any}) => {
        const validate = (isRequired: any, props: any, propName: any, descriptiveName: any, location: any, rootProps: any = props) => {
            if (props[propName] == null) {
                if (isRequired) {
                    return new Error(`Required ${location} \`${propName}\` was not specified in \`${descriptiveName}\`.`)
                }

                return
            }

            const propValue = props[propName]
            const propType = Array.isArray(propValue) ? 'array' :
                (propValue instanceof RegExp ? 'object' : typeof propValue)

            if (propType !== 'object') {
                let locationName = location
                return new Error(
                    `Invalid ${locationName} \`${propName}\` of type \`${propType}\` ` +
                    `supplied to \`${descriptiveName}\`, expected \`object\`.`
                )
            }

            for (let key in shapeTypes) {
                let checker = shapeTypes[key]
                if (!checker) {
                    continue
                }

                let error = checker(propValue, key, descriptiveName, location, rootProps)
                if (error) {
                    return error
                }
            }
            return null
        }

        const checkType = validate.bind(null, false)
        checkType.isRequired = validate.bind(null, true)

        return checkType
    },

    if: (condition: (props: any, propName: string, rootProps: any) => boolean) => {
        let validator: any

        const checkValidateNeeded: any = (
            props: Object,
            propName: string,
            descriptiveName: string,
            location: string,
            rootProps: Object,
        ) => {
            if (condition(props, propName, rootProps)) {
                return validator(props, propName, descriptiveName)
            }
        }

        checkValidateNeeded.when = (rule: ValidatorFunction) => {
            validator = rule
            return checkValidateNeeded
        }

        return checkValidateNeeded
    }
}

export const delirPackageJson = _validate('package.json(delir plugin)', {
    name: T.string.isRequired,
    version: customTypes.semver.isRequired,
    author: T.oneOfType([
        T.string,
        T.arrayOf(T.string),
        T.arrayOf(T.shape({
            name: T.string.isRequired,
            email: T.string,
            url: T.string,
        })),
    ]),
    main: T.string,
    engines: T.shape({
        delir: customTypes.semverRange.isRequired,
    }).isRequired,
    delir: customTypes.hasIfShape({
        feature: T.oneOf([
            'Effect',
            'CustomLayer',
            'ExpressionExtension'
        ]),
        targetApi: customTypes.hasIfShape({
            renderer: customTypes
                .if((props, propName, rootProps) => rootProps.delir.feature === 'Effect')
                .when(customTypes.semverRange.isRequired)
        }).isRequired
    }).isRequired,
})
