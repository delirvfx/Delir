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
} from './editor-state-actions'

import {
    CreateCompositionPayload,
    CreateLayerPayload,
    CreateClipPayload,
    AddClipPayload,
    AddLayerPayload,
    AddLayerWithAssetPayload,
    AddAssetPayload,
    AddKeyframePayload,
    MoveClipToLayerPayload,
    ModifyCompositionPayload,
    ModifyLayerPayload,
    ModifyClipPayload,
    ModifyKeyframePayload,
    RemoveCompositionayload,
    RemoveLayerPayload,
    RemoveClipPayload,
    RemoveAssetPayload,
    RemoveKeyframePayload,
} from './project-modify-actions'

export type EditorStateActionPayload =
    SetActiveProjectPayload
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
    CreateCompositionPayload
    | CreateLayerPayload
    | CreateClipPayload
    | AddClipPayload
    | AddLayerPayload
    | AddLayerWithAssetPayload
    | AddAssetPayload
    | AddKeyframePayload
    | MoveClipToLayerPayload
    | ModifyCompositionPayload
    | ModifyLayerPayload
    | ModifyClipPayload
    | ModifyKeyframePayload
    | RemoveCompositionayload
    | RemoveLayerPayload
    | RemoveClipPayload
    | RemoveAssetPayload
    | RemoveKeyframePayload

export type KnownPayload = EditorStateActionPayload | ProjectModifyActionPayload
