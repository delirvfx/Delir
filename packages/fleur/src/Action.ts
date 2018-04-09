// interface FluxStandardAction<T extends string, P, M = never> {
//     type: T
//     payload: P
//     error?: false
//     meta?: M
// }

// export interface ErrorFluxStandardAction<T extends string, P, E extends Error, M = never>{
//     type: T
//     error: true
//     exception: P | E
//     meta?: M
// }

// export type Action<T extends string, P = {}> = FluxStandardAction<T, P>
// export type Action<T extends string, P = {}, E extends Error = never> = {
//     type: T
//     payload: P
//     // error?: E
// }
// export type ThrowableAction<T extends string, P = {}, E extends Error = Error> = ErrorFluxStandardAction<T, P, E>

// type ActionType<A extends Action<string, any, any>> = A extends FluxStandardAction < infer T, any > ? T : never
// type PayloadType<A extends Action<string, any, any>> = A extends FluxStandardAction < any, infer P > ? P : never
// type ErrorType<A extends Action<string, any, any>> = A extends ErrorFluxStandardAction < any, infer E > ? E : never

// export const action = <A extends Action<string, any, any> = any>(type: ActionType<A>, payload: PayloadType<A> | ErrorType<A>) => () => ({
//     type,
//     payload,
//     error: (payload as any) instanceof Error
// })

// const testAction = action('TEST', )

// export const Action = <T extends string, P > (type: T, payload: P)

// export type PayloadType<T extends Action<any>> = T extends Action<any, infer P> ? P : never

export type PayloadTypeStore<P> = () => P
export type ExtractPayloadType<T extends PayloadTypeStore<any>> = T extends PayloadTypeStore < infer P > ? P : never

export const action = <P>() => (_?: P): P => {
    throw new Error('Do not call Action as function')
}

export const actions = <T extends { [name: string]: PayloadTypeStore<any> }>(actionGroup: T): {
    [K in keyof T]: PayloadTypeStore<ReturnType<T[K]>>
} => {
    const actionIdentifier = Object.create(null)
    Object.keys(actionGroup).map(key => actionIdentifier[key] = action())
    return actionIdentifier
}
