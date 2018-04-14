import ClipScopeFrameContext from './FrameContext/ClipScopeFrameContext'

export interface IClipRendererStatic {
    rendererId: string
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor

    new(): IClipRenderer<any>
}

export interface IClipRenderer<T> {
    beforeRender(request: ClipScopeFrameContext<T>): Promise<void>
    render(request: ClipScopeFrameContext<T>): Promise<void>
}
