import Project from '../../project/project'
import Clip from '../../project/clip'
import Expression from '../../values/expression'
import EffectPluginBase from '../../plugin-support/PostEffectBase'
import {TypeDescriptor, ParameterValueTypes} from '../../plugin-support/type-descriptor'
import {IRenderer} from '../renderer/renderer-base'
import {IRenderingStreamObserver, RenderingStatus} from './IRenderingStreamObserver'

import PluginRegistry from '../../plugin-support/plugin-registry'

import * as _ from 'lodash'
import * as timecodes from 'node-timecodes'
import * as TypeScript from 'typescript'
import * as vm from 'vm'
import ProgressPromise from '../../helper/progress-promise'
import RenderingRequest from './render-request'
import EntityResolver from './entity-resolver'
import * as ProjectHelper from '../../helper/project-helper'
import {RenderingFailedException, RenderingAbortedException} from '../../exceptions/'
import * as RendererFactory from '../renderer'
import * as KeyframeHelper from '../../helper/keyframe-helper'
import defaults from '../../helper/defaults'
import FPSCounter from '../../helper/FPSCounter'
import * as ExpressionContext from './ExpressionContext'
import WebGLContextPool from './WebGLContextPool'
import {mergeInto as mergeAudioBufferInto, arraysToAudioBuffer} from '../../helper/Audio'

interface ExpressionExecuters {
    [propName: string]: (exposes: ExpressionContext.Exposes) => void
}

interface IEffectRenderTask {
    effectEntityId: string
    instance: EffectPluginBase
    effectorProps: TypeDescriptor
    keyframeLUT: {[propName: string]: {[frame: number]: ParameterValueTypes}}
    expressions: ExpressionExecuters
}

interface IClipRenderTask {
    renderer: IRenderer<any>
    rendererProps: TypeDescriptor
    rendererType: RendererFactory.AvailableRenderer
    clipPlacedFrame: number
    clipDurationFrames: number
    keyframeLUT: {[propName: string]: {[frame: number]: ParameterValueTypes}}
    expressions: ExpressionExecuters
    effects: IEffectRenderTask[]
}

interface ILayerRenderTask {
    layerId: string
    clips: IClipRenderTask[]
}

interface RenderingOption {
    beginFrame: number
    endFrame: number
    loop: boolean
}

interface RenderProgression {
    state: string
    isAudioBuffered: boolean
    audioBuffers: Float32Array[]
    currentFrame: number
    rangeEndFrame: number
}

const tsCompileOption: TypeScript.CompilerOptions = {}

export default class Pipeline
{
    private _fpsCounter: FPSCounter = new FPSCounter()
    private _seqRenderPromise: ProgressPromise<void>|null = null
    private _project: Project
    private _pluginRegistry: PluginRegistry = new PluginRegistry()
    private _destinationAudioNode: AudioNode
    private _rendererCache: WeakMap<Clip, IRenderer<any>> = new WeakMap()
    private _streamObserver: IRenderingStreamObserver|null = null
    private webGLContextPool: WebGLContextPool = new WebGLContextPool()

    get project() { return this._project }
    set project(project: Project) { this._project = project }

    get pluginRegistry() { return this._pluginRegistry }
    set pluginRegistry(pluginRegistry: PluginRegistry) { this._pluginRegistry = pluginRegistry }

    // get destinationAudioNode() { return this._destinationAudioNode }
    // set destinationAudioNode(destinationAudioNode: AudioNode) { this._destinationAudioNode = destinationAudioNode }

    public setStreamObserver(observer: IRenderingStreamObserver)
    {
        this._streamObserver = observer
    }

    public removeStreamObserver(observer: IRenderingStreamObserver)
    {
        this._streamObserver = null
    }

    public stopCurrentRendering()
    {
        if (this._seqRenderPromise) {
            this._seqRenderPromise.abort()
        }
    }

