import RendererParam from './FrameContext/RendererParam'

export default abstract class RendererBase {
    public static provideAssetAssignMap(): {[extName: string]: string} {
        throw new Error('Renderer#provideAssetAssignMap must be implement')
    }
    public static provideParameters(): TypeDescriptor {
        throw new Error('Renderer#provideParameters must be implement')
    }

    public rendererId: string

    public abstract beforeRender(param: RendererParam<object>): Promise<void>
    public abstract render(param: RendererParam<object>): Promise<void>
}
