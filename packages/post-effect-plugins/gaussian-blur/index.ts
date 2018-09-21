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
        varying vec2 vTexCoord;

        void main(void){
            // gl_FragColor = vec4(destColor, 1.0);
            gl_FragColor = texture2D(source, vTexCoord);
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
