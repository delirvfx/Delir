import { Layer } from '../../Entity'
import ClipRenderTask from './ClipRenderTask'

export class LayerRenderTask {
    public static build(layer: Layer) {
        const task = new LayerRenderTask()
        task.layer = layer
        return task
    }

    public layer: Layer
    public clipRenderTasks: ClipRenderTask[]
}
