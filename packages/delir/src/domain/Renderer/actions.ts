import { action, actions } from '@fleur/fleur'

export const RendererActions = actions('Renderer', {
  registerPlugins: action<{ plugins: any[] }>(),
  unregisterPlugins: action<{ ids: string[] }>(),
  clearCache: action<void>(),
  setPreviewCanvas: action<{ canvas: HTMLCanvasElement }>(),
  setAudioVolume: action<{ volume: number }>(),
  startPreview: action<{ compositionId: string; beginFrame: number; ignoreMissingEffect: boolean }>(),
  stopPreview: action<{}>(),
})
