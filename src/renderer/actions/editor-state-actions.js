// @flow
import {remote} from 'electron'
import type Delir from 'delir-core'

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'

export default {
    //
    // App services
    //
    previewProgressed(currentFrame: number)
    {
        dispatcher.dispatch({
            type: 'preview-progressed',
            payload: {currentFrame}
        })
    },

    //
    //
    //

    //
    // Editor Store
    //
    setActiveProject(project: Delir.Project.Project)
    {
        dispatcher.dispatch({
            type: ActionTypes.SET_ACTIVE_PROJECT,
            payload: {project},
        })
    },

    setDragEntity(type: string, entity: Delir.Project.Asset)
    {
        dispatcher.dispatch({
            type: ActionTypes.SET_DRAG_ENTITY,
            payload: {type, entity},
        })
    },

    clearDragEntity(type: string, entity: Delir.Project.Asset)
    {
        dispatcher.dispatch({
            type: ActionTypes.CLEAR_DRAG_ENTITY,
            payload: {},
        })
    },

    //
    // Change active element
    //
    changeActiveComposition(compositionId: string)
    {
        dispatcher.dispatch({
            type: ActionTypes.CHANGE_ACTIVE_COMPOSITION,
            payload: {compositionId},
        })
    },

    changeActiveLayer(layerId: string)
    {
        dispatcher.dispatch({
            type: ActionTypes.CHANGE_ACTIVE_LAYER,
            payload: {layerId},
        })
    },


    //
    // Preview
    //
    togglePreview(compositionId)
    {
        dispatcher.dispatch({
            type: ActionTypes.TOGGLE_PREVIEW,
            payload: {compositionId},
        })
    },

    renderDestinate(compositionId)
    {
        dispatcher.dispatch({
            type: ActionTypes.RENDER_DESTINATE,
            payload: {compositionId},
        })
    },

    updateProcessingState(stateText)
    {
        dispatcher.dispatch({
            type: ActionTypes.UPDATE_PROCESSING_STATE,
            payload: {stateText},
        })
    },
}
