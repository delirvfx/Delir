import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import PreRenderContext from '../PreRenderContext'
import RenderContext from '../RenderContext'

export interface IRendererStatic {
    rendererId: string

    new(): IRenderer<any>
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor
}

export interface IRenderer<T> {
    beforeRender(request: PreRenderContext<T>): Promise<void>
    render(request: RenderContext<T>): Promise<void>
}
