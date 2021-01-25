import { EffectPreRenderContext, EffectRenderContext } from '..'
import PluginBase from './PluginBase'
import { TypeDescriptor } from './TypeDescriptor'

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
