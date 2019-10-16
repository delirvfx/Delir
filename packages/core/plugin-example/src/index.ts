import { EffectPreRenderContext, EffectRenderContext, ParamType, PostEffectBase, Type, Values } from '@delirvfx/core'

interface Params {
  x: ParamType.Number
  y: ParamType.Number
  width: ParamType.Number
  height: ParamType.Number
  color: ParamType.ColorRGBA
}

export default class ExamplePlugin extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    return Type.number('x', {
      label: 'Position X',
      defaultValue: 0,
      animatable: true,
    })
      .number('y', {
        label: 'Position Y',
        defaultValue: 0,
        animatable: true,
      })
      .number('width', {
        label: 'Width',
        defaultValue: 100,
        animatable: true,
      })
      .number('height', {
        label: 'Height',
        defaultValue: 100,
        animatable: true,
      })
      .colorRgba('color', {
        label: 'Fill color',
        defaultValue: new Values.ColorRGBA(0, 0, 0, 1),
        animatable: true,
      })
  }

  /**
   * Called when before rendering start.
   *
   * If you want initializing before rendering (likes load audio, image, etc...)
   * Do it in this method.
   */
  public async initialize(context: EffectPreRenderContext<Params>) {}

  /**
   * Render frame into destination canvas.
   * @param req
   */
  public async render(context: EffectRenderContext<Params>) {
    const dest = context.destCanvas
    const ctx = dest.getContext('2d')
    const params = context.parameters as Params

    ctx.fillStyle = params.color.toString()
    ctx.fillRect(params.x, params.y, params.width, params.height)
  }
}
