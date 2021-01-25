import { EffectPreRenderContext, EffectRenderContext, ParamType, PostEffectBase, Type, Values } from '@delirvfx/core'

interface Params {
  xRepeat: ParamType.Number
  yRepeat: ParamType.Number
  xOffset: ParamType.Float
  yOffset: ParamType.Float
}

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D source;
uniform vec2 resolution;
uniform vec2 repeats;
uniform vec2 offsets;
varying vec2 vTexCoord;

void main(void) {
  vec2 offset = vec2(1.0 / resolution.x * offsets.x, 1.0 / resolution.y * offsets.y);
  vec2 pos = vec2(vTexCoord.x * repeats.x + offset.x, vTexCoord.y * repeats.y + offset.y);
  vec4 color = texture2D(source, pos);
  gl_FragColor = color;
}
`

export default class Chromakey extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    // prettier-ignore
    return Type
      .float('xRepeat', { label: 'X repeat', defaultValue: () => 2, animatable: true })
      .float('yRepeat', { label: 'Y repeat', defaultValue: () => 2, animatable: true })
      .float('xOffset', { label: 'Offset X(px)', defaultValue: () => 0, animatable: true})
      .float('yOffset', { label: 'Offset Y(px)', defaultValue: () => 0, animatable: true})
  }

  private program: WebGLProgram

  public async initialize(context: EffectPreRenderContext<Params>) {
    this.program = context.gl.getProgram(FRAGMENT_SHADER)
  }

  public async render(context: EffectRenderContext<Params>) {
    const { gl, srcCanvas, destCanvas, parameters: params } = context

    gl.applyProgram(
      this.program,
      {
        resolution: gl.uni2fv([context.width, context.height]),
        repeats: gl.uni2fv([params.xRepeat, params.yRepeat]),
        offsets: gl.uni2fv([params.xOffset, params.yOffset]),
      },
      srcCanvas,
      destCanvas,
    )
  }
}
