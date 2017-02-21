import {
    SetActiveProjectPayload,
    ClearActiveProjectPayload,
    SetDragEntityPayload,
    ClearDragEntityPayload,
    ChangeActiveCompositionPayload,
    ChangeActiveLayerPayload,
    TogglePreviewPayload,
    RenderDestinatePayload,
    UpdateProcessingState,
    AddMessagePayload,
    RemoveMessagePayload,
} from './editor-state-actions'

import {
    CreateCompositionPayload,
    CreateTimelanePayload,
    CreateLayerPayload,
    AddLayerPayload,
    AddTimelanePayload,
    AddTimelaneWithAssetPayload,
    AddAssetPayload,
    MoveLayerToTimelanePayload,
    ModifyCompositionPayload,
    ModifyLayerPayload,
    RemoveTimelanePayload,
    RemoveLayerPayload,
} from './project-modify-actions'

export type EditorStateActionPayload =
    SetActiveProjectPayload
    | ClearActiveProjectPayload
    | SetDragEntityPayload
    | ClearDragEntityPayload
    | ChangeActiveCompositionPayload
    | ChangeActiveLayerPayload
    | TogglePreviewPayload
    | RenderDestinatePayload
    | UpdateProcessingState
    | AddMessagePayload
    | RemoveMessagePayload

export type ProjectModifyActionPayload =
    CreateCompositionPayload
    | CreateTimelanePayload
    | CreateLayerPayload
    | AddLayerPayload
    | AddTimelanePayload
    | AddTimelaneWithAssetPayload
    | AddAssetPayload
    | MoveLayerToTimelanePayload
    | ModifyCompositionPayload
    | ModifyLayerPayload
    | RemoveTimelanePayload
    | RemoveLayerPayload

export type KnownPayload = EditorStateActionPayload | ProjectModifyActionPayload
