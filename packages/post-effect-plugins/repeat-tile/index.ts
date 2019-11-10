import { EffectPreRenderContext, EffectRenderContext, ParamType, PostEffectBase, Type, Values } from '@delirvfx/core'

interface Params {
  xRepeat: ParamType.Number
  yRepeat: ParamType.Number
}

export default class Chromakey extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    // prettier-ignore
    return Type
      .number('repeat', { label: 'repeat', defaultValue: () => 0, animatable: true })
  }

  private static FRAGMENT_SHADER: string = require('./fragment.frag').default
  private program: WebGLProgram

  /**
   * Called when before rendering start.
   *
   * If you want initializing before rendering (likes load audio, image, etc...)
   * Do it in this method.
   */
  public async initialize(req: EffectPreRenderContext<Params>) {
    this.program = req.gl.getProgram(Chromakey.FRAGMENT_SHADER)
  }

  /**
   * Render frame into destination canvas.
   * @param req
   */
  public async render(req: EffectRenderContext<Params>) {
    const {
      gl,
      srcCanvas,
      destCanvas,
      parameters: { xRepeat, yRepeat },
    } = req
  }
}
