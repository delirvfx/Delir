import * as Processing from 'processing-js'
import Type from '../../../plugin-support/type-descriptor'
import { TypeDescriptor } from '../../../plugin-support/type-descriptor'
import PreRenderingRequest from '../../pipeline/pre-rendering-request'
import RenderingRequest from '../../pipeline/render-request'
import { IRenderer } from '../renderer-base'

import Asset from '../../../project/asset'

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
        return Type.text('source', {
            label: 'Source',
        })
    }

    private _image: HTMLImageElement | null = null

    public async beforeRender(req: PreRenderingRequest<ImageRendererParams>)
    {
    }

    public async render(req: RenderingRequest<ImageRendererParams>)
    {
    }
}
