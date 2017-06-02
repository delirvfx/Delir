import Project from '../../project/project'
import EffectPluginBase from '../../plugin-support/effect-plugin-base'
import {TypeDescriptor, ParameterValueTypes} from '../../plugin-support/type-descriptor'
import {IRenderer} from '../renderer/renderer-base'

import PluginRegistry from '../../plugin-support/plugin-registry'

import * as _ from 'lodash'
import * as timecodes from 'node-timecodes'
import ProgressPromise from '../../helper/progress-promise'
import RenderingRequest from './render-request'
import EntityResolver from './entity-resolver'
import * as ProjectHelper from '../../helper/project-helper'
import {RenderingFailedException, RenderingAbortedException} from '../../exceptions/'
import * as RendererFactory from '../renderer'
import * as KeyframeHelper from '../../helper/keyframe-helper'
import defaults from '../../helper/defaults'
import FPSCounter from '../../helper/FPSCounter'

interface IEffectRenderTask {
    effectEntityId: string
    instance: EffectPluginBase
    effectorProps: TypeDescriptor
    keyframeLUT: {[propName: string]: {[frame: number]: ParameterValueTypes}}
}

interface IClipRenderTask {
    renderer: IRenderer<any>
    rendererProps: TypeDescriptor
    clipPlacedFrame: number
    clipDurationFrames: number
    keyframeLUT: {[propName: string]: {[frame: number]: ParameterValueTypes}}
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
    currentFrame: number
    rangeEndFrame: number
}

export default class Pipeline
{
    private _fpsCounter: FPSCounter = new FPSCounter()
    private _seqRenderPromise: ProgressPromise<void>|null = null
    private _project: Project
    private _pluginRegistry: PluginRegistry
    private _destinationCanvas: HTMLCanvasElement
    private _destinationAudioNode: AudioNode

    get project() { return this._project }
    set project(project: Project) { this._project = project }

    get pluginRegistry() { return this._pluginRegistry }
    set pluginRegistry(pluginRegistry: PluginRegistry) { this._pluginRegistry = pluginRegistry }

    get destinationCanvas() { return this._destinationCanvas }
    set destinationCanvas(destinationCanvas: HTMLCanvasElement) { this._destinationCanvas = destinationCanvas }

    get destinationAudioNode() { return this._destinationAudioNode }
    set destinationAudioNode(destinationAudioNode: AudioNode) { this._destinationAudioNode = destinationAudioNode }

