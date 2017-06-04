import PreRenderRequest from '../renderer/pipeline/pre-rendering-request'
import RenderRequest from '../renderer/pipeline/render-request'

import PluginBase from './plugin-base'
import {TypeDescriptor} from './type-descriptor'

export default abstract class EffectPluginBase extends PluginBase
{
    public static provideParameters(): TypeDescriptor
    {
        // None
        return new TypeDescriptor()
    }

    public abstract async beforeRender(preRenderReq: PreRenderRequest): Promise<void>

    public abstract async render(req: RenderRequest): Promise<void>
}
