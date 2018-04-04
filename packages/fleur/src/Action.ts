export interface FluxStandardAction<T extends string, P, M = void>  {
    type: T
    error?: false
    payload: P
    meta?: M
}

export interface ErrorFluxStandardAction<T extends string, P extends Error, M = void>{
    type: T
    error: true
    payload: Error
    meta?: M
}

export type Action<T extends string, P = {}, E extends Error = any, M = void> =
    | FluxStandardAction<T, P, M>
    | ErrorFluxStandardAction<T, E, M>
