#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
varying vec4 vPosition;
varying vec2 vSourceCoord;
varying vec2 vAlphaCoord;

uniform sampler2D source;

vec4 sourcePixel;
vec4 alphaPixel;

const mat3 yuv = mat3(
    54.213, 182.376, 18.411,
    -54.213, -182.376, 236.589,
    200.787, -182.376, -18.411
);

vec4 preAlpha(int sourceChannel, int targetChannel, vec4 pixel) {
    float alpha;
    if (sourceChannel == 0) {
        alpha = alphaPixel.r;
    } else if (sourceChannel == 1) {
        alpha = alphaPixel.g;
    } else if (sourceChannel == 2) {
        alpha = alphaPixel.b;
    } else {
        alpha = 0.0;
    }

    vec4 outputPixel = vec4(pixel);
    if (targetChannel == 0) {
        outputPixel.r = min(outputPixel.r, alpha);
    } else if (targetChannel == 1) {
        outputPixel.g = min(outputPixel.g, alpha);
    } else if (targetChannel == 2) {
        outputPixel.b = min(outputPixel.b, alpha);
    }
    return outputPixel;
}

vec4 distAlpha(int targetChannel, vec3 target, float threshold, float fuzzy, vec4 pixel) {
    float distance2, sum, alpha;

    vec3 yuvColorDiff = sourcePixel.rgb * yuv - target;

    distance2 = dot(yuvColorDiff, yuvColorDiff);

    alpha = smoothstep(threshold, threshold * fuzzy, distance2);

    vec4 outputPixel = vec4(pixel);
    if (targetChannel == 0) {
        outputPixel.r *= alpha;
    } else if (targetChannel == 1) {
        outputPixel.g *= alpha;
    } else if (targetChannel == 2) {
        outputPixel.b *= alpha;
    }
    //outputPixel = vec4(abs(x1)/255.0, abs(y1)/255.0, abs(z1)/255.0, 1.0);
    //outputPixel = sourcePixel;
    //outputPixel = vec4(target/255.0, 1.0);
    //outputPixel = vec4(distance2/10000.0, distance2/10000.0, distance2/10000.0, 1.0);
    return outputPixel;
}

void main(void) {
#ifdef pre
        sourcePixel = texture2D(source, vSourceCoord);
#else
        sourcePixel = texture2D(source, vTexCoord);
#endif
    alphaPixel = texture2D(source, vAlphaCoord);
    vec4 pixel = vec4(1.0);
    %keys%
    pixel.a = min(pixel.r, min(pixel.g, pixel.b));
    gl_FragColor = pixel;
    //gl_FragColor = alphaPixel;
    //gl_FragColor = texture2D(source, vTexCoord);
    //gl_FragColor = vec4(vTexCoord.y, vTexCoord.y, vTexCoord.y, 1.0);
    //gl_FragColor = vec4(vAlphaCoord.y, vAlphaCoord.y, vAlphaCoord.y, 1.0);
    //gl_FragColor = vec4(vSourceCoord.y, vSourceCoord.y, vSourceCoord.y, 1.0);
}
