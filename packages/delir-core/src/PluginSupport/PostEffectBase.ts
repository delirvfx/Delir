import PreRenderContext from '../Engine/PreRenderContext'
import RenderContext from '../Engine/RenderContext'

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

    public abstract async initialize(context: PreRenderContext<any>): Promise<void>

    public abstract async render(context: RenderContext<any>): Promise<void>
}
