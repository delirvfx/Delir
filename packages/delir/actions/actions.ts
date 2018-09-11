import { action } from '@ragg/fleur'

export const RendererActions = {
    addPlugins: action<{ plugins: any[] }>(),
    setPreviewCanvas: action<{ canvas: HTMLCanvasElement }>(),
}
