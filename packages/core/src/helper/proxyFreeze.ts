// prettier-ignore
export type DeepReadonly<T> =
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T extends Array<infer R> ? ReadonlyArray<R>
  : T

export const proxyDeepFreeze = <T extends any>(obj: T): DeepReadonly<T> => {
  if (obj === null) {
    return obj as DeepReadonly<T>
  }

  if (typeof obj === 'object') {
    return new Proxy(obj as any, {
      get(target: T, property: string) {
        return proxyDeepFreeze((target as any)[property])
      },
      set() {
        throw new Error('Can not set value Object is readonly')
      },
    })
  }

  return obj as DeepReadonly<T>
}
