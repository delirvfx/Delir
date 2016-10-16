// @flow
import T from 'prop-types'
import semver from 'semver'

type ValidatorFunction = (props: Object, propName: string, descriptiveName: string) => Error|void

type PluginFeatures = 'Effect' | 'CustomLayer' | 'ExpressionExtension'
type DelirPluginPackageJson = {
    name: string,
    version: string,
    author: string|Array<string>,
    main?: string,
    engines: {
        delir: string,
    },
    delir: {
        feature: PluginFeatures,
        targetApi: Object,
    },
}

const _custom = (validate: ValidatorFunction) : Function => {
    const checkType = (isRequired, props, propName, descriptiveName: ?string, location) => {
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
const _validate = (displayName: stringm, schema: Object) => (object) => T.validateWithErrors(schema, object, displayName)
const customTypes = {
    semver: _custom((props: Object, propName: string, descriptiveName: string) => {
        if (semver.valid(props[propName]) == null) {
            return new Error(`${propName} is invalid semantic-version`)
        }
    }),

    semverRange: _custom((props: Object, propName: string, descriptiveName: string) => {
        if (semver.validRange(props[propName]) == null) {
            return new Error(`${propName} is invalid semantic-version range`)
        }
    }),

    hasIfShape: shapeTypes => {
        const validate = (isRequired, props, propName, descriptiveName, location, rootProps = props) => {
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

    if: condition => {
        let validator

        const checkValidateNeeded = (
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

        checkValidateNeeded.when = rule => {
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
