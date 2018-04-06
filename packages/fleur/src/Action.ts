export interface FluxStandardAction<T extends string, P, M = never>  {
    type: T
    error?: false
    payload: P
    meta?: M
}

// export interface ErrorFluxStandardAction<T extends string, E extends Error, M = never>{
//     type: T
//     error: true
//     payload: E
//     meta?: M
// }

export type Action<T extends string, P = {}, E extends Error = Error> =
    | FluxStandardAction<T, P>
    // | ErrorFluxStandardAction<T, E>

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
