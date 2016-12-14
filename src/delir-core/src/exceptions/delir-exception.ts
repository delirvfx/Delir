export default class DelirException
{
    before: Error
    message: string
    info?: Object
    stack: string
    stackLines: Array<string>

    constructor(message: string, info: any = {})
    {
        const {stack} = (new Error())

        this.message = message
        this.stack = stack
        this.stackLines = stack.split('\n')
        this.before = info.before
        this.info = info
    }
}
