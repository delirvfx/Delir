import { Effect } from '../../Entity'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'

export interface EffectPreRenderContext<T extends { [paramName: string]: any }>
  extends IRenderContextBase,
    EffectPreRenderContextAttributes<T> {}

export interface EffectPreRenderContextAttributes<T extends RealParameterValues> {
  effect: Effect
  parameters: T
  clipEffectParams: ReferenceableEffectsParams
}
