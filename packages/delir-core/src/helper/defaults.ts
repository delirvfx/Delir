const hasOwnProperty = (obj: Object, key: string) => Object.prototype.hasOwnProperty.call(obj, key)

export default function defaults<T, D>(obj: T, defaults: D, nullable = false): T & D {
    const merged = {...obj} as T & D

    for (const key in defaults) {
        const _key = key as string

        if (hasOwnProperty(obj, key)) {
            merged[_key] = nullable
                ? obj[_key]
                : (obj[_key] == null ? defaults[_key] : obj[_key])
        } else {
            merged[_key] = defaults[_key]
        }
    }

    return merged
}
