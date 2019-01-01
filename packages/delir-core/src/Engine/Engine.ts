import { Clip, Effect, Project } from '../Entity'
import EffectPluginBase from '../PluginSupport/PostEffectBase'
import { ParameterValueTypes } from '../PluginSupport/type-descriptor'

import { IRenderingStreamObserver, RenderingStatus } from './IRenderingStreamObserver'
import { IRenderer } from './Renderer/RendererBase'

import PluginRegistry from '../PluginSupport/plugin-registry'

import WebGLContext from '@ragg/delir-core/src/Engine/WebGL/WebGLContext'
import * as _ from 'lodash'
import * as timecodes from 'node-timecodes'
import { EffectPluginMissingException, RenderingAbortedException, RenderingFailedException } from '../Exceptions/'
import { mergeInto as mergeAudioBufferInto } from '../helper/Audio'
import defaults from '../helper/defaults'
import FPSCounter from '../helper/FPSCounter'
import ProgressPromise from '../helper/progress-promise'
import DependencyResolver from './DependencyResolver'
import * as ExpressionContext from './ExpressionSupport/ExpressionContext'
import { RenderContextBase } from './RenderContext/RenderContextBase'
import ClipRenderTask from './Task/ClipRenderTask'
import EffectRenderTask from './Task/EffectRenderTask'
import { LayerRenderTask } from './Task/LayerRenderTask'

export interface ExpressionExecuters {
    [paramName: string]: (exposes: ExpressionContext.ContextSource) => ParameterValueTypes
}

interface RenderingOption {
    beginFrame: number
    endFrame: number
    loop: boolean
    ignoreMissingEffect: boolean
    realtime: boolean
}

interface RenderProgression {
    state: string
    isAudioBuffered: boolean
    audioBuffers: Float32Array[]
    currentFrame: number
    rangeEndFrame: number
}

export default class Engine {
    private _fpsCounter: FPSCounter = new FPSCounter()
    private _seqRenderPromise: ProgressPromise<void> | null = null
    private _project: Project
    private _pluginRegistry: PluginRegistry = new PluginRegistry()
    private _destinationAudioNode: AudioNode
    private _clipRendererCache: WeakMap<Clip, IRenderer<any>> = new WeakMap()
    private _effectCache: WeakMap<Effect, EffectPluginBase> = new WeakMap()
    private _streamObserver: IRenderingStreamObserver | null = null
    private _gl: WebGL2RenderingContext

    get pluginRegistry() {
        return this._pluginRegistry
    }
    set pluginRegistry(pluginRegistry: PluginRegistry) {
        this._pluginRegistry = pluginRegistry
    }

    // get destinationAudioNode() { return this._destinationAudioNode }
    // set destinationAudioNode(destinationAudioNode: AudioNode) { this._destinationAudioNode = destinationAudioNode }

    public setProject(project: Project) {
        this._project = project
        this._clipRendererCache = new WeakMap()
        this._effectCache = new WeakMap()
    }

    public setStreamObserver(observer: IRenderingStreamObserver) {
        this._streamObserver = observer
    }

    public removeStreamObserver(observer: IRenderingStreamObserver) {
        this._streamObserver = null
    }

    public stopCurrentRendering() {
        if (this._seqRenderPromise) {
            this._seqRenderPromise.abort()
        }
    }

    public renderFrame(compositionId: string, beginFrame: number): ProgressPromise<void> {
        return new ProgressPromise<void>(async (resolve, reject, onAbort, notifier) => {
            let aborted = false
            onAbort(() => (aborted = true))

            const renderingOption: RenderingOption = {
                beginFrame,
                endFrame: beginFrame,
                ignoreMissingEffect: false,
                loop: false,
                realtime: false,
            }

            const request = this._initStage(compositionId, renderingOption)

            const renderTasks = await this._taskingStage(request, renderingOption)
            await this._renderStage(request, renderTasks)

            if (this._streamObserver) {
                if (this._streamObserver.onFrame) {
                    this._streamObserver.onFrame(request.destCanvas, {
                        frame: request.frame,
                        time: request.time,
                        durationFrame: request.durationFrames,
                        samplingRate: request.samplingRate,
                    })
                }
            }

            resolve()
        })
    }

