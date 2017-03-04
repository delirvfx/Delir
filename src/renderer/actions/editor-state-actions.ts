import * as Delir from 'delir-core'
import keyMirror from 'keymirror'
import * as _ from 'lodash'
import {remote} from 'electron'
import {BSON} from 'bson'
import * as fs from 'fs-promise'

import dispatcher from '../dispatcher'
import Payload from '../utils/payload'

import EditorStateStore from '../stores/editor-state-store'

export type DragEntity =
    {type: 'asset', asset: Delir.Project.Asset}
    | {type: 'layer', layer: Delir.Project.Layer}

export type SetActiveProjectPayload = Payload<'SetActiveProject', {project: Delir.Project.Project, path?: string}>
export type ClearActiveProjectPayload = Payload<'ClearActiveProject', null>
export type SetDragEntityPayload = Payload<'SetDragEntity', DragEntity>
export type ClearDragEntityPayload = Payload<'ClearDragEntity', {}>
export type ChangeActiveCompositionPayload = Payload<'ChangeActiveComposition', {compositionId: string}>
export type ChangeActiveLayerPayload = Payload<'ChangeActiveLayer', {layerId: string}>
export type TogglePreviewPayload = Payload<'TogglePreview', {compositionId: string}>
export type RenderDestinatePayload = Payload<'RenderDestinate', {compositionId: string}>
export type UpdateProcessingState = Payload<'UpdateProcessingState', {stateText: string}>
export type AddMessagePayload = Payload<'AddMessage', {id: string, title?: string, level: 'info'|'error', message: string, detail?: string}>
export type RemoveMessagePayload = Payload<'RemoveMessage', {id: string}>
export type SeekPreviewFramePayload = Payload<'SeekPreviewFrame', {frame: number}>

export const DispatchTypes = keyMirror({
    SetActiveProject: null,
    ClearActiveProject: null,
    SetDragEntity: null,
    ClearDragEntity: null,
    ChangeActiveComposition: null,
    ChangeActiveLayer: null,
    TogglePreview: null,
    RenderDestinate: null,
    UpdateProcessingState: null,
    AddMessage: null,
    RemoveMessage: null,
    SeekPreviewFrame: null,
})

const actions = {
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
    setActiveProject(project: Delir.Project.Project, path?: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.SetActiveProject, {project, path}))
    },

    setDragEntity(entity: DragEntity)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.SetDragEntity, entity))
    },

    clearDragEntity()
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ClearDragEntity, {}))
    },

    notify(message: string, title: string, level: 'info'|'error' = 'info', timeout?: number, detail?: string,)
    {
        const id = _.uniqueId('notify')
        dispatcher.dispatch(new Payload(DispatchTypes.AddMessage, {id, title, message, detail, level}))
        if (timeout != null) {
            setTimeout(() => { dispatcher.dispatch(new Payload(DispatchTypes.RemoveMessage, {id})); }, timeout)
        }
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

    seekPreviewFrame(frame: number)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.SeekPreviewFrame, {frame}))
    },

    //
    // Import & Export
    //
    newProject()
    {
        const project = EditorStateStore.getState().get('project')

        if (project) {
            const acceptDiscard = window.confirm('現在のプロジェクトの変更を破棄して新しいプロジェクトを開きますか？')
            if (! acceptDiscard) {
                return
            }
        }

        actions.setActiveProject(new Delir.Project.Project())
    },

    async openProject()
    {
        const project = EditorStateStore.getState().get('project')

        if (project) {
            const acceptDiscard = window.confirm('現在のプロジェクトの変更を破棄してプロジェクトを開きますか？')
            if (! acceptDiscard) {
                return
            }
        }

        const path = remote.dialog.showOpenDialog({
            title: 'プロジェクトを開く',
            filters: [{name: 'Delir project', extensions: ['delir']}],
            properties: ['openFile'],
        })

        if (! path.length) return

        const bson = new BSON
        const projectBson = await fs.readFile(path[0])
        actions.setActiveProject(Delir.Project.Project.deserialize(projectBson), path[0])
    },

    async overwriteProject()
    {
        const state = EditorStateStore.getState()
        const project = state.get('project')
        const path = state.get('projectPath')

        if (!project) return

        if (!path) {
            actions.saveProject()
            return
        }

        const bson = new BSON
        await fs.writeFile(path, bson.serialize(project.toPreBSON()))
        actions.notify('Project saved', '', 'info', 1000)
    },

    async saveProject()
    {
        const project = EditorStateStore.getState().get('project')

        if (! project) return

        const path = remote.dialog.showSaveDialog({
            title: 'Save as ...',
            buttonLabel: 'Save',
            filters: [
                {
                    name: 'Delir Project File',
                    extensions: ['delir']
                }
            ],
        })

        if (!path) return

        const bson = new BSON
        await fs.writeFile(path, bson.serialize(project.toPreBSON()))
        actions.setActiveProject(project, path) // update path
        actions.notify('Project saved', '', 'info', 1000)
    }
}

export default actions