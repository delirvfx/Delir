import * as PropTypes from 'prop-types'
import * as secret from 'prop-types/lib/ReactPropTypesSecret'

interface CheckResult {
    valid: boolean,
    errors: string[],
}

type Validator<T> = (object: T, key: string, componentName?: string, ...rest: any[]) => Error | null

export default (propTypes: {[prop: string]: Validator<any>}, props: any, componentName: string = 'unnamed'): CheckResult => {
    const errors: string[] = []

    for (const prop of Object.keys(propTypes)) {
        const err = propTypes[prop](props, prop, componentName, 'prop', null, secret)
        if (err) errors.push(err.message)
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}
