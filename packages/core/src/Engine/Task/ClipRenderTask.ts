import _ from 'lodash'

import { TypeDescriptor } from '../..'
import { Clip } from '../../Entity'
import { ParametersTable } from '../ParametersTable'
import { RenderContextBase } from '../RenderContext/RenderContextBase'
import * as RendererFactory from '../Renderer'
import { IRenderer } from '../Renderer/RendererBase'
import EffectRenderTask from './EffectRenderTask'

export default class ClipRenderTask {
    public static build({
        clip,
        clipRendererCache,
        context,
    }: {
        clip: Clip
        clipRendererCache: WeakMap<Clip, IRenderer<any>>
        context: RenderContextBase
    }): ClipRenderTask {
        const rendererParams = RendererFactory.getInfo(clip.renderer).parameter
        const keyframeTable = ParametersTable.build(context, clip, clip.keyframes, clip.expressions, rendererParams)

        let clipRenderer = clipRendererCache.get(clip)
        if (!clipRenderer) {
            clipRenderer = RendererFactory.create(clip.renderer)
            clipRendererCache.set(clip, clipRenderer)
        }

        const task = new ClipRenderTask()
        task.clipEntity = clip
        task.clipRenderer = clipRenderer
        task.paramTypes = rendererParams
        task.keyframeTable = keyframeTable
        task.audioBuffer = _.times(context.rootComposition.audioChannels, () => {
            return new Float32Array(new ArrayBuffer(context.neededSamples * 4))
        })

        return task
    }

    public clipEntity: Clip
    public clipRenderer: IRenderer<any>
    public paramTypes: TypeDescriptor
    public effectRenderTasks: EffectRenderTask[]
    public keyframeTable: ParametersTable
    public audioBuffer: Float32Array[]

    public get rendererType() {
        return this.clipEntity.renderer
    }

    public get clipPlacedFrame() {
        return this.clipEntity.placedFrame
    }

    public get clipDurationFrames() {
        return this.clipEntity.durationFrames
    }

    public async initialize(context: RenderContextBase) {
        const preRenderReq = context.toClipPreRenderContext({
            clip: this.clipEntity,
            parameters: this.keyframeTable.initialParams,
        })

        await this.clipRenderer.beforeRender(preRenderReq)
    }
}
