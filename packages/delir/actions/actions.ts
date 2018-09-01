import * as Delir from '@ragg/delir-core'
import { action } from '@ragg/fleur'

import { DragEntity } from './App'

export const AppActions = {
    setActiveProjectAction: action<{ project: Delir.Entity.Project, path?: string }>(),
    clearActiveProjectAction: action<null>(),
    setDragEntityAction: action<DragEntity>(),
    clearDragEntityAction: action<{}>(),
    changeActiveCompositionAction: action<{ compositionId: string }>(),
    changeActiveClipAction: action<{ clipId: string }>(),
    startPreviewAction: action<{ compositionId: string, beginFrame: number, ignoreMissingEffect: boolean }>(),
    stopPreviewAction: action<{}>(),
    renderDestinateAction: action<{ compositionId: string, ignoreMissingEffect: boolean }>(),
    updateProcessingStateAction: action<{ stateText: string }>(),
    addMessageAction: action<{ id: string, title?: string, level: 'info' | 'error', message: string, detail?: string }>(),
    removeMessageAction: action<{ id: string }>(),
    seekPreviewFrameAction: action<{ frame: number }>(),
    changePreferenceOpenStateAction: action<{ open: boolean }>()
}

export const ProjectModActions = {
    createCompositionAction: action<{ composition: Delir.Entity.Composition }>(),
    createLayerAction: action<{ targetCompositionId: string, layer: Delir.Entity.Layer }>(),
    createClipAction: action<{ targetLayerId: string, newClip: Delir.Entity.Clip }>(),
    addClipAction: action<{ targetLayer: Delir.Entity.Layer, newClip: Delir.Entity.Clip }>(),
    addLayerAction: action<{ targetComposition: Delir.Entity.Composition, layer: Delir.Entity.Layer }>(),
    addLayerWithAssetAction: action<{
        targetComposition: Delir.Entity.Composition,
        clip: Delir.Entity.Clip,
        asset: Delir.Entity.Asset,
    }>(),
    addAssetAction: action<{ asset: Delir.Entity.Asset }>(),
    addKeyframeAction: action<{ targetClip: Delir.Entity.Clip, paramName: string, keyframe: Delir.Entity.Keyframe }>(),
    addEffectIntoClipAction: action<{ clipId: string, effect: Delir.Entity.Effect }>(),
    addEffectKeyframeAction: action<{ targetClipId: string, targetEffectId: string, paramName: string, keyframe: Delir.Entity.Keyframe }>(),
    moveClipToLayerAction: action<{ destLayerId: string, clipId: string }>(),
    modifyCompositionAction: action<{ targetCompositionId: string, patch: Partial<Delir.Entity.Composition> }>(),
    modifyLayerAction: action<{ targetLayerId: string, patch: Partial<Delir.Entity.Layer> }>(),
    modifyClipAction: action<{ targetClipId: string, patch: Partial<Delir.Entity.Clip> }>(),
    modifyClipExpressionAction: action<{ targetClipId: string, targetProperty: string, expr: { language: string, code: string } }>(),
    modifyEffectExpressionAction: action<{ targetClipId: string, targetEffectId: string, targetProperty: string, expr: { language: string, code: string } }>(),
    modifyKeyframeAction: action<{ targetKeyframeId: string, patch: Partial<Delir.Entity.Keyframe> }>(),
    modifyEffectKeyframeAction: action<{ targetClipId: string, effectId: string, targetKeyframeId: string, patch: Partial<Delir.Entity.Keyframe> }>(),
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
