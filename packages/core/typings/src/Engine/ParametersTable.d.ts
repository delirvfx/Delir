import * as _ from 'lodash'
import { EffectRenderContext } from '..'
import { Clip, Keyframe } from '../Entity'
import { ParameterValueTypes, TypeDescriptor } from '../PluginSupport/type-descriptor'
import { ColorRGB, ColorRGBA, Expression } from '../Values'
import AssetProxy from './AssetProxy'
import * as ExpressionContext from './ExpressionSupport/ExpressionContext'
import { ClipRenderContext } from './RenderContext/ClipRenderContext'
import { RenderContextBase } from './RenderContext/RenderContextBase'
export declare type RealParameterValueTypes = number | string | boolean | ColorRGB | ColorRGBA | AssetProxy | null
export interface RealParameterValues {
    [paramName: string]: RealParameterValueTypes
}
export declare class ParametersTable {
    public static build(
        context: RenderContextBase,
        clip: Clip,
        keyframes: {
            [paramName: string]: ReadonlyArray<Keyframe>
        },
        expressions: {
            [paramName: string]: Expression
        },
        paramTypes: TypeDescriptor,
    ): ParametersTable
    public initialParams: {
        [paramName: string]: RealParameterValueTypes
    }
    public lookUpTable: {
        [paramName: string]: {
            [frame: number]: RealParameterValueTypes
        }
    }
    public expressions: {
        [paramName: string]: (exposes: ExpressionContext.ContextSource) => any
    }
    private paramTypes
    public getParametersAt(frame: number): _.Dictionary<RealParameterValueTypes>
    public getParameterWithExpressionAt(
        frame: number,
        exposes: {
            context: ClipRenderContext<any> | EffectRenderContext<any>
            clipParams: {
                [paramName: string]: ParameterValueTypes
            }
            referenceableEffectParams: ExpressionContext.ReferenceableEffectsParams
        },
    ): _.Dictionary<any>
}
