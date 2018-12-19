import * as _ from 'lodash'

interface I18nTexts {
    [lang: string]: {
        [key: string]: any
    }
}

const PLACEHOLDER_PATTERN = /:[a-zA-Z0-9_-]+/g

const replacePlaceHolder = (text: string, params: { [name: string]: any }): string => {
    return text.replace(PLACEHOLDER_PATTERN, matched => {
        const key = matched.slice(1)

        if (params[key] == null) {
            throw new Error(`Missing required translation param \`${key}\``)
        }

        return params[key]
    })
}

export default (json: I18nTexts) => {
    const lang = __DEV__ ? 'en' : navigator.language

    return (key: string | string[], params?: { [name: string]: any }): string => {
        const text = (_.get(json[lang], key) || _.get(json.en, key)) as string | null

        if (text == null) {
            throw new Error(`Missing translation key \`${key}\``)
        }

        return params ? replacePlaceHolder(text, params) : text
    }
}
