import {
    PluginAssertionFailedException,
    InvalidPluginLoadedException
} from '../exceptions/index'

export function assertPlugin(PluginClass) {
    const name = PluginClass.name

    if (typeof PluginClass.prototype.didRegister !== 'function') {
        throw new PluginAssertionFailedException(`Plugin \`${name}\` isn't implement \`static pluginDidLoad\` method`, {class: PluginClass})
    }
}

export default class PluginBase
{
    static pluginDidLoad()
    {
        const subClassName = this ? this.name : '<<do not known>>'
        throw new InvalidPluginLoadedException(`Plugin class \`${subClassName}\` not implement \`static pluginDidLoad\` method`, {
            class: this,
        })
    }
}
