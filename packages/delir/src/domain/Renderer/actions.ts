import { action, actions } from '@fleur/fleur'
import { EncodingOption, RenderingProgress } from '@ragg/deream'

export const RendererActions = actions('Renderer', {
  registerPlugins: action<{ plugins: any[] }>(),
  unregisterPlugins: action<{ ids: string[] }>(),
  clearCache: action<{}>(),
  setPreviewCanvas: action<{ canvas: HTMLCanvasElement }>(),
  setAudioVolume: action<{ volume: number }>(),
  startPreview: action<{ compositionId: string; beginFrame: number; ignoreMissingEffect: boolean }>(),
  stopPreview: action<{}>(),
  setInRenderingStatus: action<{ isInRendering: boolean }>(),
  setRenderingProgress: action<{ progress: RenderingProgress | null }>(),
})
