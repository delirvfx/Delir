import * as _ from 'lodash'

import { EffectRenderContext } from '..'
import { Clip, Keyframe } from '../Entity'
import { ParameterValueTypes, TypeDescriptor } from '../PluginSupport/type-descriptor'
import { AssetPointer, ColorRGB, ColorRGBA, Expression } from '../Values'
import AssetProxy from './AssetProxy'
import { compileTypeScript } from './ExpressionSupport/ExpressionCompiler'
import * as ExpressionContext from './ExpressionSupport/ExpressionContext'
import ExpressionVM from './ExpressionSupport/ExpressionVM'
import * as KeyframeCalcurator from './KeyframeCalcurator'
import { ClipRenderContext } from './RenderContext/ClipRenderContext'
import { RenderContextBase } from './RenderContext/RenderContextBase'

export type RealParameterValueTypes = number | string | boolean | ColorRGB | ColorRGBA | AssetProxy | null

export interface RealParameterValues {
    [paramName: string]: RealParameterValueTypes
}

export class ParametersTable {
    public static build(
        context: RenderContextBase,
        clip: Clip,
        keyframes: {
            [paramName: string]: ReadonlyArray<Keyframe>
        },
        expressions: {
            [paramName: string]: Expression,
        },
        paramTypes: TypeDescriptor,
    ): ParametersTable {
        const table = new ParametersTable()
        const assetPramNames = paramTypes.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.paramName)

        // Calculate initial parameters
        const rawRendererInitParam = KeyframeCalcurator.calcKeyframeValuesAt(0, clip.placedFrame, paramTypes, keyframes)
        const initialParams: RealParameterValues = { ...(rawRendererInitParam as any) }
        assetPramNames.forEach(propName => {
            // resolve asset
            initialParams[propName] = rawRendererInitParam[propName]
                ? context.resolver.resolveAsset((rawRendererInitParam[propName] as AssetPointer).assetId)
                : null
        })

        // Calculate look up table
        const rawKeyframeLUT = KeyframeCalcurator.calcKeyFrames(paramTypes, keyframes, clip.placedFrame, 0, context.durationFrames)
        const lookupTable: { [paramName: string]: { [frame: number]: RealParameterValueTypes } } = { ...(rawKeyframeLUT as any)　}
        assetPramNames.forEach(paramName => {
            // resolve asset
            lookupTable[paramName] = _.map(rawKeyframeLUT[paramName], value => {
                return value ? context.resolver.resolveAsset((value as AssetPointer).assetId) : null
            })
        })

        // Compile Expression code
        const rendererExpressions = _(expressions).mapValues((expr: Expression) => {
            const code = compileTypeScript(expr.code)
            return (exposes: ExpressionContext.ContextSource) => {
                return ExpressionVM.execute(code, ExpressionContext.buildContext(exposes), {filename: `${clip.id}.expression.ts`})
            }
        }).pickBy(value => value !== null).value()

        table.paramTypes = paramTypes
        table.initialParams = initialParams
        table.lookUpTable = lookupTable
        table.expressions = rendererExpressions

        return table
    }

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

    private paramTypes: TypeDescriptor

    public getParametersAt(frame: number) {
        return _.fromPairs(this.paramTypes.properties.map(desc => {
            return [desc.paramName, this.lookUpTable[desc.paramName][frame]]
        }))
    }

    public getParameterWithExpressionAt(frame: number, exposes: {
        context: ClipRenderContext<any> | EffectRenderContext<any>,
        clipParams: {[paramName: string]: ParameterValueTypes},
        referenceableEffectParams: ExpressionContext.ReferenceableEffectsParams,
    }) {
        const params = this.getParametersAt(frame)

        return _.mapValues(params, (value, paramName) => {
            if (!this.expressions[paramName]) return value

            return this.expressions[paramName]({
                context: exposes.context,
                clipParams: exposes.clipParams,
                clipEffectParams: exposes.referenceableEffectParams,
                currentValue: params[paramName],
            })
        })
    }
}
