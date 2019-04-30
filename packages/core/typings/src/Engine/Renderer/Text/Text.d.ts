import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import ColorRGBA from '../../../Values/ColorRGBA'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'
interface TextRendererParam {
    text: string
    family: string
    weight: string
    size: number
    lineHeight: number
    color: ColorRGBA
    x: number
    y: number
    rotate: number
    opacity: number
}
export default class TextLayer implements IRenderer<TextRendererParam> {
    public static readonly rendererId: string
    public static provideParameters: () => TypeDescriptor
    public static provideAssetAssignMap(): {}
    private _bufferCanvas
    public beforeRender(context: ClipPreRenderContext<TextRendererParam>): Promise<void>
    public render(context: ClipRenderContext<TextRendererParam>): Promise<void>
}
export {}
