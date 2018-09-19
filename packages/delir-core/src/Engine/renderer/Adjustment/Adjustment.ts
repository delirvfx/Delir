import * as _ from 'lodash'

import Type from '../../../PluginSupport/type-descriptor'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import PreRenderingRequest from '../../PreRenderingRequest'
import RenderingRequest from '../../RenderContext'
import { IRenderer } from '../RendererBase'

interface Param {
    opacity: number
}

export default class AdjustmentRenderer implements IRenderer<Param>
{
    public static get rendererId(): string { return 'adjustment' }

    public static provideAssetAssignMap()
    {
        return {}
    }

    public static provideParameters(): TypeDescriptor
    {
        return Type
            .number('opacity', { label: 'Opacity', defaultValue: 100, animatable: true })
    }

    public async beforeRender(req: PreRenderingRequest<Param>) { return }

    public async render(req: RenderingRequest<Param>)
    {
        const ctx = req.destCanvas.getContext('2d')!
        ctx.globalAlpha = _.clamp(req.parameters.opacity, 0, 100) / 100
        ctx.drawImage(req.srcCanvas!, 0, 0)
    }
}
