import _ from 'lodash'

interface Texts {
  [key: string]: string | Texts
}

interface I18nTexts<T extends Texts> {
  [lang: string]: T
}

interface PathEnum {
  [key: string]: string | PathEnum
}

interface Translater<T extends PathEnum> {
  (key: string | string[], params?: { [name: string]: any }): string
  k: T
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

const joinPath = (path: string, key: string) => (path !== '' ? `${path}.${key}` : key)

const extractPathEnum = (obj: any, path = '') => {
  const keys: PathEnum = {}

  Object.keys(obj).map(key => {
    if (typeof obj[key] !== 'string') {
      keys[key] = extractPathEnum(obj[key], joinPath(path, key))
    } else {
      keys[key] = joinPath(path, key)
    }
  })

  return keys
}

export default <T extends I18nTexts<any>>(json: T): Translater<T['en']> => {
  const lang = __DEV__ ? 'en' : navigator.language

  const translater: Translater<T['en']> = (key: string | string[], params?: { [name: string]: any }): string => {
    const text = (_.get(json[lang], key) || _.get(json.en, key)) as string | null

    if (text == null) {
      throw new Error(`Missing translation key \`${key}\``)
    }

    return params ? replacePlaceHolder(text, params) : text
  }

  translater.k = extractPathEnum(json.en) as T['en']
  return translater
}
