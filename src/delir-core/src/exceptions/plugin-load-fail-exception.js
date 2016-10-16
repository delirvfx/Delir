// @flow
export default class PluginLoadFailException extends Error
{
    info : ?Object

    constructor(message: string, info: ?Object)
    {
        super(message)
        this.info = info
    }
}
