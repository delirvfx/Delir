precision mediump float;

uniform sampler2D source;
varying vec2 vTexCoord;

uniform vec3 keyColor;
uniform float threshold;

void main(void) {
    vec4 color = texture2D(source, vTexCoord);
    float diff = length(keyColor - color.rgb);

    if (diff < threshold) {
        discard;
    } else {
        gl_FragColor = color;
    }
}
