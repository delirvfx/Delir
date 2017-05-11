import Project from '../../project/project'
import Clip from '../../project/clip'
import Keyframe from '../../project/keyframe'
import EffectPluginBase from '../../plugin-support/effect-plugin-base'
import {default as TypeDescriptor, ParameterValueTypes} from '../../plugin-support/type-descriptor'
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

interface IEffectorInstanceSet {
    entityId: string
    instance: EffectPluginBase
    keyframeLUT: {[propName: string]: {[frame: number]: ParameterValueTypes}}
}

interface IRenderTask {
    renderer: IRenderer<any>
    effects: IEffectorInstanceSet[]
    keyframeLUT: {[propName: string]: {[frame: number]: ParameterValueTypes}}
}

export default class Pipeline
{
    private _state = {
        frameCursor: 0,
    }

    private _currentRequest: RenderingRequest
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

    public renderFrame(compositionId: string, frame: number)
    {
        return new ProgressPromise<void>(async (resolve, reject, onAbort, notifier) => {
            let aborted = false
            onAbort(() => aborted = true)

            const request = this._currentRequest ? this._currentRequest : this._initStage(compositionId)
            this._currentRequest = request

            const instanceSets = []
            for await (let instanceSet of this._setupStage(request)) {
                if (aborted) {
                    reject(new RenderingAbortedException('Rendering aborted'))
                    return
                }

                console.log(instanceSet)
                // instanceSets.push(instanceSet)
            }

            for await (let process of this._renderStage(request, instanceSets)) {
                if (aborted) {
                    reject(new RenderingAbortedException('Rendering aborted'))
                    return
                }
            }

            console.log('done')
            resolve()
        })
    }

    public renderSequencial(compositionId: string, beginFrame: number)
    {

    }

    private _initStage(compositionId: string): RenderingRequest
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

        return new RenderingRequest({
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

    private _setupStage = async function*(this: Pipeline, req: RenderingRequest): AsyncIterator<IRenderTask[]>
    {
        const renderTasks: IRenderTask[] = []

        for (const layer of req.rootComposition.layers) {
            for (const clip of layer.clips) {
                yield

                // Initialize renderer
                const rendererParamType = RendererFactory.getInfo(clip.renderer).parameter
                const rendererInitParam = KeyframeHelper.calcKeyframeValuesAt(0, rendererParamType, clip.keyframes)
                const renderer = RendererFactory.create(clip.renderer)
                renderer.beforeRender(req.clone({parameters: rendererInitParam}).toPreRenderingRequest())

                const renderers = await this._initRenderer(clip, req)
                await renderer.beforeRender(req.clone({parameters: rendererInitParam}).toPreRenderingRequest())

                const rendererKeyframeLUT = KeyframeHelper.calcKeyFrames(rendererParamType, clip.keyframes, 0, req.durationFrames)

                // Initialize effects
                const effects = []
                for (const effect of clip.effects) {
                    const EffectPluginClass = req.resolver.resolveEffectPlugin(effect.processor)

                    const effectParamType = EffectPluginClass.provideParameters()
                    const effectInitParam = KeyframeHelper.calcKeyframeValuesAt(0, effectParamType, effect.keyframes)

                    const effector: EffectPluginBase = new EffectPluginClass()
                    await effector.beforeRender(req.clone({parameters: effectInitParam}).toPreRenderingRequest())

                    const effectKeyframeLUT = KeyframeHelper.calcKeyFrames(effectParamType, effect.keyframes, 0, req.durationFrames)

                    effects.push({entityId: effect.id, instance: effector, keyframeLUT: effectKeyframeLUT})
                }


                renderTasks.push({renderer, effects, keyframeLUT: rendererKeyframeLUT})
            }
        }

        return renderTasks
    }

    private _renderStage = async function*(this: Pipeline, req: RenderingRequest, renderTasks: IRenderTask[]): AsyncIterator<void>
    {
        for (const instanceSet of renderTasks) {
            const canvas = document.createElement('canvas') as HTMLCanvasElement
            const renderReq = req.clone({
                destCanvas: canvas,
                parameters: instanceSet,
            })
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
