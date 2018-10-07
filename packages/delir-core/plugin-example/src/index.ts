import {
    PostEffectBase,
    PreRenderContext,
    RenderContext,
    Type,
    Values
} from '@ragg/delir-core'

interface Params {
    x: number
    y: number
    width: number
    height: number
    color: Values.ColorRGBA
}

export default class ExamplePlugin extends PostEffectBase {
    /**
     * Provide usable parameters
     */
    public static provideParameters() {
        return Type
            .number('x', {label: 'Position X', defaultValue: 0, animatable: true})
            .number('y', {label: 'Position Y', defaultValue: 0, animatable: true})
            .number('width', {label: 'Width', defaultValue: 100, animatable: true})
            .number('height', {label: 'Height', defaultValue: 100, animatable: true})
            .colorRgba('color', {label: 'Fill color', defaultValue: new Values.ColorRGBA(0, 0, 0, 1), animatable: true})
    }

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(context: PreRenderContext)
    {

    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    public async render(context: RenderContext<Params>)
    {
        const dest = req.destCanvas
        const context = dest.getContext('2d')
        const params = req.parameters as Params

        context.fillStyle = params.color.toString()
        context.fillRect(params.x, params.y, params.width, params.height)
    }
}
