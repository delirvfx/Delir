import * as Delir from '@ragg/delir-core'
import { action, operation, operations } from '@ragg/fleur'
import { BSON } from 'bson'
import { remote } from 'electron'
import * as fs from 'fs-promise'
import * as keyMirror from 'keymirror'
import * as _ from 'lodash'
import * as path from 'path'

import dispatcher from '../utils/Flux/Dispatcher'
import Payload from '../utils/Flux/Payload'

import RendererService from '../services/renderer'
import EditorStateStore from '../stores/EditorStateStore'

import t from './App.i18n'

export type DragEntity =
    | { type: 'asset', asset: Delir.Project.Asset }
    | { type: 'clip', clip: Delir.Project.Clip }
    | { type: 'clip-resizing', clip: Delir.Project.Clip }

export const AppActions = {
    setActiveProjectAction: action<{ project: Delir.Project.Project, path?: string }>(),
    clearActiveProjectAction: action<null>(),
    setDragEntityAction: action<DragEntity>(),
    clearDragEntityAction: action<{}>(),
    changeActiveCompositionAction: action<{ compositionId: string }>(),
    changeActiveClipAction: action<{ clipId: string }>(),
    startPreviewAction: action<{ compositionId: string, beginFrame: number }>(),
    stopPreviewAction: action<{}>(),
    renderDestinateAction: action<{ compositionId: string }>(),
    updateProcessingStateAction: action<{ stateText: string }>(),
    addMessageAction: action<{ id: string, title?: string, level: 'info' | 'error', message: string, detail?: string }>(),
    removeMessageAction: action<{ id: string }>(),
    seekPreviewFrameAction: action<{ frame: number }>(),
}

//
// App services
//
export const previewProgressed = operation((context, { currentFrame }: { currentFrame: number }) => {
    context.dispatch
    // dispatcher.dispatch({
    //     type: 'preview-progressed',
    //     payload: {currentFrame}
    // })
})

export const openPluginDirectory = operation((context, arg: {}) => {
    const userDir = remote.app.getPath('appData')
    const pluginsDir = path.join(userDir, 'delir/plugins')
    remote.shell.openItem(pluginsDir)
})

//
// Editor Store
//
export const setActiveProject = operation((context, arg: { project: Delir.Project.Project, path?: string }) => {
    dispatcher.dispatch(AppActions.setActiveProjectAction, {
        project: arg.project,
        path
    })
})

export const setDragEntity = operation((context, arg: { entity: DragEntity }) => {
    dispatcher.dispatch(AppActions.setDragEntityAction, arg.entity)
})

export const clearDragEntity = operation((context, arg: {}) => {
    dispatcher.dispatch(AppActions.clearDragEntityAction, {})
})

export const notify = operation((context, arg: {
    message: string,
    title: string,
    level: 'info' | 'error',
    timeout?: number,
    detail?: string,
}) => {
    const id = _.uniqueId('notify')

    dispatcher.dispatch(AppActions.addMessageAction, {
        id,
        title: arg.title,
        message: arg.message,
        detail: arg.detail,
        level: arg.level || 'info',
    })

    if (arg.timeout != null) {
        setTimeout(() => { dispatcher.dispatch(AppActions.removeMessageAction, { id })) }, arg.timeout
    }
})

//
// Change active element
//
export const changeActiveComposition = operation((context, { compositionId } : { compositionId: string }) => {
    dispatcher.dispatch(AppActions.changeActiveCompositionAction, { compositionId })
})

export const changeActiveClip = operation((context, {clipId}: { clipId: string }) => {
    dispatcher.dispatch(AppActions.changeActiveClipAction, { clipId })
})

//
// Preview
//
export const startPreview = operation((context, { compositionId, beginFrame = 0 }: { compositionId: string, beginFrame: number }) => {
    dispatcher.dispatch(AppActions.startPreviewAction, { compositionId, beginFrame })
})

