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
    CreateLayerPayload,
    CreateClipPayload,
    AddClipPayload,
    AddLayerPayload,
    AddLayerWithAssetPayload,
    AddAssetPayload,
    MoveClipToLayerPayload,
    ModifyCompositionPayload,
    ModifyClipPayload,
    RemoveCompositionayload,
    RemoveLayerPayload,
    RemoveClipPayload,
    RemoveAssetPayload,
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
    | CreateLayerPayload
    | CreateClipPayload
    | AddClipPayload
    | AddLayerPayload
    | AddLayerWithAssetPayload
    | AddAssetPayload
    | MoveClipToLayerPayload
    | ModifyCompositionPayload
    | ModifyClipPayload
    | RemoveCompositionayload
    | RemoveLayerPayload
    | RemoveClipPayload
    | RemoveAssetPayload

export type KnownPayload = EditorStateActionPayload | ProjectModifyActionPayload
