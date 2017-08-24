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
    MoveClipToLayerPayload,
    ModifyCompositionPayload,
    ModifyLayerPayload,
    ModifyClipPayload,
    ModifyClipExpression,
    ModifyKeyframePayload,
    RemoveCompositionayload,
    RemoveLayerPayload,
    RemoveClipPayload,
    RemoveAssetPayload,
    RemoveKeyframePayload,
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
    | MoveClipToLayerPayload
    | ModifyCompositionPayload
    | ModifyLayerPayload
    | ModifyClipPayload
    | ModifyClipExpression
    | ModifyKeyframePayload
    | RemoveCompositionayload
    | RemoveLayerPayload
    | RemoveClipPayload
    | RemoveAssetPayload
    | RemoveKeyframePayload
    | RemoveEffectFromClip

export type KnownPayload = EditorStateActionPayload | ProjectModifyActionPayload
