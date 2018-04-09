export type PayloadTypeStore<P> = () => P
export type ExtractPayloadType<T extends PayloadTypeStore<any>> = ReturnType<T>

const action = <P>() => (_?: P): P => {
    throw new Error('Do not call Action as function')
}

type actions<T extends { [name: string]: PayloadTypeStore<any> }> = (def: T) => {
    [K in keyof T]: PayloadTypeStore<ReturnType<T[K]>>
}

const actions = <T extends { [name: string]: PayloadTypeStore<any> }>(actionGroup: T): {
    [K in keyof T]: PayloadTypeStore<ReturnType<T[K]>>
} => {
    const actionIdentifier = Object.create(null)
    Object.keys(actionGroup).map(key => actionIdentifier[key] = action())
    return actionIdentifier
}
export { action, actions }
