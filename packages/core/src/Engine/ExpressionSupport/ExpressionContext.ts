import { proxyDeepFreeze } from '../../helper/proxyFreeze'
import { ParameterValueTypes } from '../../PluginSupport/TypeDescriptor'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'
import { EffectRenderContext } from '../RenderContext/EffectRenderContext'
import { ExpressionContext } from './ExpressionVM'

export interface ReferenceableEffectsParams {
  [referenceName: string]: {
    [paramName: string]: ParameterValueTypes
  }
}

export interface ContextSource {
  context: ClipRenderContext<any> | EffectRenderContext<any>
  clipParams: { [propName: string]: ParameterValueTypes }
  clipEffectParams: ReferenceableEffectsParams
  currentValue: any
}

export const buildContext = (contextSource: ContextSource): ExpressionContext => {
  const clipParamProxy = proxyDeepFreeze(contextSource.clipParams)

  return {
    currentValue: contextSource.currentValue,
    thisComp: {
      width: contextSource.context.width,
      height: contextSource.context.height,
      time: contextSource.context.timeOnComposition,
      frame: contextSource.context.frameOnComposition,
      duration: contextSource.context.durationFrames / contextSource.context.framerate,
      durationFrames: contextSource.context.durationFrames,
      audioBuffer: contextSource.context.destAudioBuffer,
    },
    thisClip: {
      time: contextSource.context.time,
      frame: contextSource.context.frame,
      params: clipParamProxy,
      effect: (referenceName: string) => {
        const targetEffect = contextSource.clipEffectParams[referenceName]
        if (!targetEffect) throw new Error(`Referenced effect ${referenceName} not found`)
        return { params: proxyDeepFreeze(targetEffect) }
      },
    },
  }
}

export const expressionContextTypeDefinition = `
interface CompositionAttributes {
    width: number
    height: number
    time: number
    frame: number
    duration: number
    durationFrames: number
    audioBuffer: Float32Array[] | null
}

interface ClipAttributes {
    time: number
    frame: number
    params: Readonly<{ [paramName: string]: any }>
    effect(referenceName: string): EffectAttributes
}

interface EffectAttributes {
    params: { [paramName: string]: any }
}

declare const thisComp: CompositionAttributes
declare const thisClip: ClipAttributes
declare const currentValue: any
`
