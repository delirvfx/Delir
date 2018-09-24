import { RealParameterValues } from '../Engine'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { IRenderContextBase } from './IRenderContextBase'

export interface ClipRenderContext<T extends {[paramName: string]: any}> extends IRenderContextBase, ClipRenderContextAttributes<T> {}

export interface ClipRenderContextAttributes<T extends RealParameterValues> {
    parameters: T
    clipEffectParams: ReferenceableEffectsParams

    timeOnClip: number
    frameOnClip: number

    // Destinations
    srcCanvas: HTMLCanvasElement | null
    destCanvas: HTMLCanvasElement
    destAudioBuffer: Float32Array[]
}