    public renderSequencial(
        compositionId: string,
        options: Partial<RenderingOption> = {},
    ): ProgressPromise<void, RenderProgression> {
        const renderingOption: RenderingOption = defaults(options, {
            beginFrame: 0,
            loop: false,
            endFrame: -1,
            ignoreMissingEffect: false,
            realtime: false,
        })

        this.stopCurrentRendering()

        this._seqRenderPromise = new ProgressPromise<void, RenderProgression>(
            async (resolve, reject, onAbort, notifier) => {
                let aborted = false

                onAbort(() => {
                    aborted = true
                    this._seqRenderPromise = null
                })

                let context = this._initStage(compositionId, renderingOption)
                let renderTasks: LayerRenderTask[]

                try {
                    renderTasks = await this._taskingStage(context, renderingOption)
                } catch (e) {
                    reject(e)
                    return
                }

                this._fpsCounter.reset()

                const reqDestCanvasCtx = context.destCanvas.getContext('2d')!
                const framerate = context.rootComposition.framerate
                const lastFrame = context.rootComposition.durationFrames
                let animationFrameId: number
                let renderedFrames = 0
                let lastAudioBufferTime = -1

                const throttle = options.realtime
                    ? (fn: () => void) => _.throttle(fn, 1000 / context.framerate)
                    : (fn: () => void) => fn

                const animationFrame = options.realtime
                    ? requestAnimationFrame
                    : (fn: () => void) => (fn() as unknown) as number

                const cancelFrame = options.realtime ? cancelAnimationFrame : clearTimeout

                const render = throttle(async () => {
                    const currentFrame = renderingOption.beginFrame + renderedFrames
                    const currentTime = currentFrame / framerate

                    // 最後のバッファリングから１秒経過 & 次のフレームがレンダリングの終わりでなければバッファリング
                    const isAudioBufferingNeeded =
                        lastAudioBufferTime !== (currentTime | 0) && renderedFrames + 1 <= context.durationFrames

                    if (isAudioBufferingNeeded) {
                        lastAudioBufferTime = currentTime | 0

                        for (const buffer of context.destAudioBuffer) {
                            buffer.fill(0)
                        }
                    }

                    context = context.clone({
                        frame: currentFrame,
                        time: currentTime,
                        frameOnComposition: currentFrame,
                        timeOnComposition: currentTime,
                        isAudioBufferingNeeded,
                    })

                    reqDestCanvasCtx.clearRect(0, 0, context.width, context.height)

                    try {
                        await this._renderStage(context, renderTasks)
                    } catch (e) {
                        reject(e)
                        return
                    }

                    if (!aborted) {
                        const status: RenderingStatus = {
                            frame: context.frame,
                            time: context.time,
                            durationFrame: context.durationFrames,
                            samplingRate: context.samplingRate,
                        }

                        if (this._streamObserver) {
                            if (this._streamObserver.onStateChanged) this._streamObserver.onStateChanged(status)
                            if (this._streamObserver.onFrame) this._streamObserver.onFrame(context.destCanvas, status)

                            if (isAudioBufferingNeeded) {
                                if (this._streamObserver.onAudioBuffered) {
                                    this._streamObserver.onAudioBuffered(context.destAudioBuffer, status)
                                }
                            }
                        }
                    }

                    if (renderingOption.beginFrame + renderedFrames >= lastFrame) {
                        if (renderingOption.loop) {
                            renderedFrames = 0
                            lastAudioBufferTime = -1
                        } else {
                            cancelFrame(animationFrameId)
                            resolve()
                            return
                        }
                    } else {
                        renderedFrames++
                    }

                    if (aborted) {
                        cancelFrame(animationFrameId)
                        reject(new RenderingAbortedException('Rendering aborted.'))
                        return
                    }

                    const timecode = timecodes.fromSeconds(context.time, {
                        frameRate: context.framerate,
                    })
                    notifier({
                        state: `time: ${timecode.slice(0, -3)} (${this._fpsCounter.latestFPS()} / ${
                            context.framerate
                        } fps)`,
                        currentFrame: context.frame,
                        rangeEndFrame: renderingOption.endFrame,
                        isAudioBuffered: isAudioBufferingNeeded,
                        audioBuffers: context.destAudioBuffer,
                    })

                    this._fpsCounter.increase()
                    animationFrameId = animationFrame(render)
                })

                animationFrameId = animationFrame(render)
            },
        )

        return this._seqRenderPromise
    }

