import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { IRenderer, IRendererStatic } from './RendererBase'
export declare type AvailableRenderer = 'audio' | 'image' | 'video' | 'text' | 'adjustment' | 'p5js'
export declare const RENDERERS: {
    [name: string]: IRendererStatic
}
interface PluginInfo {
    id: string
    handlableFileTypes: string[]
    assetAssignMap: {
        [extName: string]: string
    }
    parameter: TypeDescriptor
}
export declare function getAvailableRenderers(): PluginInfo[]
export declare function getInfo(renderer: AvailableRenderer): PluginInfo
export declare function create(renderer: AvailableRenderer): IRenderer<any>
export {}
