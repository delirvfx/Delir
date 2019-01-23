import { action, actions } from '@ragg/fleur'

export const RendererActions = actions('Renderer', {
    addPlugins: action<{ plugins: any[] }>(),
    setPreviewCanvas: action<{ canvas: HTMLCanvasElement }>(),
    setAudioVolume: action<{ volume: number }>(),
})
