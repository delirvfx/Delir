export type ActionIdentifier<P> = () => P
export type ExtractPayloadType<T extends ActionIdentifier<any>> = ReturnType<T>
export type ExtractActionIdentifiersFromObject<T extends object> = T[keyof T]

const action = <P>(): ActionIdentifier<P> => (_?: P): P => {
    throw new Error('Do not call Action as function')
}

const actions = <T extends { [name: string]: ActionIdentifier<any> }>(actionGroup: T): {
    [K in keyof T]: ActionIdentifier<ReturnType<T[K]>>
} => {
    const actionIdentifier = Object.create(null)
    Object.keys(actionGroup).map(key => actionIdentifier[key] = action())
    return actionIdentifier
}
export { action, actions }
