const { PostEffectBase, Values, Type } = require("@ragg/delir-core");

module.exports.default = class MockPlugin {
    /**
     * Provide usable parameters
     */
    static provideParameters() {
        return Type
            .number('x', {label: 'Position X', defaultValue: 0, animatable: true})
            .number('y', {label: 'Position Y', defaultValue: 0, animatable: true})
            .number('width', {label: 'Width', defaultValue: 100, animatable: true})
            .number('height', {label: 'Height', defaultValue: 100, animatable: true})
            .colorRgba('color', {label: 'Fill color', defaultValue: new Values.ColorRGBA(0, 0, 0, 1), animatable: true});
    }

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    async initialize(req)
    {

    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    async render(req)
    {
        const dest = req.destCanvas;
        const context = dest.getContext('2d');
        const params = req.parameters;

        context.fillStyle = params.color.toString();
        context.fillRect(params.x, params.y, params.width, params.height);
    }
}
