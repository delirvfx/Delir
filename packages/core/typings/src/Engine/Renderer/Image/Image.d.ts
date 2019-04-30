import { Asset } from '../../../Entity'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'
interface ImageRendererParams {
    source: Asset
    x: number
    y: number
    scale: number
    rotate: number
    opacity: number
}
export default class ImageLayer implements IRenderer<ImageRendererParams> {
    public static readonly rendererId: string
    public static provideAssetAssignMap(): {
        jpeg: string
        jpg: string
        png: string
        gif: string
        svg: string
    }
    public static provideParameters(): import('../../../PluginSupport/type-descriptor').TypeDescriptor
    private _image
    public beforeRender(context: ClipPreRenderContext<ImageRendererParams>): Promise<void>
    public render(context: ClipRenderContext<ImageRendererParams>): Promise<void>
}
export {}
