import {
  EffectPreRenderContext,
  EffectRenderContext,
  Engine,
  Exceptions,
  ParamType,
  PostEffectBase,
  Type,
  Values,
} from '@delirvfx/core'
import vm from 'vm'

interface Params {
  fragment: ParamType.Code
  uniformFactory: ParamType.Code
}

const TEMPLATE = `precision mediump float;

uniform sampler2D source;
varying vec2 vTexCoord;

void main(void) {
  vec4 color = texture2D(source, vTexCoord);
  gl_FragColor = color;
}
`

const TEMPLATE_JS = `// Here is able to use Expression API
// SEE: http://delir.studio/docs/usage/expression.html
//
// And expect to return key-value pair of uniforms.
// SEE: http://delir.studio/docs/plugin/posteffect/webgl.html

// It returns as uniform key-value pair.
({
  // someUniform: gl.uni1v(255),
})
`

export default class WebGLPostEffect extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    return Type.code('uniformFactory', {
      label: 'Uniforms',
      langType: 'typescript',
      defaultValue: () => new Values.Expression('typescript', TEMPLATE_JS),
    }).code('fragment', {
      label: 'Fragment shader',
      langType: 'glsl',
      defaultValue: () => new Values.Expression('glsl', TEMPLATE),
    })
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
    this.program = context.gl.getProgram(context.parameters.fragment.code)
    this.uniformFactoryCode = Engine.ExpressionSupport.compileTypeScript(context.parameters.uniformFactory.code)
  }

  /**
   * Render frame into destination canvas.
   * @param context
   */
  public async render(context: EffectRenderContext<Params>) {
    const { gl, srcCanvas, destCanvas } = context

    let uniforms: any
    try {
      uniforms = vm.runInNewContext(this.uniformFactoryCode, {
        gl,
        ...Engine.ExpressionSupport.createExpressionContext(context),
      })

      gl.applyProgram(this.program, uniforms, srcCanvas, destCanvas)
    } catch (e) {
      throw new Exceptions.UserCodeException(`[posteffect-webgl] Shader error: ${e.message}`, {
        sourceError: e,
        location: {
          type: 'effect',
          paramName: 'Uniforms',
          entityId: context.effect.id,
        },
      })
    }
  }
}
