export default class DelirException extends Error
{
    before: Error
    message: string
    info?: Object
    stack?: string
    stackLines: Array<string>

    constructor(message: string, info: any = {})
    {
        super(message)

        const {stack} = (new Error())

        this.message = message
        this.stack = stack
        this.stackLines = stack ? stack.split('\n') : ['']
        this.before = info.before
        this.info = info
    }
}
