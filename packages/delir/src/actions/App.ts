import * as Delir from '@ragg/delir-core'
import * as keyMirror from 'keymirror'
import * as _ from 'lodash'
import {remote} from 'electron'
import {BSON} from 'bson'
import * as fs from 'fs-promise'
import * as path from 'path'

import dispatcher from '../utils/Flux/Dispatcher'
import Payload from '../utils/Flux/Payload'

import EditorStateStore from '../stores/EditorStateStore'
import RendererService from '../services/renderer'

import t from './App.i18n'

export type DragEntity =
    | {type: 'asset', asset: Delir.Project.Asset}
    | {type: 'clip', clip: Delir.Project.Clip}
    | {type: 'clip-resizing', clip: Delir.Project.Clip}

export type SetActiveProjectPayload = Payload<'SetActiveProject', {project: Delir.Project.Project, path?: string}>
export type ClearActiveProjectPayload = Payload<'ClearActiveProject', null>
export type SetDragEntityPayload = Payload<'SetDragEntity', DragEntity>
export type ClearDragEntityPayload = Payload<'ClearDragEntity', {}>
export type ChangeActiveCompositionPayload = Payload<'ChangeActiveComposition', {compositionId: string}>
export type ChangeActiveClipPayload = Payload<'ChangeActiveClip', {clipId: string}>
export type StartPreviewPayload = Payload<'StartPreview', {compositionId: string, beginFrame: number}>
export type StopPreviewPayload = Payload<'StopPreview', {}>
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
    ChangeActiveClip: null,
    StartPreview: null,
    StopPreview: null,
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

    openPluginDirectory()
    {
        const userDir = remote.app.getPath('appData')
        const pluginsDir = path.join(userDir, 'delir/plugins')
        remote.shell.openItem(pluginsDir)
    },

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

    changeActiveClip(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ChangeActiveClip, {clipId}))
    },

    //
    // Preview
    //
    startPreview(compositionId: string, beginFrame: number = 0)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.StartPreview, {compositionId, beginFrame}))
    },

    stopPreview()
    {
        dispatcher.dispatch(new Payload(DispatchTypes.StopPreview, {}))
    },

    renderDestinate(compositionId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RenderDestinate, {compositionId}))
    },

    updateProcessingState(stateText: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.UpdateProcessingState,　{stateText}))
    },

    seekPreviewFrame(frame: number|null = null)
    {
        const state = EditorStateStore.getState()

        const activeComp = state.get('activeComp')
        if (!activeComp) return

        frame = _.isNumber(frame) ? frame : state.get('currentPreviewFrame')
        const overloadGuardedFrame = _.clamp(frame, 0, activeComp.durationFrames)
        dispatcher.dispatch(new Payload(DispatchTypes.SeekPreviewFrame, {frame: overloadGuardedFrame}))
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

        const projectBson = await fs.readFile(path[0])
        const projectJson = (new BSON()).deserialize(projectBson)

        const migratedProject = Delir.ProjectMigrator.migrate(projectJson)
        actions.setActiveProject(Delir.Project.Project.deserialize(migratedProject), path[0])
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

        const bson = new BSON()
        await fs.writeFile(path, bson.serialize(project.toPreBSON()))
        actions.setActiveProject(project, path) // update path
        actions.notify(t('saved'), '', 'info', 1000)
    },

    async autoSaveProject()
    {
        const project = EditorStateStore.getState().get('project')
        const projectPath = EditorStateStore.getState().get('projectPath')

        if (RendererService.isInRendering) return

        if (!project || !projectPath) {
            actions.notify(t('letsSave'), '', 'info', 5000)
            return
        }

        const frag = path.parse(projectPath)
        const autoSaveFileName = `${frag.name}.auto-saved${frag.ext}`
        const autoSavePath = path.join(frag.dir, autoSaveFileName)

        const bson = new BSON()
        await fs.writeFile(autoSavePath, bson.serialize(project.toPreBSON()))
        actions.notify(t('autoSaved', {fileName: autoSaveFileName}), '', 'info', 2000)
    },
}

export default actions
