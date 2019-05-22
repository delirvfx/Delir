import * as Delir from '@delirvfx/core'
import { action, actions } from '@fleur/fleur'

export const ProjectActions = actions('Project', {
    createComposition: action<{
        composition: Delir.Entity.Composition
    }>(),
    addClip: action<{
        targetLayerId: string
        newClip: Delir.Entity.Clip
    }>(),
    addLayer: action<{
        targetCompositionId: string
        layer: Delir.Entity.Layer
        index: number
    }>(),
    addLayerWithAsset: action<{
        targetCompositionId: string
        layer: Delir.Entity.Layer
        clip: Delir.Entity.Clip
        asset: Delir.Entity.Asset
    }>(),
    addAsset: action<{
        asset: Delir.Entity.Asset
    }>(),
    addKeyframe: action<{
        targetClipId: string
        paramName: string
        keyframe: Delir.Entity.Keyframe
    }>(),
    addEffectIntoClip: action<{
        clipId: string
        effect: Delir.Entity.Effect
        index?: number | null
    }>(),
    addEffectKeyframe: action<{
        targetClipId: string
        targetEffectId: string
        paramName: string
        keyframe: Delir.Entity.Keyframe
    }>(),
    moveClipToLayer: action<{
        destLayerId: string
        clipId: string
    }>(),
    modifyComposition: action<{
        targetCompositionId: string
        patch: Partial<Delir.Entity.Composition>
    }>(),
    modifyLayer: action<{
        targetLayerId: string
        patch: Partial<Delir.Entity.Layer>
    }>(),
    modifyClip: action<{
        targetClipId: string
        patch: Partial<Delir.Entity.Clip>
    }>(),
    modifyEffect: action<{
        parentClipId: string
        targetEffectId: string
        patch: Partial<Delir.Entity.Effect>
    }>(),
    modifyClipExpression: action<{
        targetClipId: string
        targetParamName: string
        expression: Delir.Values.Expression | null
    }>(),
    modifyEffectExpression: action<{
        targetClipId: string
        targetEffectId: string
        paramName: string
        expression: Delir.Values.Expression | null
    }>(),
    modifyKeyframe: action<{
        parentClipId: string
        targetKeyframeId: string
        patch: Partial<Delir.Entity.Keyframe>
    }>(),
    modifyEffectKeyframe: action<{
        targetClipId: string
        effectId: string
        targetKeyframeId: string
        patch: Partial<Delir.Entity.Keyframe>
    }>(),
    moveLayerOrder: action<{
        parentCompositionId: string
        targetLayerId: string
        newIndex: number
    }>(),
    moveEffectOrder: action<{
        parentClipId: string
        subjectEffectId: string
        newIndex: number
    }>(),
    removeComposition: action<{
        targetCompositionId: string
    }>(),
    removeLayer: action<{
        targetLayerId: string
    }>(),
    removeClip: action<{
        targetClipId: string
    }>(),
    removeAsset: action<{
        targetAssetId: string
    }>(),
    removeKeyframe: action<{
        parentClipId: string
        paramName: string
        targetKeyframeId: string
    }>(),
    removeEffectKeyframe: action<{
        clipId: string
        effectId: string
        paramName: string
        targetKeyframeId: string
    }>(),
    removeEffectFromClip: action<{
        holderClipId: string
        targetEffectId: string
    }>(),
})
