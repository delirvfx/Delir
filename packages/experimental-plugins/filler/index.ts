import { PostEffectBase, PreRenderRequest, RenderRequest, Type, TypeDescriptor } from '@delirvfx/core'

export default class Filler extends PostEffectBase {
  public static provideParameters(): TypeDescriptor {
    return Type.colorRgba('color', {
      label: 'Color',
    })
  }

  public async initialize(req: PreRenderRequest) {
    // const canvas = document.createElement('canvas')
    // canvas.width = req.width
    // canvas.height = req.height
  }

  public async render(req: RenderRequest) {
    const param = req.parameters as any
    const canvas = req.destCanvas
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = param.color.toString()
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}
