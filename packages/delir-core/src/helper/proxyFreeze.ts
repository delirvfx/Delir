type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }

export const proxyFreeze = <T extends object> (obj: T): DeepReadonly<T> => new Proxy(obj as any, {
    set(target: T, property: string) {
        throw new Error('Can not set value Object is readonly')
    }
})
