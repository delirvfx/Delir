// @flow
export default class PluginAssertionFailedException extends Error
{
    info : ?Object

    constructor(message: string, info: ?Object)
    {
        super(message)
        this.info = info
    }
}
