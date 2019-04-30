import { Clip } from '../../Entity'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'

export interface ClipRenderContext<T extends { [paramName: string]: any }>
    extends IRenderContextBase,
        ClipRenderContextAttributes<T> {}

export interface ClipRenderContextAttributes<T extends RealParameterValues> {
    clip: Readonly<Clip>
    parameters: T
    beforeExpressionParameters: T
    clipEffectParams: ReferenceableEffectsParams

    timeOnClip: number
    frameOnClip: number

    // Destinations
    srcCanvas: HTMLCanvasElement | null
    destCanvas: HTMLCanvasElement
    srcAudioBuffer: Float32Array[] | null
    destAudioBuffer: Float32Array[]
}
