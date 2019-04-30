declare type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }
export declare const proxyDeepFreeze: <T extends object>(obj: T) => DeepReadonly<T>
export {}
