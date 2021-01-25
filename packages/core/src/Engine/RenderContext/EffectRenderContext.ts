import { Effect } from '../../Entity'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'

export interface EffectRenderContext<T extends { [paramName: string]: any }>
  extends IRenderContextBase,
    EffectRenderContextAttributes<T> {}

export interface EffectRenderContextAttributes<T extends RealParameterValues> {
  effect: Effect
  parameters: T
  clipEffectParams: ReferenceableEffectsParams

  timeOnClip: number
  frameOnClip: number

  srcCanvas: HTMLCanvasElement
  destCanvas: HTMLCanvasElement
}
