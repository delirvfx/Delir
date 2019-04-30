import Expression from '../../../Values/Expression'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'
interface Params {
    sketch: Expression
    opacity: number
}
export default class P5jsRenderer implements IRenderer<Params> {
    public static readonly rendererId: string
    public static provideAssetAssignMap(): {}
    public static provideParameters(): import('../../../PluginSupport/type-descriptor').TypeDescriptor
    private vmGlobal
    private vmExposedVariables
    private p5ex
    private canvas
    private makeVmExposeVariables
    public beforeRender(context: ClipPreRenderContext<Params>): Promise<void>
    public render(context: ClipRenderContext<Params>): Promise<void>
}
export {}
