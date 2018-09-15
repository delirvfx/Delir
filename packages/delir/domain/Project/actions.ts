import * as Delir from '@ragg/delir-core'
import { action } from '@ragg/fleur'

export const ProjectActions = {
    createCompositionAction: action<{ composition: Delir.Entity.Composition }>(),
    addClipAction: action<{ targetLayerId: string, newClip: Delir.Entity.Clip }>(),
    addLayerAction: action<{ targetCompositionId: string, layer: Delir.Entity.Layer }>(),
    addLayerWithAssetAction: action<{
        targetComposition: Delir.Entity.Composition,
        layer: Delir.Entity.Layer,
        clip: Delir.Entity.Clip,
        asset: Delir.Entity.Asset,
    }>(),
    addAssetAction: action<{ asset: Delir.Entity.Asset }>(),
    addKeyframeAction: action<{ targetClipId: string, paramName: string, keyframe: Delir.Entity.Keyframe }>(),
    addEffectIntoClipAction: action<{ clipId: string, effect: Delir.Entity.Effect }>(),
    addEffectKeyframeAction: action<{ targetClipId: string, targetEffectId: string, paramName: string, keyframe: Delir.Entity.Keyframe }>(),
    moveClipToLayerAction: action<{ destLayerId: string, clipId: string }>(),
    modifyCompositionAction: action<{ targetCompositionId: string, patch: Partial<Delir.Entity.Composition> }>(),
    modifyLayerAction: action<{ targetLayerId: string, patch: Partial<Delir.Entity.Layer> }>(),
    modifyClipAction: action<{ targetClipId: string, patch: Partial<Delir.Entity.Clip> }>(),
    modifyClipExpressionAction: action<{ targetClipId: string, targetProperty: string, expression: Delir.Values.Expression | null }>(),
    modifyEffectExpressionAction: action<{ targetClipId: string, targetEffectId: string, paramName: string, expression: Delir.Values.Expression | null }>(),
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
