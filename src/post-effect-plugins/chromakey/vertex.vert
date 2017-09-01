// #ifdef GL_ES
// precision highp float;
// #endif

// attribute vec3 position;
// attribute vec2 texCoord;

// varying vec2 vTexCoord;
// varying vec4 vPosition;
// varying vec2 vSourceCoord;
// varying vec2 vAlphaCoord;

// uniform vec4 sourceArea;
// uniform vec4 alphaArea;

// void main(void) {
//     gl_Position = vec4(position, 1.0);
//     vTexCoord = vec2(texCoord.s, texCoord.t);
//     vSourceCoord = vec2(sourceArea.x + texCoord.s * sourceArea.z, sourceArea.y + texCoord.t * sourceArea.w);
//     vAlphaCoord = vec2(alphaArea.x + texCoord.s * alphaArea.z, alphaArea.y + texCoord.t * alphaArea.w);
// }



// attribute vec3 position;
// attribute vec2 coord;

// varying vec2 texCoord;

// void main(){
//     texCoord = coord;
//     gl_Position = vec4(position, 1.0);
// }



attribute vec2 position;
attribute vec2 coord;
varying vec2 texCoord;

void main(void) {
    gl_Position = vec4(position, 0.0, 1.0);
    texCoord = coord;
}
