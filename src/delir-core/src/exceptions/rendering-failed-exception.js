// @flow
export default class RenderingFailedException
{
    before: Error
    message: string
    info: ?Object
    stack: string
    stackLines: Array<string>

    constructor(message: string, info: Object = {})
    {
        const {stack} = (new Error())

        this.before = info.before
        this.message = message
        this.stack = stack
        this.stackLines = stack.split('\n')
        this.info = info
    }

    toString()
    {
        return this.message
    }
}
