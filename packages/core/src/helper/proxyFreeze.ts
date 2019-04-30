type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }

export const proxyDeepFreeze = <T extends object>(obj: T): DeepReadonly<T> => {
    return obj instanceof Object
        ? new Proxy(obj as any, {
              get(target: T, property: string) {
                  return proxyDeepFreeze((target as any)[property])
              },
              set() {
                  throw new Error('Can not set value Object is readonly')
              },
          })
        : obj
}
