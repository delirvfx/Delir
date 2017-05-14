import Project from '../../project/project'
import Clip from '../../project/clip'
import Keyframe from '../../project/keyframe'
import EffectPluginBase from '../../plugin-support/effect-plugin-base'
import {TypeDescriptor, ParameterValueTypes} from '../../plugin-support/type-descriptor'
import {IRenderer} from '../renderer/renderer-base'

import PluginRegistry from '../../plugin-support/plugin-registry'

import * as _ from 'lodash'
import ProgressPromise from '../../helper/progress-promise'
import RenderingRequest from './render-request'
import EntityResolver from './entity-resolver'
import * as ProjectHelper from '../../helper/project-helper'
import {RenderingFailedException, RenderingAbortedException} from '../../exceptions/'
import * as RendererFactory from '../renderer'
import * as KeyframeHelper from '../../helper/keyframe-helper'

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

export default class Pipeline
{
    private _state = {
        renderedFrames: 0,
    }

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


    public reInit()
    {

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

    public renderSequencial(compositionId: string, beginFrame: number)
    {

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

        const canvasCtx = canvas.getContext('2d')!
        canvasCtx.fillStyle = rootComposition.backgroundColor.toString()
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

        const compositionDurationTime = rootComposition.durationFrames / rootComposition.framerate
        const bufferSizeBytePerSec = rootComposition.samplingRate *  4 /* bytes */

        const audioContext = new OfflineAudioContext(
            rootComposition.audioChannels,
            Math.ceil(bufferSizeBytePerSec * compositionDurationTime),
            rootComposition.samplingRate
        )

        const audioBuffers = _.times(rootComposition.audioChannels, () => new Float32Array(new ArrayBuffer(bufferSizeBytePerSec)))

        const currentFrame = beginFrame + this._state.renderedFrames
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
                const rendererInitParam = KeyframeHelper.calcKeyframeValuesAt(0, rendererProps, clip.keyframes)
                const renderer = RendererFactory.create(clip.renderer)
                await renderer.beforeRender(req.clone({parameters: rendererInitParam}).toPreRenderingRequest())

                const rendererKeyframeLUT = KeyframeHelper.calcKeyFrames(rendererProps, clip.keyframes, 0, req.durationFrames)

                // Initialize effects
                const effects: IEffectRenderTask[] = []
                for (const effect of clip.effects) {
                    const EffectPluginClass = req.resolver.resolveEffectPlugin(effect.processor)

                    const effectProps = EffectPluginClass.provideParameters()
                    const effectInitParam = KeyframeHelper.calcKeyframeValuesAt(0, effectProps, effect.keyframes)

                    const effector: EffectPluginBase = new EffectPluginClass()
                    await effector.beforeRender(req.clone({parameters: effectInitParam}).toPreRenderingRequest())

                    const effectKeyframeLUT = KeyframeHelper.calcKeyFrames(effectProps, effect.keyframes, 0, req.durationFrames)

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

    private async _initRenderer(clip: Clip, req: RenderingRequest): Promise<{
        renderer: any,
        effects: {entityId: string, instance: EffectPluginBase, parameters: TypeDescriptor}[],
    }>
    {
        const renderer = RendererFactory.create(clip.renderer)
        const effects: {entityId: string, instance: EffectPluginBase, parameters: TypeDescriptor}[] = []

        for (const effectConfig of clip.effects) {
            const Effect = req.resolver.resolveEffectPlugin(effectConfig.processor)
            const effector = new Effect()

            effects.push({
                entityId: effectConfig.id,
                instance: effector,
                parameters: Effect.provideParameters(),
            })
        }

        return {renderer, effects}
    }

    // private _calcKeyframes(clip: Clip, req: RenderingRequest)
    private _calcKeyframes(descriptor: TypeDescriptor, keyframes: {[propName: string]: Keyframe[]})
    {
        const rendererParamType = RendererFactory.getInfo(clip.renderer).parameter.properties
        const initialRendererParams: {[propName: string]: any} = {}

        rendererParamType.forEach(desc => {
            initialRendererParams[desc.propName] = KeyframeHelper.calcKeyframeValueAt(0, desc, clip.keyframes[desc.propName] || [])

            if (desc.type === 'ASSET') {
                initialRendererParams[desc.propName] = req.resolver.resolveAsset(initialRendererParams[desc.propName].assetId)
            }
        })

        req.clone({parameters: Object.freeze(initialRendererParams)})

        // TODO: Effect keyframe calculation

        // Pre calculate keyframe interpolation
        const keyframesClone: {[propName: string]: Keyframe[]} = Object.assign({}, clip.keyframes)
        _.each(rendererParamType, ({propName}) => keyframesClone[propName] = keyframesClone[propName] ? keyframesClone[propName] : [])
        const preCalcTable = KeyframeHelper.calcKeyFrames(rendererParamType, keyframes, 0, req.durationFrames)

        return {
            renderer: {
                initParam: initialRendererParams,
                keyframeLUT: preCalcTable,
            },
        }
    }
}
