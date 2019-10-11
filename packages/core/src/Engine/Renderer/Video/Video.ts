import _ from 'lodash'

import Type from '../../../PluginSupport/TypeDescriptor'
import { TypeDescriptor } from '../../../PluginSupport/TypeDescriptor'
import { IRenderer } from '../RendererBase'

import { ParamType } from '../../ParamType'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'

interface VideoRendererParam {
  source: ParamType.Asset
  offsetTime: ParamType.Number
  loop: ParamType.Bool
  x: ParamType.Number
  y: ParamType.Number
  scale: ParamType.Float
  rotate: ParamType.Float
  opacity: ParamType.Float
}

export default class VideoLayer implements IRenderer<VideoRendererParam> {
  public static get rendererId(): string {
    return 'video'
  }

  public static provideAssetAssignMap() {
    return {
      mp4: 'source',
    }
  }

  public static provideParameters(): TypeDescriptor {
    return Type.asset('source', {
      label: 'Movie file',
      extensions: ['mp4'],
    })
      .number('offsetTime', {
        label: 'Start time',
        animatable: false,
        defaultValue: 0,
      })
      .bool('loop', {
        label: 'Loop',
        animatable: false,
      })
      .number('x', {
        label: 'Position X',
        animatable: true,
      })
      .number('y', {
        label: 'Position Y',
        animatable: true,
      })
      .float('scale', {
        label: 'Scale',
        animatable: true,
        defaultValue: 100,
      })
      .float('rotate', {
        label: 'Rotation',
        animatable: true,
        defaultValue: 0,
      })
      .float('opacity', {
        label: 'Opacity',
        animatable: true,
        defaultValue: 100,
      })
  }

  private video: HTMLVideoElement | null

  public async beforeRender(context: ClipPreRenderContext<VideoRendererParam>) {
    const parameters = context.parameters as any

    if (context.parameters.source == null) {
      this.video = null
      return
    }

    const video = (this.video = document.createElement('video'))
    this.video.src = parameters.source.path
    this.video.loop = parameters.loop
    this.video.load()
    this.video.currentTime = -1

    await new Promise((resolve, reject) => {
      const onLoaded = () => {
        resolve()
        video.removeEventListener('error', onError, false)
      }

      const onError = () => {
        reject(new Error('video not found'))
        video.removeEventListener('loadeddata', onLoaded, false)
      }

      video.addEventListener('loadeddata', onLoaded, {
        once: true,
        capture: false,
      } as any)
      video.addEventListener('error', onError, {
        once: true,
        capture: false,
      } as any)
    })
  }

  public async render(context: ClipRenderContext<VideoRendererParam>) {
    if (!context.parameters.source) {
      return
    }

    const param = context.parameters
    const ctx = context.destCanvas.getContext('2d')!
    const video = this.video

    if (!video) return

    await new Promise(resolve => {
      const waiter = (e: Event) => resolve()
      video.addEventListener('seeked', waiter, { once: true } as any)
      setTimeout(waiter, 1000)

      const time = param.offsetTime + context.timeOnClip
      video.currentTime = param.loop ? time % video.duration : time
    })

    const rad = (param.rotate * Math.PI) / 180

    ctx.globalAlpha = _.clamp(param.opacity, 0, 100) / 100
    ctx.translate(param.x, param.y)
    ctx.translate(video.videoWidth / 2, video.videoHeight / 2)
    ctx.scale(param.scale / 100, param.scale / 100)
    ctx.rotate(rad)
    ctx.translate(-video.videoWidth / 2, -video.videoHeight / 2)

    ctx.drawImage(video, 0, 0)
  }
}
