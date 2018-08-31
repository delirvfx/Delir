import Type from '../../../plugin-support/type-descriptor'
import { TypeDescriptor } from '../../../plugin-support/type-descriptor'
import PreRenderingRequest from '../../PreRenderingRequest'
import RenderingRequest from '../../RenderRequest'
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
        req.destCanvas.getContext('2d')!.drawImage(req.srcCanvas!, 0, 0)
    }
}
