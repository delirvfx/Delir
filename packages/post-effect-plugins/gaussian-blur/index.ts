import {
    PostEffectBase,
    PreRenderContext,
    RenderContext,
    Type,
    Values
} from '@ragg/delir-core'

interface Params {
    amount: number
}

export default class GaussianBlurEffect extends PostEffectBase {
    /**
     * Provide usable parameters
     */
    public static provideParameters() {
        return Type
            .number('amount', {label: 'Amount', defaultValue: 0, animatable: true})
    }

    private static FRAG_SHADER_SOURCE = `
        precision mediump float;

        uniform sampler2D source;
        uniform float     weight[10];
        uniform bool      horizontal;
        // varying vec2      vTexCoord;

        void main(void){
            // float tFrag = 1.0 / 512.0;
            // vec2  fc;
            // vec3  destColor = vec3(0.0);

            // if(horizontal){
            //     fc = vec2(gl_FragCoord.s, 512.0 - gl_FragCoord.t);
            //     destColor += texture2D(source, (fc + vec2(-9.0, 0.0)) * tFrag).rgb * weight[9];
            //     destColor += texture2D(source, (fc + vec2(-8.0, 0.0)) * tFrag).rgb * weight[8];
            //     destColor += texture2D(source, (fc + vec2(-7.0, 0.0)) * tFrag).rgb * weight[7];
            //     destColor += texture2D(source, (fc + vec2(-6.0, 0.0)) * tFrag).rgb * weight[6];
            //     destColor += texture2D(source, (fc + vec2(-5.0, 0.0)) * tFrag).rgb * weight[5];
            //     destColor += texture2D(source, (fc + vec2(-4.0, 0.0)) * tFrag).rgb * weight[4];
            //     destColor += texture2D(source, (fc + vec2(-3.0, 0.0)) * tFrag).rgb * weight[3];
            //     destColor += texture2D(source, (fc + vec2(-2.0, 0.0)) * tFrag).rgb * weight[2];
            //     destColor += texture2D(source, (fc + vec2(-1.0, 0.0)) * tFrag).rgb * weight[1];
            //     destColor += texture2D(source, (fc + vec2( 0.0, 0.0)) * tFrag).rgb * weight[0];
            //     destColor += texture2D(source, (fc + vec2( 1.0, 0.0)) * tFrag).rgb * weight[1];
            //     destColor += texture2D(source, (fc + vec2( 2.0, 0.0)) * tFrag).rgb * weight[2];
            //     destColor += texture2D(source, (fc + vec2( 3.0, 0.0)) * tFrag).rgb * weight[3];
            //     destColor += texture2D(source, (fc + vec2( 4.0, 0.0)) * tFrag).rgb * weight[4];
            //     destColor += texture2D(source, (fc + vec2( 5.0, 0.0)) * tFrag).rgb * weight[5];
            //     destColor += texture2D(source, (fc + vec2( 6.0, 0.0)) * tFrag).rgb * weight[6];
            //     destColor += texture2D(source, (fc + vec2( 7.0, 0.0)) * tFrag).rgb * weight[7];
            //     destColor += texture2D(source, (fc + vec2( 8.0, 0.0)) * tFrag).rgb * weight[8];
            //     destColor += texture2D(source, (fc + vec2( 9.0, 0.0)) * tFrag).rgb * weight[9];
            // }else{
            //     fc = gl_FragCoord.st;
            //     destColor += texture2D(source, (fc + vec2(0.0, -9.0)) * tFrag).rgb * weight[9];
            //     destColor += texture2D(source, (fc + vec2(0.0, -8.0)) * tFrag).rgb * weight[8];
            //     destColor += texture2D(source, (fc + vec2(0.0, -7.0)) * tFrag).rgb * weight[7];
            //     destColor += texture2D(source, (fc + vec2(0.0, -6.0)) * tFrag).rgb * weight[6];
            //     destColor += texture2D(source, (fc + vec2(0.0, -5.0)) * tFrag).rgb * weight[5];
            //     destColor += texture2D(source, (fc + vec2(0.0, -4.0)) * tFrag).rgb * weight[4];
            //     destColor += texture2D(source, (fc + vec2(0.0, -3.0)) * tFrag).rgb * weight[3];
            //     destColor += texture2D(source, (fc + vec2(0.0, -2.0)) * tFrag).rgb * weight[2];
            //     destColor += texture2D(source, (fc + vec2(0.0, -1.0)) * tFrag).rgb * weight[1];
            //     destColor += texture2D(source, (fc + vec2(0.0,  0.0)) * tFrag).rgb * weight[0];
            //     destColor += texture2D(source, (fc + vec2(0.0,  1.0)) * tFrag).rgb * weight[1];
            //     destColor += texture2D(source, (fc + vec2(0.0,  2.0)) * tFrag).rgb * weight[2];
            //     destColor += texture2D(source, (fc + vec2(0.0,  3.0)) * tFrag).rgb * weight[3];
            //     destColor += texture2D(source, (fc + vec2(0.0,  4.0)) * tFrag).rgb * weight[4];
            //     destColor += texture2D(source, (fc + vec2(0.0,  5.0)) * tFrag).rgb * weight[5];
            //     destColor += texture2D(source, (fc + vec2(0.0,  6.0)) * tFrag).rgb * weight[6];
            //     destColor += texture2D(source, (fc + vec2(0.0,  7.0)) * tFrag).rgb * weight[7];
            //     destColor += texture2D(source, (fc + vec2(0.0,  8.0)) * tFrag).rgb * weight[8];
            //     destColor += texture2D(source, (fc + vec2(0.0,  9.0)) * tFrag).rgb * weight[9];
            // }

            // gl_FragColor = vec4(destColor, 1.0);
            gl_FragColor = vec4(0, 0, 0, 0);
        }
    `

    private program: WebGLProgram

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(context: PreRenderContext)
    {
        this.program = context.gl.getProgram(GaussianBlurEffect.FRAG_SHADER_SOURCE)
    }

    /**
     * Render frame into destination canvas.
     */
    public async render(context: RenderContext<Params>)
    {
        var weight = new Array(10)
        var t = 0.0
        var d = 100 / 100

        for (let i = 0; i < weight.length; i++) {
            var r = 1.0 + 2.0 * i
            var w = Math.exp(-0.5 * (r * r) / d)
            weight[i] = w
            if (i > 0) {w *= 2.0}
            t += w
        }

        for (let i = 0; i < weight.length; i++) {
            weight[i] /= t
        }

        context.gl.applyProgram(this.program, {
            weight: context.gl.uni1fv(weight),
            horizontal: context.gl.uni1iv([0]),
        }, context.srcCanvas!, context.destCanvas)
    }
}
