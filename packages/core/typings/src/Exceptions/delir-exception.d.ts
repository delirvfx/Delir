export default class DelirException extends Error {
    public before: Error
    public message: string
    public info?: Object
    public stack?: string
    public stackLines: string[]
    constructor(message: string, info?: any)
}
