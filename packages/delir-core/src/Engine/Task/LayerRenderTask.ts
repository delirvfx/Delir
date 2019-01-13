import { Layer } from '../../Entity'
import { RenderContextBase } from '../RenderContext/RenderContextBase'
import ClipRenderTask from './ClipRenderTask'

export class LayerRenderTask {
    public static build(layer: Layer) {
        const task = new LayerRenderTask()
        task.layer = layer
        return task
    }

    public layer: Layer
    public clipRenderTasks: ClipRenderTask[]

    public findRenderTargetClipTasks(context: RenderContextBase) {
        const audioBufferSizeTime = context.neededSamples / context.samplingRate
        const audioBufferRangeFrame = audioBufferSizeTime * context.framerate

        return this.clipRenderTasks.filter(clip => {
            if (context.isAudioBufferingNeeded && clip.rendererType === 'audio') {
                return (
                    clip.clipPlacedFrame <= context.frameOnComposition + audioBufferRangeFrame - 1 &&
                    clip.clipPlacedFrame + clip.clipDurationFrames > context.frameOnComposition
                )
            }

            return (
                clip.clipPlacedFrame <= context.frameOnComposition &&
                clip.clipPlacedFrame + clip.clipDurationFrames > context.frameOnComposition
            )
        })
    }
}
