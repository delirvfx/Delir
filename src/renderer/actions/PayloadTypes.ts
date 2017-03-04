import {
    SetActiveProjectPayload,
    ClearActiveProjectPayload,
    SetDragEntityPayload,
    ClearDragEntityPayload,
    ChangeActiveCompositionPayload,
    ChangeActiveClipPayload,
    TogglePreviewPayload,
    RenderDestinatePayload,
    UpdateProcessingState,
    AddMessagePayload,
    RemoveMessagePayload,
    SeekPreviewFramePayload,
} from './editor-state-actions'

import {
    CreateCompositionPayload,
    CreateTimelanePayload,
    CreateClipPayload,
    AddClipPayload,
    AddTimelanePayload,
    AddTimelaneWithAssetPayload,
    AddAssetPayload,
    MoveClipToTimelanePayload,
    ModifyCompositionPayload,
    ModifyClipPayload,
    RemoveTimelanePayload,
    RemoveClipPayload,
} from './project-modify-actions'

export type EditorStateActionPayload =
    SetActiveProjectPayload
    | ClearActiveProjectPayload
    | SetDragEntityPayload
    | ClearDragEntityPayload
    | ChangeActiveCompositionPayload
    | ChangeActiveClipPayload
    | TogglePreviewPayload
    | RenderDestinatePayload
    | UpdateProcessingState
    | AddMessagePayload
    | RemoveMessagePayload
    | SeekPreviewFramePayload

export type ProjectModifyActionPayload =
    CreateCompositionPayload
    | CreateTimelanePayload
    | CreateClipPayload
    | AddClipPayload
    | AddTimelanePayload
    | AddTimelaneWithAssetPayload
    | AddAssetPayload
    | MoveClipToTimelanePayload
    | ModifyCompositionPayload
    | ModifyClipPayload
    | RemoveTimelanePayload
    | RemoveClipPayload

export type KnownPayload = EditorStateActionPayload | ProjectModifyActionPayload
