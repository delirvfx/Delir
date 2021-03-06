import { EffectPreRenderContext, EffectRenderContext, ParamType, PostEffectBase, Type } from '@delirvfx/core'

import clamp from 'lodash/clamp'

interface Params {
  opacity: ParamType.Float
}

export default class TheWorldPostEffect extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    return Type.float('opacity', { label: 'Opacity', defaultValue: () => 100, animatable: true })
  }

  private canvas: HTMLCanvasElement
  private bufCtx: CanvasRenderingContext2D

  /**
   * Called when before rendering start.
   *
   * If you want initializing before rendering (likes load audio, image, etc...)
   * Do it in this method.
   */
  public async initialize(context: EffectPreRenderContext<Params>) {
    const canvas = document.createElement('canvas')
    canvas.width = context.width
    canvas.height = context.height

    this.canvas = canvas
    this.bufCtx = canvas.getContext('2d')!
  }

  /**
   * Render frame into destination canvas.
   * @param context
   */
  public async render(context: EffectRenderContext<Params>) {
    const param = context.parameters

    if (context.frameOnClip === 0) {
      this.bufCtx.drawImage(context.srcCanvas!, 0, 0)
    }

    const destCtx = context.destCanvas.getContext('2d')!
    destCtx.globalAlpha = clamp(param.opacity, 0, 100) / 100
    destCtx.clearRect(0, 0, context.width, context.height)
    destCtx.drawImage(this.canvas, 0, 0)
  }
}
