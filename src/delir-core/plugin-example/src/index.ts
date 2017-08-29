import {
    LayerPluginBase,
    Type,
    PluginPreRenderRequest,
    RenderRequest,
    ColorRGBA
} from 'delir-core';

interface Paramaters {
    x: number
    y: number
    width: number
    height: number
    color: ColorRGBA
}

export default class ExamplePlugin extends LayerPluginBase {
    /**
     * Called only once when the plugin is loaded
     */
    static pluginDidLoad() {
    }

    /**
     * Provide usable parameters
     */
    static provideParameters() {
        return Type
            .number('x', {label: 'Position X', defaultValue: 0, animatable: true})
            .number('y', {label: 'Position Y', defaultValue: 0, animatable: true})
            .number('width', {label: 'Width', defaultValue: 100, animatable: true})
            .number('height', {label: 'Height', defaultValue: 100, animatable: true})
            .colorRgba('color', {label: 'Fill color', defaultValue: new ColorRGBA(0, 0, 0, 1), animatable: true});
    }

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio)
     * Do it in this method.
     */
    async beforeRender(req: PreRenderingRequest)
    {

    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    async render(req: RenderRequest)
    {
        const dest = req.destCanvas;
        const context = dest.getContext('2d');
        const params = req.parameters as Paramaters;

        context.fillStyle = params.color.toString()
        context.fillRect(params.x, params.y, params.width, params.height)
    }
}
