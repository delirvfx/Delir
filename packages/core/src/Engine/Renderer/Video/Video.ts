import _ from 'lodash'

import Type from '../../../PluginSupport/type-descriptor'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import { IRenderer } from '../RendererBase'

import { Asset } from '../../../Entity'
import { BBox2D } from '../../Inspector/BBox2D'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'

interface VideoRendererParam {
  source: Asset
  loop: boolean
  offsetTime: number
  x: number
  y: number
  scale: number
  rotate: number
  opacity: number
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

  public async getBBox(context: ClipPreRenderContext<VideoRendererParam>): Promise<BBox2D> {
    const { x, y, scale, rotate } = context.parameters

    if (!context.parameters.source) {
      return {
        visible: false,
        x,
        y,
        width: 0,
        height: 0,
        angleRad: 0,
      }
    }

    if (!this.video) this.video = await this.loadVideo(context.parameters.source.path)

    return {
      visible: false,
      x,
      y,
      width: this.video.videoWidth * (scale / 100),
      height: this.video.videoHeight * (scale / 100),
      angleRad: (rotate * Math.PI) / 180,
    }
  }

  public async beforeRender(context: ClipPreRenderContext<VideoRendererParam>) {
    const parameters = context.parameters

    if (context.parameters.source == null) {
      this.video = null
      return
    }

    this.video = await this.loadVideo(parameters.source.path)
    this.video.loop = parameters.loop
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

  private async loadVideo(url: string): Promise<HTMLVideoElement> {
    const video = document.createElement('video')
    video.src = url
    video.load()
    video.currentTime = -1

    await new Promise((resolve, reject) => {
      const onLoaded = () => {
        resolve()
        video.removeEventListener('error', onError, { capture: false })
      }

      const onError = () => {
        reject(new Error('VideoClip: video load error'))
        video.removeEventListener('loadeddata', onLoaded, { capture: false })
      }

      video.addEventListener('loadeddata', onLoaded, {
        once: true,
        capture: false,
      })

      video.addEventListener('error', onError, {
        once: true,
        capture: false,
      })
    })

    return video
  }
}
