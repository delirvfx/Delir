import { Asset } from '../../../Entity'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'
interface VideoRendererParam {
    source: Asset
    loop: boolean
    offsetTime: number
    x: number
    y: number
    scale: number
    rotate: number
    opacity: number
}
export default class VideoLayer implements IRenderer<VideoRendererParam> {
    public static readonly rendererId: string
    public static provideAssetAssignMap(): {
        mp4: string
    }
    public static provideParameters(): TypeDescriptor
    private _video
    public beforeRender(context: ClipPreRenderContext<VideoRendererParam>): Promise<void>
    public render(context: ClipRenderContext<VideoRendererParam>): Promise<void>
}
export {}
