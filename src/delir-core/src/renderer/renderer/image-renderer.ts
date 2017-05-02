import {IRenderer} from './renderer-base'
import Type from '../../plugin-support/type-descriptor'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'
import RenderingRequest from '../pipeline/render-request'

import Asset from '../../project/asset'

interface ImageRendererParams {
    source: Asset
    x: number
    y: number
    scale: number
    rotate: number
}

export default class ImageLayer implements IRenderer<ImageRendererParams>
{
    public static get rendererId(): string { return 'image' }

    public static provideHandlableFileTypes()
    {
        return {
            jpeg: 'source',
            jpg: 'source',
            png: 'source',
            gif: 'source',
            svg: 'source',
        }
    }

    public static provideParameters()
    {
        return Type
            .asset('source', {
                label: 'Image',
                extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg'],
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
            .float('scale', {
                label: 'Scale',
                animatable: true,
                defaultValue: 1,
            })
            .float('rotate', {
                label: 'Rotation',
                animatable: true,
                defaultValue: 0,
            })
    }

    private _image: HTMLImageElement

    public async beforeRender(req: RenderingRequest<ImageRendererParams>)
    {
        const parameters = req.parameters

        if (!parameters.source) {
            this._image = null
            return
        }

        this._image = new Image()
        this._image.src = `file://${parameters.source.path}`

        await new Promise((resolve, reject) => {
            this._image.addEventListener('load', () => resolve(), {once: true} as any)
            this._image.addEventListener('error', () => reject(new Error(`ImageLayer: Image not found (URL: ${this._image.src})`)), {once: true}  as any)
        })
    }

    public async render(req: RenderingRequest)
    {
        if (! this._image) return

        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')
        const img = this._image
        const rad = param.rotate * Math.PI / 180

        ctx.translate(param.x, param.y)
        ctx.scale(param.scale, param.scale)
        ctx.translate(img.width / 2, img.height / 2)
        ctx.rotate(rad)
        ctx.translate(-img.width / 2, -img.height / 2)

        ctx.drawImage(img, 0, 0)
    }
}
