import { RealParameterValues } from '../Engine'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { IRenderContextBase } from './IRenderContextBase'

export interface EffectPreRenderContext<T extends {[paramName: string]: any}> extends IRenderContextBase, EffectPreRenderContextAttributes<T> {}

export interface EffectPreRenderContextAttributes<T extends RealParameterValues> {
    parameters: T
    clipEffectParams: ReferenceableEffectsParams
}