    private _initStage(compositionId: string, option: RenderingOption): RenderContextBase {
        if (!this._project) throw new RenderingFailedException('Project must be set before rendering')
        if (!this._pluginRegistry) throw new RenderingFailedException('Plugin registry not set')

        const rootComposition = this._project.findComposition(compositionId)
        if (!rootComposition) throw new RenderingFailedException('Specified composition not found')

        const resolver = new DependencyResolver(this._project, this._pluginRegistry)

        const canvas = document.createElement('canvas') as HTMLCanvasElement
        canvas.width = rootComposition.width
        canvas.height = rootComposition.height

        const compositionDurationTime = rootComposition.durationFrames / rootComposition.framerate
        const bufferSizeBytePerSec = rootComposition.samplingRate * 4 /* bytes */

        const audioContext = new OfflineAudioContext(
            rootComposition.audioChannels,
            Math.ceil(bufferSizeBytePerSec * compositionDurationTime),
            rootComposition.samplingRate,
        )

        const audioBuffers = _.times(
            rootComposition.audioChannels,
            () => new Float32Array(new ArrayBuffer(bufferSizeBytePerSec)),
        )

        const currentFrame = option.beginFrame
        const currentTime = currentFrame / rootComposition.framerate

        return new RenderContextBase({
            time: currentTime,
            timeOnComposition: currentTime,

            frame: currentFrame,
            frameOnComposition: currentFrame,

            destCanvas: canvas,
            width: rootComposition.width,
            height: rootComposition.height,
            framerate: rootComposition.framerate,
            durationFrames: rootComposition.durationFrames,

            destAudioBuffer: audioBuffers,
            audioContext,
            samplingRate: rootComposition.samplingRate,
            neededSamples: rootComposition.samplingRate,
            audioChannels: rootComposition.audioChannels,
            isAudioBufferingNeeded: false,

            rootComposition,
            resolver,
            gl: new WebGLContext(rootComposition.width, rootComposition.height),
        })
    }

    private async _taskingStage(baseContext: RenderContextBase, option: RenderingOption): Promise<LayerRenderTask[]> {
        const layerTasks: LayerRenderTask[] = []

        const renderOrderLayers = baseContext.rootComposition.layers.slice(0).reverse()
        for (const layer of renderOrderLayers) {
            const layerRenderTask = LayerRenderTask.build(layer)

            const clips: ClipRenderTask[] = []
            for (const clip of layer.clips) {
                // Initialize clip
                const clipRenderTask = ClipRenderTask.build({
                    clip,
                    clipRendererCache: this._clipRendererCache,
                    context: baseContext,
                })

                await clipRenderTask.initialize(baseContext)

                // Initialize effects
                const effects: EffectRenderTask[] = []
                for (const effect of clip.effects) {
                    try {
                        const effectRenderTask = EffectRenderTask.build({
                            effect,
                            clip,
                            context: baseContext,
                            effectCache: this._effectCache,
                            resolver: baseContext.resolver,
                        })

                        effects.push(effectRenderTask)
                    } catch (e) {
                        if (e instanceof EffectPluginMissingException && option.ignoreMissingEffect) {
                            continue
                        } else {
                            throw e
                        }
                    }
                }

                // Lookup before apply expression referenceable effect params expression
                const referenceableEffectParams: ExpressionContext.ReferenceableEffectsParams = Object.create(null)

                _.each(clipRenderTask.effectRenderTasks, task => {
                    if (task.effectEntity.referenceName == null) return
                    referenceableEffectParams[task.effectEntity.referenceName] = task.keyframeTable.getParametersAt(
                        baseContext.frame,
                    )
                })

                for (const effectRenderTask of effects) {
                    await effectRenderTask.initialize(baseContext, referenceableEffectParams)
                }

                clipRenderTask.effectRenderTasks = effects
                clips.push(clipRenderTask)
            }

            layerRenderTask.clipRenderTasks = clips
            layerTasks.push(layerRenderTask)
        }

        return layerTasks
    }

