import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import PreRenderingRequest from '../PreRenderingRequest'
import RenderingRequest from '../RenderContext'

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
