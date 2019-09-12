import _ from 'lodash'

import { EffectRenderContext } from '..'
import { Clip, Keyframe, KeyframeValueTypes } from '../Entity'
import { UserCodeException } from '../Exceptions/UserCodeException'
import { ParameterValueTypes, TypeDescriptor } from '../PluginSupport/TypeDescriptor'
import { AssetPointer, ColorRGB, ColorRGBA, Expression } from '../Values'
import { convertRawValueToKfValues } from './convertRawValueToKfValues'
import { compileTypeScript } from './ExpressionSupport/ExpressionCompiler'
import * as ExpressionContext from './ExpressionSupport/ExpressionContext'
import ExpressionVM from './ExpressionSupport/ExpressionVM'
import * as KeyframeCalcurator from './KeyframeCalcurator'
import { ClipRenderContext } from './RenderContext/ClipRenderContext'
import { RenderContextBase } from './RenderContext/RenderContextBase'
import AssetProxy from './RuntimeValue/AssetProxy'
import { ShapeProxy } from './RuntimeValue/ShapeProxy'

export type RuntimeParameterValueTypes =
  | number
  | string
  | boolean
  | ColorRGB
  | ColorRGBA
  | AssetProxy
  | ShapeProxy
  | null

export interface RealParameterValues {
  [paramName: string]: RuntimeParameterValueTypes
}

export interface RawKeyframeTable {
  [paramName: string]: {
    [frame: number]: KeyframeValueTypes
  }
}

export interface RuntimeKeyframeLookupTable {
  [paramName: string]: {
    [frame: number]: RuntimeParameterValueTypes
  }
}

export class ParametersTable {
  public static build(
    context: RenderContextBase,
    clip: Clip,
    keyframes: { [paramName: string]: readonly Keyframe[] },
    expressions: {
      [paramName: string]: Expression
    },
    paramTypes: TypeDescriptor,
  ): ParametersTable {
    const table = new ParametersTable()
    const assetPramNames = paramTypes.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.paramName)

    // Calculate initial parameters
    const rawRendererInitParam = KeyframeCalcurator.calcKeyframesInRange(paramTypes, keyframes, clip.placedFrame, 0, 0)
    const initialParams = _.mapValues(
      convertRawValueToKfValues(context, paramTypes, rawRendererInitParam),
      frames => frames[0],
    )

    // Calculate look up table
    const rawKeyframeLUT = KeyframeCalcurator.calcKeyframesInRange(
      paramTypes,
      keyframes,
      clip.placedFrame,
      0,
      context.durationFrames,
    )
    const lookupTable: RuntimeKeyframeLookupTable = convertRawValueToKfValues(context, paramTypes, rawKeyframeLUT)

    // Compile Expression code
    const rendererExpressions = _(expressions)
      .mapValues((expr: Expression) => {
        const code = compileTypeScript(expr.code)
        return (exposes: ExpressionContext.ContextSource) => {
          return ExpressionVM.execute(code, ExpressionContext.buildContext(exposes), {
            filename: `${clip.id}.expression.ts`,
          })
        }
      })
      .pickBy(value => value !== null)
      .value()

    table.paramTypes = paramTypes
    table.initialParams = initialParams
    table.lookUpTable = lookupTable
    table.expressions = rendererExpressions

    return table
  }

  public initialParams: {
    [paramName: string]: RuntimeParameterValueTypes
  }
  public lookUpTable: RuntimeKeyframeLookupTable

  public expressions: {
    [paramName: string]: (exposes: ExpressionContext.ContextSource) => any
  }

  private paramTypes: TypeDescriptor

  public getParametersAt(frame: number) {
    return _.fromPairs(
      this.paramTypes.properties.map(desc => {
        return [desc.paramName, this.lookUpTable[desc.paramName][frame]]
      }),
    )
  }

  public getParameterWithExpressionAt(
    frame: number,
    exposes: {
      context: ClipRenderContext<any> | EffectRenderContext<any>
      clipParams: { [paramName: string]: ParameterValueTypes }
      referenceableEffectParams: ExpressionContext.ReferenceableEffectsParams
    },
  ) {
    const params = this.getParametersAt(frame)

    return _.mapValues(params, (value, paramName) => {
      if (!this.expressions[paramName]) return value

      try {
        const result = this.expressions[paramName]({
          context: exposes.context,
          clipParams: exposes.clipParams,
          clipEffectParams: exposes.referenceableEffectParams,
          currentValue: value,
        })

        return result === undefined ? value : result
      } catch (e) {
        throw new UserCodeException(`Expression failed (${e.message})`, {
          sourceError: e,
          location: {
            type: 'clip' in exposes.context ? 'clip' : 'effect',
            entityId: 'clip' in exposes.context ? exposes.context.clip.id : exposes.context.effect.id,
            paramName,
          },
        })
      }
    })
  }
}
