precision mediump float;
// uniform vec3 keyColor;
// uniform sampler2D texture0;
// varying vec2 texCoord;

// void main() {
//     vec4 color = texture2D(texture0, texCoord);
    // float enabled = float(color.rgb != keyColor.rgb && color.a != 0.0);
//     // gl_FragColor = vec4(color.rgb, color.a);
//     gl_FragColor = color;
// }

uniform sampler2D source;

uniform vec3 keyColor;
uniform float threshold;
varying vec2 texCoord;

void main(void) {
    vec4 color = texture2D(texture0, texCoord);
    float diff = length(keyColor - color.rgb);

    if (diff < threshold) {
        discard;
    } else {
        gl_FragColor = color;
    }
}
