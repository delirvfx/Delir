import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'

export interface EffectRenderContext<T extends {[paramName: string]: any}> extends IRenderContextBase, EffectRenderContextAttributes<T> {}

export interface EffectRenderContextAttributes<T extends RealParameterValues> {
    parameters: T

    timeOnClip: number
    frameOnClip: number

    srcCanvas: HTMLCanvasElement
    destCanvas: HTMLCanvasElement
}
