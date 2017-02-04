import * as Delir from 'delir-core'
import keyMirror from 'keymirror'

import dispatcher from '../dispatcher'
import Payload from '../utils/payload'

export type DragEntity = 
    {type: 'asset', asset: Delir.Project.Asset}
    | {type: 'layer', layer: Delir.Project.Layer}

export type SetActiveProjectPayload = Payload<'SetActiveProject', {project: Delir.Project.Project}>
export type SetDragEntityPayload = Payload<'SetDragEntity', DragEntity>
export type ClearDragEntityPayload = Payload<'ClearDragEntity', {}>
export type ChangeActiveCompositionPayload = Payload<'ChangeActiveComposition', {compositionId: string}>
export type ChangeActiveLayerPayload = Payload<'ChangeActiveLayer', {layerId: string}>
export type TogglePreviewPayload = Payload<'TogglePreview', {compositionId: string}>
export type RenderDestinatePayload = Payload<'RenderDestinate', {compositionId: string}>
export type UpdateProcessingState = Payload<'UpdateProcessingState', {stateText: string}>

export const DispatchTypes = keyMirror({
    SetActiveProject: null,
    SetDragEntity: null,
    ClearDragEntity: null,
    ChangeActiveComposition: null,
    ChangeActiveLayer: null,
    TogglePreview: null,
    RenderDestinate: null,
    UpdateProcessingState: null,
})

export default {
    //
    // App services
    //
    previewProgressed(currentFrame: number)
    {
        // dispatcher.dispatch({
        //     type: 'preview-progressed',
        //     payload: {currentFrame}
        // })
    },

    //
    //
    //

    //
    // Editor Store
    //
    setActiveProject(project: Delir.Project.Project)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.SetActiveProject, {project}))
    },

    setDragEntity(entity: DragEntity)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.SetDragEntity, entity))
    },

    clearDragEntity(type: string, entity: Delir.Project.Asset)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ClearDragEntity, {}))
    },

    //
    // Change active element
    //
    changeActiveComposition(compositionId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ChangeActiveComposition, {compositionId}))
    },

    changeActiveLayer(layerId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ChangeActiveLayer, {layerId}))
    },


    //
    // Preview
    //
    togglePreview(compositionId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.TogglePreview, {compositionId}))
    },

    renderDestinate(compositionId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RenderDestinate, {compositionId}))
    },

    updateProcessingState(stateText: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.UpdateProcessingState,　{stateText}))
    },
}