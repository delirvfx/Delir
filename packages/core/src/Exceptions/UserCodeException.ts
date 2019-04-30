interface ExceptionLocation {
    type: 'clip' | 'effect'
    entityId: string
    paramName: string
}

export class UserCodeException extends Error {
    public sourceError: Error
    public location: ExceptionLocation

    constructor(
        message: string,
        context: {
            sourceError: Error
            location: ExceptionLocation
        },
    ) {
        super(message)
        this.sourceError = context.sourceError
        this.location = context.location
    }
}
