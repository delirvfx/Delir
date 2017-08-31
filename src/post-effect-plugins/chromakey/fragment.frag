precision mediump float;
uniform vec3 keyColor;
uniform sampler2D texture0;
varying vec2 texCoord;

void main() {
    vec4 color = texture2D(texture0, texCoord);
    // float enabled = float(color.rgb != keyColor.rgb && color.a != 0.0);
    // gl_FragColor = vec4(color.rgb, color.a);
    gl_FragColor = color;
}
