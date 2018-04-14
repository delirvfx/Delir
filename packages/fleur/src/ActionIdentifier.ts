export type ActionIdentifier<P> = () => P
export type ExtractPayloadType<T extends ActionIdentifier<any>> = ReturnType<T>
export type ExtractActionIdentifiersFromObject<T extends object> = T[keyof T]

const action = <P>(): ActionIdentifier<P> => (_?: P): P => {
    throw new Error('Do not call Action as function')
}

export { action }
