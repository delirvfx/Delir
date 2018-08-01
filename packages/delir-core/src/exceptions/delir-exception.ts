export default class DelirException extends Error
{
    public before: Error
    public message: string
    public info?: Object
    public stack?: string
    public stackLines: string[]

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
