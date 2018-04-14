export default abstract class RendererBase {
    public rendererId: string
    public provideAssetAssignMap(): {[extName: string]: string}
    public provideParameters(): TypeDescriptor

    public async beforeRender(): Promise<void>
    public async render(): Promise<void>
}
