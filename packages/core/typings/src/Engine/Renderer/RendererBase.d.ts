import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { ClipPreRenderContext } from '../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'
export interface IRendererStatic {
    rendererId: string
    new (): IRenderer<any>
    provideAssetAssignMap(): {
        [extName: string]: string
    }
    provideParameters(): TypeDescriptor
}
export interface IRenderer<T> {
    beforeRender(request: ClipPreRenderContext<T>): Promise<void>
    render(request: ClipRenderContext<T>): Promise<void>
}
