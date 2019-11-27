attribute vec2 position;
attribute vec2 coord;
varying vec2 texCoord;

void main(void) {
    gl_Position = vec4(position, 0.0, 1.0);
    texCoord = coord;
}
