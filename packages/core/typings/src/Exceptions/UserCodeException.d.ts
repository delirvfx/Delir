interface ExceptionLocation {
    type: 'clip' | 'effect'
    entityId: string
    paramName: string
}
export declare class UserCodeException extends Error {
    public sourceError: Error
    public location: ExceptionLocation
    constructor(
        message: string,
        context: {
            sourceError: Error
            location: ExceptionLocation
        },
    )
}
export {}