    public renderFrame(compositionId: string, beginFrame: number): ProgressPromise<void>
    {
        return new ProgressPromise<void>(async (resolve, reject, onAbort, notifier) => {
            let aborted = false
            onAbort(() => aborted = true)

            const request = this._initStage(compositionId, beginFrame)

            const renderTasks = await this._taskingStage(request)
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

    public renderSequencial(compositionId: string, options: Partial<RenderingOption> = {}): ProgressPromise<void, RenderProgression>
    {
        const _options: RenderingOption = defaults(options, {
            beginFrame: 0,
            loop: false,
            endFrame: -1,
        })

        this.stopCurrentRendering()

        return this._seqRenderPromise = new ProgressPromise<void, RenderProgression>(async (resolve, reject, onAbort, notifier) => {
            let aborted = false

            onAbort(() => {
                aborted = true
                this._seqRenderPromise = null
            })

            let request = this._initStage(compositionId, _options.beginFrame)
            const renderTasks = await this._taskingStage(request)
            this._fpsCounter.reset()

            const reqDestCanvasCtx = request.destCanvas.getContext('2d')!
            const framerate = request.rootComposition.framerate
            const lastFrame = request.rootComposition.durationFrames
            let animationFrameId: number
            let renderedFrames = 0
            let lastAudioBufferTime = -1

            const render = _.throttle(async () => {
                const currentFrame = _options.beginFrame + renderedFrames
                const currentTime = currentFrame / framerate

                // 最後のバッファリングから１秒経過 & 次のフレームがレンダリングの終わりでなければバッファリング
                const isAudioBufferingNeeded = lastAudioBufferTime !== (currentTime|0) && (renderedFrames + 1) <= request.durationFrames

                if (isAudioBufferingNeeded) {
                    lastAudioBufferTime = currentTime|0

                    for (const buffer of request.destAudioBuffer) {
                        buffer.fill(0)
                    }
                }

                request = request.clone({
                    frame: currentFrame,
                    time: currentTime,
                    frameOnComposition: currentFrame,
                    timeOnComposition: currentTime,
                    isAudioBufferingNeeded,
                })

                reqDestCanvasCtx.clearRect(0, 0, request.width, request.height)
                await this._renderStage(request, renderTasks)

                if (!aborted) {
                    const status: RenderingStatus = {
                        frame: request.frame,
                        time: request.time,
                        durationFrame: request.durationFrames,
                        samplingRate: request.samplingRate,
                    }

                    if (this._streamObserver) {
                        if (this._streamObserver.onStateChanged) this._streamObserver.onStateChanged(status)
                        if (this._streamObserver.onFrame) this._streamObserver.onFrame(request.destCanvas, status)

                        if (isAudioBufferingNeeded) {
                            if (this._streamObserver.onAudioBuffered) this._streamObserver.onAudioBuffered(request.destAudioBuffer, status)
                        }
                    }
                }

                if (_options.beginFrame + renderedFrames >= lastFrame) {
                    if (_options.loop) {
                        renderedFrames = 0
                        lastAudioBufferTime = -1
                    } else {
                        cancelAnimationFrame(animationFrameId)
                        resolve()
                        return
                    }
                } else {
                    renderedFrames++
                }

                if (aborted) {
                    cancelAnimationFrame(animationFrameId)
                    reject(new RenderingAbortedException('Rendering aborted.'))
                    return
                }

                const timecode = timecodes.fromSeconds(request.time, {frameRate: request.framerate})
                notifier({
                    state: `time: ${timecode.slice(0, -3)} (${this._fpsCounter.latestFPS()} / ${request.framerate} fps)`,
                    currentFrame: request.frame,
                    rangeEndFrame: _options.endFrame,
                    isAudioBuffered: isAudioBufferingNeeded,
                    audioBuffers: request.destAudioBuffer,
                })

                this._fpsCounter.increase()
                animationFrameId = requestAnimationFrame(render)
            }, 1000 / request.framerate)

            animationFrameId = requestAnimationFrame(render)
        })
    }

    private _initStage(compositionId: string, beginFrame: number): RenderingRequest
    {
        if (!this._project) throw new RenderingFailedException('Project must be set before rendering')
        if (!this._pluginRegistry) throw new RenderingFailedException('Plugin registry not set')

        const rootComposition = ProjectHelper.findCompositionById(this._project, compositionId)
        if (!rootComposition) throw new RenderingFailedException('Specified composition not found')

        const resolver = new EntityResolver(this._project, this._pluginRegistry)

        const canvas = document.createElement('canvas') as HTMLCanvasElement
        canvas.width = rootComposition.width
        canvas.height = rootComposition.height

        const compositionDurationTime = rootComposition.durationFrames / rootComposition.framerate
        const bufferSizeBytePerSec = rootComposition.samplingRate *  4 /* bytes */

        const audioContext = new OfflineAudioContext(
            rootComposition.audioChannels,
            Math.ceil(bufferSizeBytePerSec * compositionDurationTime),
            rootComposition.samplingRate
        )

        const audioBuffers = _.times(rootComposition.audioChannels, () => new Float32Array(new ArrayBuffer(bufferSizeBytePerSec)))

        const currentFrame = beginFrame
        const currentTime = currentFrame / rootComposition.framerate

        return new RenderingRequest({
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
            glContextPool: this.webGLContextPool,
        })
    }

    private async _taskingStage(this: Pipeline, req: RenderingRequest): Promise<ILayerRenderTask[]>
    {
        const layerTasks: ILayerRenderTask[] = []

        const renderOrderLayers = req.rootComposition.layers.slice(0).reverse()
        for (const layer of renderOrderLayers) {

            const clips: IClipRenderTask[] = []
            for (const clip of layer.clips) {
                // yield

                // Initialize renderer
                const rendererProps = RendererFactory.getInfo(clip.renderer).parameter
                const rendererAssetProps = rendererProps.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.propName)
                const rendererInitParam = KeyframeHelper.calcKeyframeValuesAt(0, clip.placedFrame, rendererProps, clip.keyframes)
                rendererAssetProps.forEach(propName => {
                    rendererInitParam[propName] = rendererInitParam[propName]
                        ? req.resolver.resolveAsset(rendererInitParam[propName].assetId)
                        : null
                })

                let renderer = this._rendererCache.get(clip)
                if (!renderer) {
                    renderer = RendererFactory.create(clip.renderer)
                    this._rendererCache.set(clip, renderer)
                    await renderer.beforeRender(req.clone({parameters: rendererInitParam}).toPreRenderingRequest())
                }

                const rendererKeyframeLUT = KeyframeHelper.calcKeyFrames(rendererProps, clip.keyframes, clip.placedFrame, 0, req.durationFrames)
                rendererAssetProps.forEach(propName => {
                    rendererKeyframeLUT[propName] = _.map(rendererKeyframeLUT[propName], value => req.resolver.resolveAsset(value.assetId)!)
                })

                const rendererExpressions = _(clip.expressions).mapValues((expr: Expression) => {
                    const code = expr.language === 'typescript' ? TypeScript.transpile(expr.code, tsCompileOption) : expr.code
                    const script = new vm.Script(code, {filename: `${layer.name}.${clip.id}.expression.ts`})
                    return (exposes: ExpressionContext.Exposes) => script.runInNewContext(ExpressionContext.makeContext(exposes))
                }).pickBy(value => value !== null).value() as ExpressionExecuters

                // Initialize effects
                const effects: IEffectRenderTask[] = []
                for (const effect of clip.effects) {
                    const EffectPluginClass = req.resolver.resolveEffectPlugin(effect.processor)

                    if (EffectPluginClass == null) break

                    const effectProps = EffectPluginClass.provideParameters()
                    const effectAssetProps = effectProps.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.propName)
                    const effectInitParam = KeyframeHelper.calcKeyframeValuesAt(0, clip.placedFrame, effectProps, effect.keyframes)
                    effectAssetProps.forEach(propName => {
                        effectInitParam[propName] = effectInitParam[propName]
                            ? req.resolver.resolveAsset(effectInitParam[propName].assetId)
                            : null
                    })

                    const effector: EffectPluginBase = new EffectPluginClass()
                    await effector.initialize(req.clone({parameters: effectInitParam}).toPreRenderingRequest())

                    const effectKeyframeLUT = KeyframeHelper.calcKeyFrames(effectProps, effect.keyframes, clip.placedFrame, 0, req.durationFrames)
                    effectAssetProps.forEach(propName => {
                        effectKeyframeLUT[propName] = _.map(effectKeyframeLUT[propName], value => req.resolver.resolveAsset(value.assetId)!)
                    })

                    const effectExpressions = _(effect.expressions).mapValues((expr: Expression) => {
                        const code = expr.language === 'typescript' ? TypeScript.transpile(expr.code, tsCompileOption) : expr.code
                        const script = new vm.Script(code, {filename: `${layer.name}.${clip.id}.effect.expression.ts`})
                        return (exposes: ExpressionContext.Exposes) => script.runInNewContext(ExpressionContext.makeContext(exposes))
                    }).pickBy(value => value !== null).value() as ExpressionExecuters

                    effects.push({
                        effectEntityId: effect.id,
                        instance: effector,
                        effectorProps: effectProps,
                        keyframeLUT: effectKeyframeLUT,
                        expressions: effectExpressions,
                    })
                }

                clips.push({
                    renderer,
                    // rendererInfo: RendererFactory.getInfo(clip.renderer),
                    rendererProps,
                    rendererType: clip.renderer,
                    clipPlacedFrame: clip.placedFrame,
                    clipDurationFrames: clip.durationFrames,
                    keyframeLUT: rendererKeyframeLUT,
                    expressions: rendererExpressions,
                    effects,
                })
            }

            layerTasks.push({
                layerId: layer.id,
                clips
            })
        }

        return layerTasks
    }

    private async _renderStage(req: RenderingRequest, layerRenderTasks: ILayerRenderTask[]): Promise<void>
    {
        const destBufferCanvas = req.destCanvas
        const destBufferCtx = destBufferCanvas.getContext('2d')!

        destBufferCtx.fillStyle = req.rootComposition.backgroundColor.toString()
        destBufferCtx.fillRect(0, 0, req.width, req.height)

        const channelAudioBuffers = _.times(req.rootComposition.audioChannels, () => {
            return new Float32Array(new ArrayBuffer(4 /* bytes */ * req.rootComposition.samplingRate))
        })

        const audioBufferingSizeTime = req.neededSamples / req.samplingRate
        const audioRenderStartRangeFrame = audioBufferingSizeTime * req.framerate

        for (const layerTask of layerRenderTasks) {
            const layerBufferCanvas = document.createElement('canvas') as HTMLCanvasElement
            layerBufferCanvas.width = req.width
            layerBufferCanvas.height = req.height

            const layerBufferCanvasCtx = layerBufferCanvas.getContext('2d')!

            const renderTargetClips = layerTask.clips.filter(clip => {
                if (req.isAudioBufferingNeeded && clip.rendererType === 'audio') {
                    return clip.clipPlacedFrame <= (req.frameOnComposition + audioRenderStartRangeFrame)
                        && clip.clipPlacedFrame + clip.clipDurationFrames >= req.frameOnComposition
                }

                return clip.clipPlacedFrame <= req.frameOnComposition
                    && clip.clipPlacedFrame + clip.clipDurationFrames >= req.frameOnComposition
            })

            // Render clips
            for (const clipTask of renderTargetClips) {
                const clipBufferCanvas = document.createElement('canvas') as HTMLCanvasElement
                clipBufferCanvas.width = req.width
                clipBufferCanvas.height = req.height

                let renderReq = req.clone({
                    timeOnClip: req.time - (clipTask.clipPlacedFrame / req.framerate),
                    frameOnClip: req.frame - clipTask.clipPlacedFrame,

                    destCanvas: /* isAdjustClip */ false ? destBufferCanvas: clipBufferCanvas,
                    destAudioBuffer: channelAudioBuffers,
                })

                const beforeExpressionParams = _.fromPairs(clipTask.rendererProps.properties.map(desc => {
                    return [desc.propName, clipTask.keyframeLUT[desc.propName][req.frame]]
                }))

                const afterExpressionParams = _.mapValues(beforeExpressionParams, (value, propName) => {
                    if (clipTask.expressions[propName!]) {
                        // TODO: Value type Validation
                        const result = clipTask.expressions[propName!]({
                            req: renderReq,
                            clipProperties: beforeExpressionParams,
                            currentValue: value
                        })

                        return result === void 0 ? value : result
                    }

                    return value
                })

                renderReq = renderReq.clone({parameters: afterExpressionParams})

                if (/* isCompositionClip */ false) {
                    const frameOnComposition = req.frame - clipTask.clipPlacedFrame

                    // TODO: frame mapping for set different framerate for sub-composition
                    renderReq = req.clone({
                        frameOnComposition,
                        timeOnComposition: frameOnComposition / req.framerate,

                        parentComposition: req.rootComposition
                    })
                }

                await clipTask.renderer.render(renderReq)

                clipBufferCanvas.getContext('2d')!.setTransform(1, 0, 0, 1, 0, 0)

                // Post process effects
                for (const effectTask of clipTask.effects) {
                    const effectorParams = _.fromPairs(effectTask.effectorProps.properties.map(desc => [desc.propName, effectTask.keyframeLUT[desc.propName][req.frame]])) as {[propName: string]: ParameterValueTypes}
                    const effectRenderReq = req.clone({
                        destCanvas: clipBufferCanvas,
                        parameters: effectorParams,
                    })

                    await effectTask.instance.render(effectRenderReq)
                }

                layerBufferCanvasCtx.drawImage(clipBufferCanvas, 0, 0)

                if (req.isAudioBufferingNeeded) {
                    await mergeAudioBufferInto(
                        req.destAudioBuffer,
                        channelAudioBuffers,
                        req.audioChannels,
                        req.samplingRate
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
