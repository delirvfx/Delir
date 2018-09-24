import { ParameterValueTypes } from '../../PluginSupport/type-descriptor'
import { ColorRGB, ColorRGBA } from '../../Values'
import AssetProxy from '../AssetProxy'
import { RealParameterValues, RealParameterValueTypes } from '../Engine'
import { IRenderContextBase } from './IRenderContextBase'

export interface ClipPreRenderContext<T extends {[paramName: string]: any}> extends IRenderContextBase, ClipPreRenderContextAttributes<T> {}

export interface ClipPreRenderContextAttributes<T extends RealParameterValues> {
    parameters: T
}
