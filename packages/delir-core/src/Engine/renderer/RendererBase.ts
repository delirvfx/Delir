import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import PreRenderContext from '../PreRenderContext'
import RenderingRequest from '../RenderContext'

export interface IRendererStatic {
    rendererId: string

    new(): IRenderer<any>
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor
}

export interface IRenderer<T> {
    beforeRender(request: PreRenderContext<T>): Promise<void>
    render(request: RenderingRequest<T>): Promise<void>
}
