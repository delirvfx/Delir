import * as Delir from '@ragg/delir-core'
import { action } from '@ragg/fleur'

export const ProjectActions = {
    createCompositionAction: action<{
        composition: Delir.Entity.Composition
    }>(),
    addClipAction: action<{
        targetLayerId: Delir.Entity.Layer.Id,
        newClip: Delir.Entity.Clip
    }>(),
    addLayerAction: action<{
        targetCompositionId: Delir.Entity.Composition.Id,
        layer: Delir.Entity.Layer
    }>(),
    addLayerWithAssetAction: action<{
        targetComposition: Delir.Entity.Composition,
        layer: Delir.Entity.Layer,
        clip: Delir.Entity.Clip,
        asset: Delir.Entity.Asset,
    }>(),
    addAssetAction: action<{
        asset: Delir.Entity.Asset
    }>(),
    addKeyframeAction: action<{
        targetClipId: Delir.Entity.Clip.Id,
        paramName: string,
        keyframe: Delir.Entity.Keyframe
    }>(),
    addEffectIntoClipAction: action<{
        clipId: Delir.Entity.Clip.Id,
        effect: Delir.Entity.Effect,
        index?: number | null
    }>(),
    addEffectKeyframeAction: action<{
        targetClipId: Delir.Entity.Clip.Id,
        targetEffectId: Delir.Entity.Effect.Id,
        paramName: string,
        keyframe: Delir.Entity.Keyframe
    }>(),
    moveClipToLayerAction: action<{
        destLayerId: Delir.Entity.Layer.Id,
        clipId: Delir.Entity.Clip.Id
    }>(),
    modifyCompositionAction: action<{
        targetCompositionId: Delir.Entity.Composition.Id,
        patch: Partial<Delir.Entity.Composition>
    }>(),
    modifyLayerAction: action<{
        targetLayerId: Delir.Entity.Layer.Id,
        patch: Partial<Delir.Entity.Layer>
    }>(),
    modifyClipAction: action<{
        targetClipId: Delir.Entity.Clip.Id,
        patch: Partial<Delir.Entity.Clip>
    }>(),
    modifyEffectAction: action<{
        parentClipId: Delir.Entity.Clip.Id,
        targetEffectId:  Delir.Entity.Effect.Id,
        patch: Partial<Delir.Entity.Effect>
    }>(),
    modifyClipExpressionAction: action<{
        targetClipId: Delir.Entity.Clip.Id,
        targetParamName: string,
        expression: Delir.Values.Expression | null
    }>(),
    modifyEffectExpressionAction: action<{
        targetClipId: Delir.Entity.Clip.Id,
        targetEffectId:  Delir.Entity.Effect.Id,
        paramName: string,
        expression: Delir.Values.Expression | null
    }>(),
    modifyKeyframeAction: action<{
        parentClipId: Delir.Entity.Clip.Id,
        targetKeyframeId: Delir.Entity.Keyframe.Id,
        patch: Partial<Delir.Entity.Keyframe>
    }>(),
    modifyEffectKeyframeAction: action<{
        targetClipId: Delir.Entity.Clip.Id,
        effectId: Delir.Entity.Effect.Id,
        targetKeyframeId: Delir.Entity.Keyframe.Id,
        patch: Partial<Delir.Entity.Keyframe>
    }>(),
    moveLayerOrderAction: action<{
        parentCompositionId: Delir.Entity.Composition.Id,
        targetLayerId: Delir.Entity.Layer.Id,
        newIndex: number
    }>(),
    removeCompositionAction: action<{
        targetCompositionId: Delir.Entity.Composition.Id
    }>(),
    removeLayerAction: action<{
        targetLayerId: Delir.Entity.Layer.Id
    }>(),
    removeClipAction: action<{
        targetClipId: Delir.Entity.Clip.Id
    }>(),
    removeAssetAction: action<{
        targetAssetId: Delir.Entity.Asset.Id
    }>(),
    removeKeyframeAction: action<{
        parentClipId: Delir.Entity.Clip.Id,
        paramName: string,
        targetKeyframeId: Delir.Entity.Keyframe.Id
    }>(),
    removeEffectKeyframeAction: action<{
        clipId: Delir.Entity.Clip.Id,
        effectId: Delir.Entity.Effect.Id,
        paramName: string,
        targetKeyframeId: Delir.Entity.Keyframe.Id,
    }>(),
    removeEffectFromClipAction: action<{
        holderClipId: Delir.Entity.Clip.Id,
        targetEffectId:  Delir.Entity.Effect.Id,
    }>(),
}
