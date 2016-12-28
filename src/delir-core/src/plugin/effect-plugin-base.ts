import RenderRequest from '../renderer/render-request'

import PluginBase from './plugin-base'
import {TypeDescriptor} from './type-descriptor'

import {
    InvalidPluginLoadedException
} from '../exceptions'

export default class EffectPluginBase extends PluginBase
{
    static pluginDidLoad()
    {
        const subClassName = this ? this.name : '<<do not known>>'
        throw new InvalidPluginLoadedException(`CustomLayer plugin class \`${subClassName}\` not implement \`static pluginDidLoad\` method`, {
            class: this,
        })
    }

    static provideParameters(): TypeDescriptor
    {
        // None
        return new TypeDescriptor
    }

    constructor()
    {
        super()
    }

    async beforeRender(preRenderReq: Object)
    {

    }

    async render(req: RenderRequest): Promise<void>
    {

    }
}
