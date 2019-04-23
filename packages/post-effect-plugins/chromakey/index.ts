import { EffectPreRenderContext, EffectRenderContext, PostEffectBase, Type, Values } from '@ragg/delir-core'

// prettier-ignore
const clamp = (num: number, min: number, max: number) =>
    num > max ? max :
    num < min ? min :
    num

interface Params {
    threshold: number
    keyColor: Values.ColorRGBA
}

export default class Chromakey extends PostEffectBase {
    /**
     * Provide usable parameters
     */
    public static provideParameters() {
        // prettier-ignore
        return Type
            .float('threshold', { label: 'Threshold', defaultValue: 1, animatable: true })
            .colorRgba('keyColor', { label: 'Key color', defaultValue: new Values.ColorRGBA(0, 0, 0, 1), animatable: true })
    }

    private static FRAGMENT_SHADER: string = require('./fragment.frag').default
    private program: WebGLProgram

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(req: EffectPreRenderContext<Params>) {
        this.program = req.gl.getProgram(Chromakey.FRAGMENT_SHADER)
    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    public async render(req: EffectRenderContext<Params>) {
        const {
            gl,
            srcCanvas,
            destCanvas,
            parameters: { threshold, keyColor },
        } = req

        gl.applyProgram(
            this.program,
            {
                threshold: gl.uni1f(clamp(threshold, 0, 100) / 100),
                keyColor: gl.uni3f(keyColor.r / 255, keyColor.g / 255, keyColor.b / 255),
            },
            srcCanvas,
            destCanvas,
        )
    }
}
