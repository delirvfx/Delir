import {
    AddMessagePayload,
    ChangeActiveClipPayload,
    ChangeActiveCompositionPayload,
    ClearActiveProjectPayload,
    ClearDragEntityPayload,
    RemoveMessagePayload,
    RenderDestinatePayload,
    SeekPreviewFramePayload,
    SetActiveProjectPayload,
    SetDragEntityPayload,
    StartPreviewPayload,
    StopPreviewPayload,
    UpdateProcessingState,
} from './App'

import {
    AddAssetPayload,
    AddClipPayload,
    AddEffectIntoClipPayload,
    AddEffectKeyframePayload,
    AddKeyframePayload,
    AddLayerPayload,
    AddLayerWithAssetPayload,
    CreateClipPayload,
    CreateCompositionPayload,
    CreateLayerPayload,
    ModifyClipExpression,
    ModifyClipPayload,
    ModifyCompositionPayload,
    ModifyEffectExpression,
    ModifyEffectKeyframePayload,
    ModifyKeyframePayload,
    ModifyLayerPayload,
    MoveClipToLayerPayload,
    MoveLayerOrderPayload,
    RemoveAssetPayload,
    RemoveClipPayload,
    RemoveCompositionayload,
    RemoveEffectFromClip,
    RemoveEffectKeyframePayload,
    RemoveKeyframePayload,
    RemoveLayerPayload,
} from './ProjectMod'

export type EditorStateActionPayload =
    | SetActiveProjectPayload
    | ClearActiveProjectPayload
    | SetDragEntityPayload
    | ClearDragEntityPayload
    | ChangeActiveCompositionPayload
    | ChangeActiveClipPayload
    | StartPreviewPayload
    | StopPreviewPayload
    | RenderDestinatePayload
    | UpdateProcessingState
    | AddMessagePayload
    | RemoveMessagePayload
    | SeekPreviewFramePayload

export type ProjectModifyActionPayload =
    | CreateCompositionPayload
    | CreateLayerPayload
    | CreateClipPayload
    | AddClipPayload
    | AddLayerPayload
    | AddLayerWithAssetPayload
    | AddAssetPayload
    | AddKeyframePayload
    | AddEffectIntoClipPayload
    | AddEffectKeyframePayload
    | MoveClipToLayerPayload
    | ModifyCompositionPayload
    | ModifyLayerPayload
    | ModifyClipPayload
    | ModifyClipExpression
    | ModifyEffectExpression
    | ModifyKeyframePayload
    | ModifyEffectKeyframePayload
    | MoveLayerOrderPayload
    | RemoveCompositionayload
    | RemoveLayerPayload
    | RemoveClipPayload
    | RemoveAssetPayload
    | RemoveKeyframePayload
    | RemoveEffectKeyframePayload
    | RemoveEffectFromClip

export type KnownPayload = EditorStateActionPayload | ProjectModifyActionPayload
