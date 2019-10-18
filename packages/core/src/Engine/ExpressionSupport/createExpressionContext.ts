import { EffectPreRenderContext, EffectRenderContext } from '../..'
import { proxyDeepFreeze } from '../../helper/proxyFreeze'
import { ClipPreRenderContext } from '../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'
import { EffectProxy } from './EffectProxy'

export const createExpressionContext = (
  context: ClipPreRenderContext<any> | ClipRenderContext<any> | EffectPreRenderContext<any> | EffectRenderContext<any>,
) => {
  return {
    thisComp: {
      width: context.width,
      height: context.height,
      time: context.timeOnComposition,
      frame: context.frameOnComposition,
      duration: context.durationFrames / context.framerate,
      durationFrames: context.durationFrames,
      audioBuffer: (context as ClipRenderContext<any>).srcAudioBuffer,
    },
    thisClip: {
      time: (context as ClipRenderContext<any>).timeOnClip,
      frame: (context as ClipRenderContext<any>).frameOnClip,
      params: null,
      effect: (referenceName: string) => {
        const targetEffect = (context as ClipRenderContext<any>).clipEffectParams[referenceName]
        if (!targetEffect) throw new Error(`Referenced effect ${referenceName} not found`)
        return { params: proxyDeepFreeze(targetEffect) } as EffectProxy
      },
    },
  }
}
