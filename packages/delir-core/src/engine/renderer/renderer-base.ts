import { TypeDescriptor } from '../../plugin-support/type-descriptor'
import PreRenderingRequest from '../pipeline/pre-rendering-request'
import RenderingRequest from '../pipeline/render-request'

export interface IRendererStatic {
    rendererId: string

    new(): IRenderer<any>
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor
}

export interface IRenderer<T> {
    beforeRender(request: PreRenderingRequest<T>): Promise<void>
    render(request: RenderingRequest<T>): Promise<void>
}
