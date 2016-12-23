import {
    Type,
    TypeDescriptor,
    LayerPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
} from 'delir-core'

export default class Plane extends LayerPluginBase
{
    static pluginDidLoad() {}

    static provideParameters(): TypeDescriptor
    {
        return Type
            .colorRgba('color', {
                label: 'Color',
            })
    }

    async beforeRender(req: PluginPreRenderRequest)
    {
        const canvas = document.createElement('canvas')
        canvas.width = req.width
        canvas.height = req.height
    }

    async render(req: RenderRequest)
    {
        const param = req.parameters as any
        const canvas = req.destCanvas
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = param.color.toString()
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
}
