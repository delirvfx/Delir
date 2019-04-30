import { Project } from '../Entity'
import ProgressPromise from '../helper/progress-promise'
import PluginRegistry from '../PluginSupport/plugin-registry'
import { ParameterValueTypes } from '../PluginSupport/type-descriptor'
import * as ExpressionContext from './ExpressionSupport/ExpressionContext'
import { IRenderingStreamObserver } from './IRenderingStreamObserver'
export interface ExpressionExecuters {
    [paramName: string]: (exposes: ExpressionContext.ContextSource) => ParameterValueTypes
}
interface RenderingOption {
    beginFrame: number
    endFrame: number
    loop: boolean
    ignoreMissingEffect: boolean
    realtime: boolean
    audioBufferSizeSecond: number
}
interface RenderProgression {
    state: string
    isAudioBuffered: boolean
    audioBuffers: Float32Array[]
    currentFrame: number
    rangeEndFrame: number
    playbackRate: number
}
export default class Engine {
    public pluginRegistry: PluginRegistry
    private _fpsCounter
    private _seqRenderPromise
    private _project
    private _pluginRegistry
    private _destinationAudioNode
    private _clipRendererCache
    private _effectCache
    private _streamObserver
    private _initStage
    private _taskingStage
    private _renderStage
    public setProject(project: Project): void
    public setStreamObserver(observer: IRenderingStreamObserver): void
    public removeStreamObserver(observer: IRenderingStreamObserver): void
    public stopCurrentRendering(): void
    public renderFrame(compositionId: string, beginFrame: number): ProgressPromise<void>
    public renderSequencial(
        compositionId: string,
        options?: Partial<RenderingOption>,
    ): ProgressPromise<void, RenderProgression>
}
export {}
