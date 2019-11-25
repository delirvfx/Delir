import { EffectPreRenderContext, EffectRenderContext, ParamType, PostEffectBase, Type } from '@delirvfx/core'

interface Params {
  framerate: ParamType.Number
  opacity: ParamType.Float
}

export default class TimePosterizationEffect extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    // prettier-ignore
    return Type
      .number('framerate', { label: 'Framerate', defaultValue: () => 24, animatable: false })
      .float('opacity', { label: 'Opacity', defaultValue: () => 100, animatable: true })
  }

  private bufCanvas: HTMLCanvasElement
  private bufCtx: CanvasRenderingContext2D
  private previusFrame: number = 0

  public async initialize(context: EffectPreRenderContext<Params>) {
    const canvas = document.createElement('canvas')
    canvas.width = context.width
    canvas.height = context.height

    this.bufCanvas = canvas
    this.bufCanvas.width = context.width
    this.bufCanvas.height = context.height
    this.bufCtx = canvas.getContext('2d')!
    this.previusFrame = 0
  }

  public async render(context: EffectRenderContext<Params>) {
    const param = context.parameters
    const sampleIntervalFrame = context.framerate / param.framerate

    if (context.frameOnClip === 0) {
      this.bufCtx.drawImage(context.srcCanvas, 0, 0)
    }

    if (context.frameOnClip - this.previusFrame > sampleIntervalFrame) {
      this.bufCtx.drawImage(context.srcCanvas, 0, 0)
      this.previusFrame = context.frameOnClip
    }

    const destCtx = context.destCanvas.getContext('2d')!
    destCtx.drawImage(this.bufCanvas, 0, 0)
  }
}