export const stopPreview = operation((context) => {
    dispatcher.dispatch(AppActions.stopPreviewAction, {})
})

export const renderDestinate = operation((context, arg: { compositionId: string }) => {
    dispatcher.dispatch(AppActions.renderDestinateAction, {
        compositionId: arg.compositionId
    })
})

export const updateProcessingState = operation((context, arg: { stateText: string }) => {
    dispatcher.dispatch(AppActions.updateProcessingStateAction, {
        stateText: arg.stateText
    })
})

export const seekPreviewFrame = operation((context, { frame = null }: { frame: number | null }) => {
    const state = EditorStateStore.getState()

    const activeComp = state.get('activeComp')
    if (!activeComp) return

    frame = _.isNumber(frame) ? frame : state.get('currentPreviewFrame')
    const overloadGuardedFrame = _.clamp(frame, 0, activeComp.durationFrames)
    dispatcher.dispatch(AppActions.seekPreviewFrameAction, { frame: overloadGuardedFrame })
})

//
// Import & Export
//
export const newProject = operation(async (context) => {
    const project = EditorStateStore.getState().get('project')

    if (project) {
        const acceptDiscard = window.confirm('現在のプロジェクトの変更を破棄して新しいプロジェクトを開きますか？')
        if (!acceptDiscard) {
            return
        }
    }

    await context.executeOperation(setActiveProject, {
        project: new Delir.Project.Project()
    })
})

export const openProject = operation(async (context) => {
    const project = EditorStateStore.getState().get('project')

    if (project) {
        const acceptDiscard = window.confirm('現在のプロジェクトの変更を破棄してプロジェクトを開きますか？')
        if (!acceptDiscard) {
            return
        }
    }

    const path = remote.dialog.showOpenDialog({
        title: 'プロジェクトを開く',
        filters: [{ name: 'Delir project', extensions: ['delir'] }],
        properties: ['openFile'],
    })

    if (!path.length) return

    const projectBson = await fs.readFile(path[0])
    const projectJson = (new BSON()).deserialize(projectBson)

    const migratedProject = Delir.ProjectMigrator.migrate(projectJson)

    await context.executeOperation(setActiveProject, {
        project: Delir.Project.Project.deserialize(migratedProject),
        path: path[0]
    })
})

export const overwriteProject = operation(async (context) => {
    const state = EditorStateStore.getState()
    const project = state.get('project')
    const path = state.get('projectPath')

    if (!project) return

    if (!path) {
        await context.executeOperation(saveProject, {})
        return
    }

    const bson = new BSON()

    await fs.writeFile(path, bson.serialize(project.toPreBSON()))

    await context.executeOperation(notify, {
        message: 'Project saved',
        title: '',
        level: 'info',
        timeout: 1000
    })
})

export const saveProject = operation(async (context) => {
    const project = EditorStateStore.getState().get('project')

    if (!project) return

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

    context.executeOperation(setActiveProject, { project, path }) // update path

    await context.executeOperation(notify, {
        message: t('saved'),
        title: '',
        level: 'info',
        timeout: 1000
    })
})

export const autoSaveProject = operation(async (context) => {
    const project = EditorStateStore.getState().get('project')
    const projectPath = EditorStateStore.getState().get('projectPath')

    if (RendererService.isInRendering) return

    if (!project || !projectPath) {
        context.executeOperation(notify, {
            message: t('letsSave'),
            title: '',
            level: 'info',
            timeout: 5000
        })

        return
    }

    const frag = path.parse(projectPath)
    const autoSaveFileName = `${frag.name}.auto-saved${frag.ext}`
    const autoSavePath = path.join(frag.dir, autoSaveFileName)

    const bson = new BSON()
    await fs.writeFile(autoSavePath, bson.serialize(project.toPreBSON()))
    context.executeOperation(notify, {
        message: t('autoSaved', { fileName: autoSaveFileName }),
        title: '',
        level: 'info',
        timeout: 2000
    })
})
