import { TypeDescriptor } from '../../plugin-support/type-descriptor'
import PreRenderingRequest from '../PreRenderingRequest'
import RenderingRequest from '../RenderRequest'

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
