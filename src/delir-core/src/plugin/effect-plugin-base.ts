import RenderRequest from '../renderer/render-request'

import PluginBase from './plugin-base'
import {TypeDescriptor} from './type-descriptor'

export default class EffectPluginBase extends PluginBase
{
    static pluginDidLoad() {}

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
