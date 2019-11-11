import { EffectPreRenderContext, EffectRenderContext, ParamType, PostEffectBase, Type } from '@delirvfx/core'

interface Params {
  hueShift: ParamType.Float
  saturation: ParamType.Float
  lightness: ParamType.Float
}

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D source;
uniform float hue;
uniform float saturation;
uniform float lightness;

// THANKS: https://www.shadertoy.com/view/XljGzV
vec3 rgb2hsl( in vec3 c ){
  float h = 0.0;
	float s = 0.0;
	float l = 0.0;
	float r = c.r;
	float g = c.g;
	float b = c.b;
	float cMin = min( r, min( g, b ) );
	float cMax = max( r, max( g, b ) );

	l = ( cMax + cMin ) / 2.0;
	if ( cMax > cMin ) {
		float cDelta = cMax - cMin;

        //s = l < .05 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) ); Original
		s = l < .0 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) );

		if ( r == cMax ) {
			h = ( g - b ) / cDelta;
		} else if ( g == cMax ) {
			h = 2.0 + ( b - r ) / cDelta;
		} else {
			h = 4.0 + ( r - g ) / cDelta;
		}

		if ( h < 0.0) {
			h += 6.0;
		}
		h = h / 6.0;
	}
	return vec3( h, s, l );
}

// THANKS: https://www.shadertoy.com/view/XljGzV
vec3 hsl2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}


void main(void) {
    vec4 color = texture2D(source, vTexCoord);
    vec3 hsl = rgb2hsl(color.rgb)
    vec3 dest = hsl2rgb(vec3(hsl.x, hsl.y + saturation, hsl.z + lightness))
    gl_FragColor = vec4(dest.rgb, color.a)
}
`

export default class ColorCollectionPostEffect extends PostEffectBase {
  /**
   * Provide usable parameters
   */
  public static provideParameters() {
    return Type.float('hueShift', {
      label: 'Hue shift (angle)',
      defaultValue: () => 0,
    })
      .float('saturation', {
        label: 'Saturation (%)',
        defaultValue: () => 0,
      })
      .float('lightness', {
        label: 'Brightness (%)',
        defaultValue: () => 50,
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
    this.program = context.gl.getProgram(FRAGMENT_SHADER)
  }

  /**
   * Render frame into destination canvas.
   * @param context
   */
  public async render(context: EffectRenderContext<Params>) {
    const { gl, parameters, srcCanvas, destCanvas } = context

    gl.applyProgram(
      this.program,
      {
        hue: gl.uni1f(parameters.hueShift),
        saturation: gl.uni1f(Math.max(0, Math.min(parameters.saturation, 100) / 100)),
        lightness: gl.uni1f(Math.max(0, Math.min(parameters.lightness, 100) / 100)),
      },
      srcCanvas,
      destCanvas,
    )
  }
}
