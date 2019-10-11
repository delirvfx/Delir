import { EffectPreRenderContext, EffectRenderContext, PostEffectBase, Type, Values } from '@delirvfx/core'
import vm from 'vm'

import clamp from 'lodash/clamp'

interface Params {
  fragment: Values.Expression
  uniformFactory: Values.Expression
}

const TEMPLATE = `
precision mediump float;

uniform sampler2D source;
varying vec2 vTexCoord;

void main(void) {
  vec4 color = texture2D(source, vTexCoord);
  gl_FragColor = color;
}
`

const TEMPLATE_JS = {}

const VERT_SHADER = require('./vertex.vert').default

export default class TheWorldPostEffect extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    return Type.code('fragment', { label: 'fragment shader', langType: 'glsl', defaultValue: TEMPLATE }).code(
      'uniforms',
      { label: 'Uniforms', langType: 'javascript', defaultValue: TEMPLATE_JS },
    )
  }

  private program: WebGLProgram
  private uniformFactoryCode: string

  /**
   * Called when before rendering start.
   *
   * If you want initializing before rendering (likes load audio, image, etc...)
   * Do it in this method.
   */
  public async initialize(context: EffectPreRenderContext<Params>) {
    this.program = context.gl.getProgram(context.parameters.fragment.code, VERT_SHADER)
    this.uniformFactoryCode = `(function () { ${context.parameters.uniformFactory.code} })()`
  }

  /**
   * Render frame into destination canvas.
   * @param context
   */
  public async render(context: EffectRenderContext<Params>) {
    const { gl, srcCanvas, destCanvas } = context
    const uniforms = vm.runInNewContext(this.uniformFactoryCode, { gl, ...this.makeVmExposeVariables(context) })
    gl.applyProgram(this.program, uniforms, srcCanvas, destCanvas)
  }

  private makeVmExposeVariables(context: EffectRenderContext<Params>) {
    return {
      thisComp: {
        width: context.width,
        height: context.height,
        time: context.timeOnComposition,
        frame: context.frameOnComposition,
        duration: context.durationFrames / context.framerate,
        durationFrames: context.durationFrames,
        audioBuffer: context.srcAudioBuffer,
      },
      thisClip: {
        time: context.timeOnClip,
        frame: context.frameOnClip,
        params: null,
        effect: (referenceName: string) => {
          const targetEffect = (context as ClipRenderContext<Params>).clipEffectParams[referenceName]
          if (!targetEffect) throw new Error(`Referenced effect ${referenceName} not found`)
          return { params: proxyDeepFreeze(targetEffect) }
        },
      },
    }
  }
}
