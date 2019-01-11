import { Composition } from '../../Entity'
import DependencyResolver from '../DependencyResolver'
import WebGLContext from '../WebGL/WebGLContext'
import { ClipPreRenderContext, ClipPreRenderContextAttributes } from './ClipPreRenderContext'
import { ClipRenderContext, ClipRenderContextAttributes } from './ClipRenderContext'
import { EffectPreRenderContext, EffectPreRenderContextAttributes } from './EffectPreRenderContext'
import { EffectRenderContext, EffectRenderContextAttributes } from './EffectRenderContext'
import { IRenderContextBase } from './IRenderContextBase'

export class RenderContextBase implements IRenderContextBase {
    public time: number
    public timeOnComposition: number

    public frame: number
    public frameOnComposition: number

    public width: number
    public height: number

    public framerate: number
    public durationFrames: number
    public samplingRate: number
    public audioChannels: number
    public neededSamples: number
    public isAudioBufferingNeeded: boolean

    public rootComposition: Readonly<Composition>
    public resolver: DependencyResolver

    public destCanvas: HTMLCanvasElement
    public destAudioBuffer: Float32Array[]
    public audioContext: OfflineAudioContext
    public gl: WebGLContext

    constructor(context: IRenderContextBase) {
        Object.assign(this, context)
    }

    public toClipPreRenderContext(
        this: IRenderContextBase,
        context: ClipPreRenderContextAttributes<any>,
    ): ClipPreRenderContext<any> {
        return { ...this, ...context }
    }

    public toClipRenderContext(
        this: IRenderContextBase,
        context: ClipRenderContextAttributes<any>,
    ): ClipRenderContext<any> {
        return { ...this, ...context }
    }

    public toEffectPreRenderContext(
        this: IRenderContextBase,
        context: EffectPreRenderContextAttributes<any>,
    ): EffectPreRenderContext<any> {
        return { ...this, ...context }
    }

    public toEffectRenderContext(
        this: IRenderContextBase,
        context: EffectRenderContextAttributes<any>,
    ): EffectRenderContext<any> {
        return { ...this, ...context }
    }

    public clone(this: IRenderContextBase, context: Partial<IRenderContextBase>): RenderContextBase {
        return new RenderContextBase({ ...this, ...context })
    }
}
