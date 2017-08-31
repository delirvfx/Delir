#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
varying vec4 vPosition;
varying vec2 vSourceCoord;
varying vec2 vAlphaCoord;

uniform sampler2D source;
uniform sampler2D alpha;
uniform vec4 alphaChannel;

void main(void) {
    vec4 pixel;
    vec4 alphaPixel;
#ifdef pre
        pixel = texture2D(source, vSourceCoord);
#else
        pixel = texture2D(source, vTexCoord);
#endif
    alphaPixel = texture2D(alpha, vec2(vTexCoord.x, 1.0 - vTexCoord.y));
    pixel.a = dot(alphaPixel, alphaChannel);
    gl_FragColor = pixel;
    //gl_FragColor = alphaPixel;
    //gl_FragColor = vec4(alphaPixel.r, vTexCoord.y, vTexCoord.y, 1.0);
    //gl_FragColor = vec4(alphaPixel.r, vAlphaCoord.y, vAlphaCoord.y, 1.0);
}
