import PreRenderRequest from '../engine/PreRenderingRequest'
import RenderRequest from '../engine/RenderRequest'

import PluginBase from './plugin-base'
import { ParameterValueTypes, TypeDescriptor } from './type-descriptor'

export interface EffectPluginClass {
    new (): EffectPluginBase
    provideParameters(): TypeDescriptor
}

export default abstract class EffectPluginBase extends PluginBase
{
    public static provideParameters(): TypeDescriptor
    {
        // None
        return new TypeDescriptor()
    }

    public abstract async initialize(req: PreRenderRequest<any>): Promise<void>

    public abstract async render(req: RenderRequest<any>): Promise<void>
}