    public stopCurrentRendering() {
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

            const renderTasks = await this._setupStage(request)
            await this._renderStage(request, renderTasks)

            const destCanvasCtx = this.destinationCanvas.getContext('2d')!
            destCanvasCtx.drawImage(request.destCanvas, 0, 0)

            resolve()
        })
    }

    public renderSequencial(compositionId: string, options: Optionalized<RenderingOption> = {}): ProgressPromise<void, RenderProgression>
    {
        const _options: RenderingOption  = defaults(options, {
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
            const renderTasks = await this._setupStage(request)
            this._fpsCounter.reset()

            // const reqDestCanvasCtx = request.destCanvas.getContext('2d')!
            const framerate = request.rootComposition.framerate
            const lastFrame = request.rootComposition.durationFrames
            let animationFrameId: number
            let rendereredFrames = 0

            const render = _.throttle(async () => {
                const currentFrame = _options.beginFrame + rendereredFrames

                request = request.clone({
                    frame: currentFrame,
                    time: currentFrame / framerate,
                    frameOnComposition: currentFrame,
                    timeOnComposition: currentFrame / framerate,
                })

                // reqDestCanvasCtx.clearRect(0, 0, request.width, request.height)
                await this._renderStage(request, renderTasks)

                const destCanvasCtx = this.destinationCanvas.getContext('2d')!
                destCanvasCtx.drawImage(request.destCanvas, 0, 0)

                if (_options.beginFrame + rendereredFrames >= lastFrame) {
                    if (_options.loop) {
                        rendereredFrames = 0
                    } else {
                        cancelAnimationFrame(animationFrameId)
                        reject(new RenderingAbortedException('Rendering aborted.'))
                        return
                    }
                } else {
                    rendereredFrames++
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
                    rangeEndFrame: _options.endFrame
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
        if (!this._destinationCanvas) throw new RenderingFailedException('Destination canvas not set')

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

            rootComposition,
            resolver,
        })
    }

    private async _setupStage(this: Pipeline, req: RenderingRequest): Promise<ILayerRenderTask[]>
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
                const rendererInitParam = KeyframeHelper.calcKeyframeValuesAt(0, rendererProps, clip.keyframes)
                rendererAssetProps.forEach(propName => {
                    rendererInitParam[propName] = req.resolver.resolveAsset(rendererInitParam[propName].assetId)!
                })

                const renderer = RendererFactory.create(clip.renderer)
                await renderer.beforeRender(req.clone({parameters: rendererInitParam}).toPreRenderingRequest())

                const rendererKeyframeLUT = KeyframeHelper.calcKeyFrames(rendererProps, clip.keyframes, 0, req.durationFrames)
                rendererAssetProps.forEach(propName => {
                    rendererKeyframeLUT[propName] = _.map(rendererKeyframeLUT[propName], value => req.resolver.resolveAsset(value.assetId)!)
                })

                // Initialize effects
                const effects: IEffectRenderTask[] = []
                for (const effect of clip.effects) {
                    const EffectPluginClass = req.resolver.resolveEffectPlugin(effect.processor)

                    const effectProps = EffectPluginClass.provideParameters()
                    const effectAssetProps = rendererProps.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.propName)
                    const effectInitParam = KeyframeHelper.calcKeyframeValuesAt(0, effectProps, effect.keyframes)
                    effectAssetProps.forEach(propName => {
                        rendererInitParam[propName] = req.resolver.resolveAsset(rendererInitParam[propName].assetId)!
                    })

                    const effector: EffectPluginBase = new EffectPluginClass()
                    await effector.beforeRender(req.clone({parameters: effectInitParam}).toPreRenderingRequest())

                    const effectKeyframeLUT = KeyframeHelper.calcKeyFrames(effectProps, effect.keyframes, 0, req.durationFrames)
                    effectAssetProps.forEach(propName => {
                        effectKeyframeLUT[propName] = _.map(effectKeyframeLUT[propName], value => req.resolver.resolveAsset(value.assetId)!)
                    })

                    effects.push({
                        effectEntityId: effect.id,
                        instance: effector,
                        effectorProps: effectProps,
                        keyframeLUT: effectKeyframeLUT
                    })
                }

                clips.push({
                    renderer,
                    // rendererInfo: RendererFactory.getInfo(clip.renderer),
                    rendererProps,
                    clipPlacedFrame: clip.placedFrame,
                    clipDurationFrames: clip.durationFrames,
                    keyframeLUT: rendererKeyframeLUT,
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

        for (const layerTask of layerRenderTasks) {
            const layerBufferCanvas = document.createElement('canvas') as HTMLCanvasElement
            layerBufferCanvas.width = req.width
            layerBufferCanvas.height = req.height

            const layerBufferCanvasCtx = layerBufferCanvas.getContext('2d')!

            const renderTargetClips = layerTask.clips.filter(clip => {
                return clip.clipPlacedFrame <= req.frameOnComposition
                    && clip.clipPlacedFrame + clip.clipDurationFrames >= req.frameOnComposition
            })

            // Render clips
            for (const clipTask of renderTargetClips) {
                const clipBufferCanvas = document.createElement('canvas') as HTMLCanvasElement
                clipBufferCanvas.width = req.width
                clipBufferCanvas.height = req.height

                const params = _.fromPairs(clipTask.rendererProps.properties.map(desc => [desc.propName, clipTask.keyframeLUT[desc.propName][req.frame]]))
                let renderReq = req.clone({
                    timeOnClip: req.time - (clipTask.clipPlacedFrame / req.framerate),
                    frameOnClip: req.frame - clipTask.clipPlacedFrame,

                    destCanvas: /* isAdjustClip */ false ? destBufferCanvas: clipBufferCanvas,
                    parameters: params,
                })

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
            }

            destBufferCtx.drawImage(layerBufferCanvas, 0, 0)
        }
    }
}
