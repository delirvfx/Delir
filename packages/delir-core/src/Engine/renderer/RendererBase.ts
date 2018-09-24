import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'
import { EffectPreRenderContext } from '../RenderContext/EffectPreRenderContext'
import { EffectRenderContext } from '../RenderContext/EffectRenderContext'

export interface IRendererStatic {
    rendererId: string

    new(): IRenderer<any>
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor
}

export interface IRenderer<T> {
    beforeRender(request: ClipRenderContext<T> | EffectPreRenderContext<T>): Promise<void>
    render(request: ClipRenderContext<T> | EffectRenderContext<T>): Promise<void>
}