    private async _renderStage(context: RenderContextBase, layerRenderTasks: LayerRenderTask[]): Promise<void> {
        const destBufferCanvas = context.destCanvas
        const destBufferCtx = destBufferCanvas.getContext('2d')!

        destBufferCtx.fillStyle = context.rootComposition.backgroundColor.toString()
        destBufferCtx.fillRect(0, 0, context.width, context.height)

        const channelAudioBuffers = _.times(context.rootComposition.audioChannels, () => {
            return new Float32Array(new ArrayBuffer(4 /* bytes */ * context.rootComposition.samplingRate))
        })

        for (const layerTask of layerRenderTasks) {
            const layerBufferCanvas = document.createElement('canvas') as HTMLCanvasElement
            layerBufferCanvas.width = context.width
            layerBufferCanvas.height = context.height

            const layerBufferCanvasCtx = layerBufferCanvas.getContext('2d')!

            // SPEC: The rendering order of the clip in one layer in same time is not defined.
            const renderTargetClips = layerTask.findRenderTargetClipTasks(context)

            // Render clips
            for (const clipTask of renderTargetClips) {
                const clipBufferCanvas = document.createElement('canvas') as HTMLCanvasElement
                clipBufferCanvas.width = context.width
                clipBufferCanvas.height = context.height

                const clipBufferCtx = clipBufferCanvas.getContext('2d')!

                const timeOnClip = context.time - clipTask.clipPlacedFrame / context.framerate
                const frameOnClip = context.frame - clipTask.clipPlacedFrame

                const clipRenderContext = context.toClipRenderContext({
                    clip: clipTask.clipEntity,
                    timeOnClip,
                    frameOnClip,

                    parameters: {},
                    clipEffectParams: {},

                    srcCanvas: clipTask.rendererType === 'adjustment' ? destBufferCanvas : null,
                    destCanvas: clipBufferCanvas,
                    destAudioBuffer: channelAudioBuffers,
                })

                // Lookup before apply expression referenceable effect params expression
                const referenceableEffectParams: ExpressionContext.ReferenceableEffectsParams = Object.create(null)

                _.each(clipTask.effectRenderTasks, task => {
                    if (task.effectEntity.referenceName == null) return
                    referenceableEffectParams[task.effectEntity.referenceName] = task.keyframeTable.getParametersAt(
                        context.frame,
                    )
                })

                const beforeClipExpressionParams = clipTask.keyframeTable.getParametersAt(context.frame)
                const afterExpressionParams = clipTask.keyframeTable.getParameterWithExpressionAt(context.frame, {
                    context: clipRenderContext,
                    clipParams: beforeClipExpressionParams,
                    referenceableEffectParams,
                })

                clipRenderContext.parameters = afterExpressionParams
                clipRenderContext.clipEffectParams = referenceableEffectParams

                await clipTask.clipRenderer.render(clipRenderContext)
                clipBufferCtx!.setTransform(1, 0, 0, 1, 0, 0)

                // Post process effects
                for (const effectTask of clipTask.effectRenderTasks) {
                    const effectRenderContext = context.toEffectRenderContext({
                        effect: effectTask.effectEntity,
                        timeOnClip,
                        frameOnClip,

                        srcCanvas: clipBufferCanvas,
                        destCanvas: clipBufferCanvas,
                        parameters: {},
                    })

                    effectRenderContext.parameters = effectTask.keyframeTable.getParameterWithExpressionAt(
                        context.frame,
                        {
                            context: effectRenderContext,
                            clipParams: beforeClipExpressionParams,
                            referenceableEffectParams,
                        },
                    )

                    await effectTask.effectRenderer.render(effectRenderContext)

                    clipBufferCtx.setTransform(1, 0, 0, 1, 0, 0)
                    clipBufferCtx.globalAlpha = 1
                }

                // Render clip rendering result to merger canvas
                if (clipTask.rendererType === 'adjustment') {
                    // Merge adjustment clip result to last destination canvas

                    // SPEC: Through prevent painting if adjustment clip renders transparent(opacity: 0).
                    // SPEC: Behavior when two or more clips exist on same layer at the same time is not defined.
                    destBufferCtx.globalAlpha = _.clamp(afterExpressionParams.opacity as number, 0, 100) / 100
                    destBufferCtx.drawImage(clipBufferCanvas, 0, 0)
                    destBufferCtx.globalAlpha = 1

                    // SPEC: When there are two or more adjustment clips on the same layer at the same time, the layer buffer is cleared for each that clip rendering
                    //       This is not a problem if there is only one clip at a certain time. (Maybe...)
                    layerBufferCanvasCtx.clearRect(0, 0, context.width, context.height)
                } else {
                    layerBufferCanvasCtx.drawImage(clipBufferCanvas, 0, 0)
                }

                if (context.isAudioBufferingNeeded) {
                    await mergeAudioBufferInto(
                        context.destAudioBuffer,
                        channelAudioBuffers,
                        context.audioChannels,
                        context.samplingRate,
                    )

                    for (const chBuffer of channelAudioBuffers) {
                        chBuffer.fill(0)
                    }
                }
            }

            destBufferCtx.drawImage(layerBufferCanvas, 0, 0)
        }
    }
}
