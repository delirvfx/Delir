import {TypeDescriptor} from '../../plugin-support/type-descriptor'
import RenderingRequest from '../pipeline/render-request'

export interface IRendererStatic {
    rendererId: string
    provideHandlableFileTypes(): {[extName: string]: string}
    provideParameters(): TypeDescriptor

    new(): IRenderer<any>
}

export interface IRenderer<T> {
    beforeRender(request: RenderingRequest<T>): Promise<void>
    render(request: RenderingRequest<T>): Promise<void>
}
