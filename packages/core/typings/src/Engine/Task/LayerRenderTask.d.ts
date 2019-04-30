import { Layer } from '../../Entity'
import { RenderContextBase } from '../RenderContext/RenderContextBase'
import ClipRenderTask from './ClipRenderTask'
export declare class LayerRenderTask {
    public static build(layer: Layer): LayerRenderTask
    public layer: Layer
    public clipRenderTasks: ClipRenderTask[]
    public findRenderTargetClipTasks(context: RenderContextBase): ClipRenderTask[]
}
