import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'
interface Param {
    opacity: number
}
export default class AdjustmentRenderer implements IRenderer<Param> {
    public static readonly rendererId: string
    public static provideAssetAssignMap(): {}
    public static provideParameters(): TypeDescriptor
    public beforeRender(context: ClipPreRenderContext<Param>): Promise<void>
    public render(context: ClipRenderContext<Param>): Promise<void>
}
export {}
