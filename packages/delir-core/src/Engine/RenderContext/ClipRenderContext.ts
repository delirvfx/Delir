import { Clip } from '../../Entity'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'

export interface ClipRenderContext<T extends {[paramName: string]: any}> extends IRenderContextBase, ClipRenderContextAttributes<T> {}

export interface ClipRenderContextAttributes<T extends RealParameterValues> {
    clip: Clip
    parameters: T
    clipEffectParams: ReferenceableEffectsParams

    timeOnClip: number
    frameOnClip: number

    // Destinations
    srcCanvas: HTMLCanvasElement | null
    destCanvas: HTMLCanvasElement
    destAudioBuffer: Float32Array[]
}
