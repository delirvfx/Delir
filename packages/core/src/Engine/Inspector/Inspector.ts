import { flatten } from 'lodash-es'
import Engine from '../Engine'
import ClipRenderTask from '../Task/ClipRenderTask'
import { BBox } from './BBox'

export class Inspector {
  constructor(private engine: Engine) {}

  public async inspectClip({
    clipId,
    compositionId,
    frame,
  }: {
    compositionId: string
    clipId: string
    frame: number
  }): Promise<BBox | null> {
    const context = this.engine._initStage(compositionId, { beginFrame: frame, audioBufferSizeSecond: 1 })
    const tasks = await this.engine._taskingStage(context, { beginFrame: frame })

    const clipTask = (() => {
      for (const layerTask of tasks) {
        for (const clipTask of layerTask.clipRenderTasks) {
          if (clipTask.clipEntity.id === clipId) return clipTask
        }
      }

      return null
    })()

    if (!clipTask) return null
    return clipTask.clipRenderer.getBBox(context)
  }

  public async inspectElementsAtFrame({ compositionId, frame }: { compositionId: string; frame: number }) {
    const context = this.engine._initStage(compositionId, {
      beginFrame: frame,
      endFrame: frame,
      loop: false,
      audioBufferSizeSecond: 1,
      ignoreMissingEffect: true,
      realtime: false,
    })
    const tasks = await this.engine._taskingStage(context, {
      beginFrame: frame,
      endFrame: frame,
      loop: false,
      audioBufferSizeSecond: 1,
      ignoreMissingEffect: true,
      realtime: false,
    })

    const clipTasks = tasks.map(layerTask => layerTask.findRenderTargetClipTasks(context))

    const elements = await Promise.all(
      flatten<ClipRenderTask>(clipTasks).map(async clipTask => {
        return {
          clip: clipTask.clip,
          bBox: await clipTask.clipRenderer.getBBox(context),
        }
      }),
    )

    return elements
  }
}
