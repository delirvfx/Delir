import * as Delir from '@ragg/delir-core'
import { action } from '@ragg/fleur'
import { DragEntity } from './App'

export const AppActions = {
    setActiveProjectAction: action<{ project: Delir.Project.Project, path?: string }>(),
    clearActiveProjectAction: action<null>(),
    setDragEntityAction: action<DragEntity>(),
    clearDragEntityAction: action<{}>(),
    changeActiveCompositionAction: action<{ compositionId: string }>(),
    changeActiveClipAction: action<{ clipId: string }>(),
    startPreviewAction: action<{ compositionId: string, beginFrame: number }>(),
    stopPreviewAction: action<{}>(),
    renderDestinateAction: action<{ compositionId: string }>(),
    updateProcessingStateAction: action<{ stateText: string }>(),
    addMessageAction: action<{ id: string, title?: string, level: 'info' | 'error', message: string, detail?: string }>(),
    removeMessageAction: action<{ id: string }>(),
    seekPreviewFrameAction: action<{ frame: number }>(),
}

export const ProjectModActions = {
    createCompositionAction: action<{ composition: Delir.Project.Composition }>(),
    createLayerAction: action<{ targetCompositionId: string, layer: Delir.Project.Layer }>(),
    createClipAction: action<{ targetLayerId: string, newClip: Delir.Project.Clip }>(),
    addClipAction: action<{ targetLayer: Delir.Project.Layer, newClip: Delir.Project.Clip }>(),
    addLayerAction: action<{ targetComposition: Delir.Project.Composition, layer: Delir.Project.Layer }>(),
    addLayerWithAssetAction: action<{
        targetComposition: Delir.Project.Composition,
        clip: Delir.Project.Clip,
        asset: Delir.Project.Asset,
    }>(),
    addAssetAction: action<{ asset: Delir.Project.Asset }>(),
    addKeyframeAction: action<{ targetClip: Delir.Project.Clip, propName: string, keyframe: Delir.Project.Keyframe }>(),
    addEffectIntoClipAction: action<{ clipId: string, effect: Delir.Project.Effect }>(),
    addEffectKeyframeAction: action<{ targetClipId: string, targetEffectId: string, propName: string, keyframe: Delir.Project.Keyframe }>(),
    moveClipToLayerAction: action<{ destLayerId: string, clipId: string }>(),
    modifyCompositionAction: action<{ targetCompositionId: string, patch: Partial<Delir.Project.Composition> }>(),
    modifyLayerAction: action<{ targetLayerId: string, patch: Partial<Delir.Project.Layer> }>(),
    modifyClipAction: action<{ targetClipId: string, patch: Partial<Delir.Project.Clip> }>(),
    modifyClipExpressionAction: action<{ targetClipId: string, targetProperty: string, expr: { language: string, code: string } }>(),
    modifyEffectExpressionAction: action<{ targetClipId: string, targetEffectId: string, targetProperty: string, expr: { language: string, code: string } }>(),
    modifyKeyframeAction: action<{ targetKeyframeId: string, patch: Partial<Delir.Project.Keyframe> }>(),
    modifyEffectKeyframeAction: action<{ targetClipId: string, effectId: string, targetKeyframeId: string, patch: Partial<Delir.Project.Keyframe> }>(),
    moveLayerOrderAction: action<{ parentCompositionId: string, targetLayerId: string, newIndex: number }>(),
    removeCompositionAction: action<{ targetCompositionId: string }>(),
    removeLayerAction: action<{ targetLayerId: string }>(),
    removeClipAction: action<{ targetClipId: string }>(),
    removeAssetAction: action<{ targetAssetId: string }>(),
    removeKeyframeAction: action<{ targetKeyframeId: string }>(),
    removeEffectKeyframeAction: action<{ clipId: string, effectId: string, targetKeyframeId: string }>(),
    removeEffectFromClipAction: action<{ holderClipId: string, targetEffectId: string }>(),
}

export const RendererActions = {
    addPlugins: action<{ plugins: any[] }>(),
    setPreviewCanvas: action<{ canvas: HTMLCanvasElement }>(),
}
