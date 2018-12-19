const hasOwnProperty = (obj: Object, key: string) => Object.prototype.hasOwnProperty.call(obj, key)

export default function defaults<T extends object, D extends object>(obj: T, defaults: D, nullable = false): T & D {
    const merged: any = { ...(obj as object) } as T & D

    for (const key in defaults) {
        const _key = key as string

        if (hasOwnProperty(obj, key)) {
            merged[_key] = nullable
                ? (obj as any)[_key]
                : (obj as any)[_key] == null
                ? (defaults as any)[_key]
                : (obj as any)[_key]
        } else {
            merged[_key] = (defaults as any)[_key]
        }
    }

    return merged
}
