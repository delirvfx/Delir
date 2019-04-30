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
    }): ClipRenderTask
    public clipEntity: Clip
    public clipRenderer: IRenderer<any>
    public paramTypes: TypeDescriptor
    public effectRenderTasks: EffectRenderTask[]
    public keyframeTable: ParametersTable
    public audioBuffer: Float32Array[]
    public readonly rendererType: RendererFactory.AvailableRenderer
    public readonly clipPlacedFrame: number
    public readonly clipDurationFrames: number
    public initialize(context: RenderContextBase): Promise<void>
}
