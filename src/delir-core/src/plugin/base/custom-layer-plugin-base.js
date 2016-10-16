// @flow
import PluginBase from './plugin-base.js'
import {
    InvalidPluginLoadedException
} from '../../exceptions/index'

export default class CustomLayerPluginBase extends PluginBase
{
    static pluginDidLoad()
    {
        const subClassName = this ? this.name : '<<do not known>>'
        throw new InvalidPluginLoadedException(`CustomLayer plugin class \`${subClassName}\` not implement \`static pluginDidLoad\` method`, {
            class: this,
        })
    }
}
