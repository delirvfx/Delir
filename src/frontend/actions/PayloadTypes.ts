import {
    SetActiveProjectPayload,
    ClearActiveProjectPayload,
    SetDragEntityPayload,
    ClearDragEntityPayload,
    ChangeActiveCompositionPayload,
    ChangeActiveClipPayload,
    StartPreviewPayload,
    StopPreviewPayload,
    RenderDestinatePayload,
    UpdateProcessingState,
    AddMessagePayload,
    RemoveMessagePayload,
    SeekPreviewFramePayload,
} from './App'

import {
    CreateCompositionPayload,
    CreateLayerPayload,
    CreateClipPayload,
    AddClipPayload,
    AddLayerPayload,
    AddLayerWithAssetPayload,
    AddAssetPayload,
    AddKeyframePayload,
    AddEffectIntoClipPayload,
    AddEffectKeyframePayload,
    MoveClipToLayerPayload,
    ModifyCompositionPayload,
    ModifyLayerPayload,
    ModifyClipPayload,
    ModifyClipExpression,
    ModifyEffectExpression,
    ModifyKeyframePayload,
    ModifyEffectKeyframePayload,
    MoveLayerOrderPayload,
    RemoveCompositionayload,
    RemoveLayerPayload,
    RemoveClipPayload,
    RemoveAssetPayload,
    RemoveKeyframePayload,
    RemoveEffectKeyframePayload,
    RemoveEffectFromClip,
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
