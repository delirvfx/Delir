import { operation } from '@ragg/fleur'
import { BSON } from 'bson'
import * as Delir from 'delir-core'
import { remote } from 'electron'
import * as fs from 'fs-promise'
import * as _ from 'lodash'
import * as path from 'path'

import EditorStateStore from '../stores/EditorStateStore'
import RendererStore from '../stores/RendererStore'

import { AppActions } from './actions'
import t from './App.i18n'

export type DragEntity =
    | { type: 'asset', asset: Delir.Project.Asset }
    | { type: 'clip', clip: Delir.Project.Clip }
    | { type: 'clip-resizing', clip: Delir.Project.Clip }

//
// App services
//
export const previewProgressed = operation((context, { currentFrame }: { currentFrame: number }) => {
    context.dispatch
    // context.dispatch({
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
    context.dispatch(AppActions.setActiveProjectAction, {
        project: arg.project,
        path: arg.path
    })
})

export const setDragEntity = operation((context, arg: { entity: DragEntity }) => {
    context.dispatch(AppActions.setDragEntityAction, arg.entity)
})

export const clearDragEntity = operation((context, arg: {}) => {
    context.dispatch(AppActions.clearDragEntityAction, {})
})

export const notify = operation((context, arg: {
    message: string,
    title: string,
    level: 'info' | 'error',
    timeout?: number,
    detail?: string,
}) => {
    const id = _.uniqueId('notify')

    context.dispatch(AppActions.addMessageAction, {
        id,
        title: arg.title,
        message: arg.message,
        detail: arg.detail,
        level: arg.level || 'info',
    })

    if (arg.timeout != null) {
        setTimeout(() => { context.dispatch(AppActions.removeMessageAction, { id }) }, arg.timeout)
    }
})

//
// Change active element
//
export const changeActiveComposition = operation((context, { compositionId }: { compositionId: string }) => {
    context.dispatch(AppActions.changeActiveCompositionAction, { compositionId })
})

export const changeActiveClip = operation((context, { clipId }: { clipId: string }) => {
    context.dispatch(AppActions.changeActiveClipAction, { clipId })
})

//
// Preview
//
export const startPreview = operation((context, { compositionId, beginFrame = 0 }: { compositionId: string, beginFrame?: number }) => {
    context.dispatch(AppActions.startPreviewAction, { compositionId, beginFrame })
})

export const stopPreview = operation((context) => {
    context.dispatch(AppActions.stopPreviewAction, {})
})

export const renderDestinate = operation((context, arg: { compositionId: string }) => {
    context.dispatch(AppActions.renderDestinateAction, {
        compositionId: arg.compositionId
    })
})

export const updateProcessingState = operation((context, arg: { stateText: string }) => {
    context.dispatch(AppActions.updateProcessingStateAction, {
        stateText: arg.stateText
    })
})

export const seekPreviewFrame = operation((context, { frame = null }: { frame?: number }) => {
    const state = context.getStore(EditorStateStore).getState()

    const {activeComp} = state
    if (!activeComp) return

    frame = _.isNumber(frame) ? frame : state.currentPreviewFrame
    const overloadGuardedFrame = _.clamp(frame, 0, activeComp.durationFrames)
    context.dispatch(AppActions.seekPreviewFrameAction, { frame: overloadGuardedFrame })
})

//
// Import & Export
//
export const newProject = operation(async (context) => {
    const project = context.getStore(EditorStateStore).getState().project

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
    const project = context.getStore(EditorStateStore).getState().project

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
    const state = context.getStore(EditorStateStore).getState()
    const { project, projectPath } = state

    if (!project) return

    if (!projectPath) {
        await context.executeOperation(saveProject, {})
        return
    }

    const bson = new BSON()

    await fs.writeFile(projectPath, bson.serialize(project.toPreBSON()))

    await context.executeOperation(notify, {
        message: 'Project saved',
        title: '',
        level: 'info',
        timeout: 1000
    })
})

export const saveProject = operation(async (context) => {
    const project = context.getStore(EditorStateStore).getState().project

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
    const {project, projectPath} = context.getStore(EditorStateStore).getState()
    const isInRendering = context.getStore(RendererStore).isInRendering()

    if (isInRendering) return

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
