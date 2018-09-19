import * as _ from 'lodash'
import Type from '../../../PluginSupport/type-descriptor'
import PreRenderContext from '../../PreRenderContext'
import RenderingRequest from '../../RenderContext'
import { IRenderer } from '../RendererBase'

import { Asset } from '../../../Entity'

interface ImageRendererParams {
    source: Asset
    x: number
    y: number
    scale: number
    rotate: number
    opacity: number
}

export default class ImageLayer implements IRenderer<ImageRendererParams>
{
    public static get rendererId(): string { return 'image' }

    public static provideAssetAssignMap()
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
                defaultValue: 100,
            })
            .float('rotate', {
                label: 'Rotation',
                animatable: true,
                defaultValue: 0,
            })
            .float('opacity', {
                label: 'Opacity',
                animatable: true,
                defaultValue: 100,
            })
    }

    private _image: HTMLImageElement | null = null

    public async beforeRender(req: PreRenderContext<ImageRendererParams>)
    {
        const parameters = req.parameters

        if (!parameters.source) {
            this._image = null
            return
        }

        this._image = new Image()
        this._image.src = `file://${parameters.source.path}`

        await new Promise((resolve, reject) => {
            this._image!.addEventListener('load', () => resolve(), {once: true} as any)
            this._image!.addEventListener('error', () => reject(new Error(`ImageLayer: Image not found (URL: ${this._image!.src})`)), {once: true}  as any)
        })
    }

    public async render(req: RenderingRequest<ImageRendererParams>)
    {
        if (! this._image) return

        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')!
        const img = this._image
        const rad = param.rotate * Math.PI / 180

        ctx.globalAlpha = _.clamp(param.opacity, 0, 100) / 100
        ctx.translate(param.x, param.y)
        ctx.translate(img.width / 2, img.height / 2)
        ctx.scale(param.scale / 100, param.scale / 100)
        ctx.rotate(rad)
        ctx.translate(-img.width / 2, -img.height / 2)

        ctx.drawImage(img, 0, 0)
    }
}
