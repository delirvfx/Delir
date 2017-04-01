import {
    Type,
    TypeDescriptor,
    LayerPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
    Exceptions,
    Project
} from 'delir-core'

interface ImageLayerParam {
    source: Project.Asset
    x: number
    y: number
    scale: number
    rotate: number
}

export default class ImageLayer extends LayerPluginBase
{
    static async pluginDidLoad()
    {
    }

    static provideParameters(): TypeDescriptor
    {
        return Type
            .asset('source', {
                label: 'Image',
                mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
            })
            .number('x', {
                label: 'Position X',
                animatable: true,
                defaultValue: 0,
            })
            .number('y', {
                label: 'Position Y',
                animatable: true,
                defaultValue: 0,
            })
            .number('scale', {
                label: 'Scale',
                animatable: true,
                defaultValue: 1,
            })
            .number('rotate', {
                label: 'Rotation',
                animatable: true,
                defaultValue: 0,
            })
    }

    image: HTMLImageElement

    async beforeRender(preRenderRequest: PluginPreRenderRequest)
    {
        const parameters = preRenderRequest.parameters as ImageLayerParam

        if (!parameters.source) {
            this.image = null
            return
        }

        this.image = new Image()
        this.image.src = `file://${parameters.source.path}`

        await new Promise((resolve, reject) => {
            this.image.addEventListener('load', () => resolve(), {once: true} as any)
            this.image.addEventListener('error', () => reject(new Error('Image not found')), {once: true}  as any)
        })
    }

    async render(req: RenderRequest<ImageLayerParam>)
    {
        if (! this.image) return

        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')
        const img = this.image
        const rad = param.rotate * Math.PI / 180

        ctx.scale(param.scale, param.scale)
        ctx.translate(img.width / 2, img.height / 2)
        ctx.rotate(rad)
        ctx.translate(-img.width / 2, -img.height / 2)

        ctx.drawImage(img, param.x, param.y)
    }
}
