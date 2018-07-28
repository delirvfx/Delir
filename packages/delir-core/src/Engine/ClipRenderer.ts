import ClipScopeFrameContext from './FrameContext/ClipScopeFrameContext'

export interface ClipRendererStatic {
    rendererId: string

    new(): ClipRenderer<any>
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor
}

export interface ClipRenderer<T> {
    beforeRender(request: ClipScopeFrameContext<T>): Promise<void>
    render(request: ClipScopeFrameContext<T>): Promise<void>
}
