// @flow
export default class InvalidPluginLoadedException extends Error
{
    info : ?Object

    constructor(message: string, info: ?Object)
    {
        super(message)
        this.info = info
    }
}
