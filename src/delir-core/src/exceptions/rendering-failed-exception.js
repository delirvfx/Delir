// @flow
export default class RenderingFailedException extends Error
{
    info : ?Object

    constructor(message: string, info: ?Object)
    {
        super(message)
        this.info = info
    }
}
