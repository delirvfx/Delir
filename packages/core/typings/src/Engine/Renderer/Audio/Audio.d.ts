import { Asset } from '../../../Entity'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'
interface AudioRendererParam {
    source: Asset
    volume: number
    startTime: number
}
export default class AudioRenderer implements IRenderer<AudioRendererParam> {
    public static readonly rendererId: string
    public static provideAssetAssignMap(): {
        wav: string
        webm: string
        mpeg: string
        mp3: string
        ogg: string
    }
    public static provideParameters(): TypeDescriptor
    private _audio
    public beforeRender(context: ClipPreRenderContext<AudioRendererParam>): Promise<void>
    public render(context: ClipRenderContext<AudioRendererParam>): Promise<void>
    public renderAudio(context: ClipRenderContext<AudioRendererParam>): Promise<void>
}
export {}
