import { action, actions } from '@ragg/fleur'

export const RendererActions = actions('Renderer', {
    addPlugins: action<{ plugins: any[] }>(),
    setPreviewCanvas: action<{ canvas: HTMLCanvasElement }>(),
    startPreview: action<{ compositionId: string; beginFrame: number; ignoreMissingEffect: boolean }>(),
    stopPreview: action<{}>(),
})
