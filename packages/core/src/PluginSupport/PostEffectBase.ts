import { EffectPreRenderContext, EffectRenderContext } from '..'
import PluginBase from './plugin-base'
import { TypeDescriptor } from './type-descriptor'

export interface EffectPluginClass {
  new (): EffectPluginBase
  provideParameters(): TypeDescriptor
}

export default abstract class EffectPluginBase extends PluginBase {
  public static provideParameters(): TypeDescriptor {
    // None
    return new TypeDescriptor()
  }

  public abstract async initialize(context: EffectPreRenderContext<any>): Promise<void>

  public abstract async render(context: EffectRenderContext<any>): Promise<void>
}
