import * as clamp from 'lodash/clamp'
import {IRenderer} from '../renderer-base'
import Type from '../../../plugin-support/type-descriptor'
import {TypeDescriptor} from '../../../plugin-support/type-descriptor'
import PreRenderingRequest from '../../pipeline/pre-rendering-request'
import RenderingRequest from '../../pipeline/render-request'

import Asset from '../../../project/asset'

interface Param {
    opacity: number
}

export default class AdjustmentRenderer implements IRenderer<Param>
{
    public static get rendererId(): string { return 'adjustment' }

    public static provideAssetAssignMap()
    {
        return {
            mp4: 'source',
        }
    }

    public static provideParameters(): TypeDescriptor
    {
        return Type
            .number('opacity', { label: 'Opacity', defaultValue: 100, animatable: true })
    }

    private bufferCanvas: HTMLCanvasElement
    private bufferCtx: CanvasRenderingContext2D

    public async beforeRender(req: PreRenderingRequest<Param>)
    {
        this.bufferCanvas = document.createElement('canvas')
        this.bufferCtx = this.bufferCanvas.getContext('2d')
    }

    public async render(req: RenderingRequest<Param>)
    {
        const param = req.parameters

        const canvas = this.bufferCanvas
        canvas.width = req.width
        canvas.height = req.height

        this.bufferCtx.globalAlpha = clamp(param.opacity, 0, 100) / 100
        this.bufferCtx.drawImage(req.destCanvas, 0, 0)
    }
}
