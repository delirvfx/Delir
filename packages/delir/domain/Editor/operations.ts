import * as Delir from '@ragg/delir-core'
import { operation } from '@ragg/fleur'
import { remote } from 'electron'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as MsgPack from 'msgpack5'
import * as path from 'path'

import PreferenceStore from '../Preference/PreferenceStore'
import RendererStore from '../Renderer/RendererStore'
import EditorStore from './EditorStore'

import { EditorActions } from './actions'
import t from './operations.i18n'
import { ClipboardEntry, ParameterTarget } from './types'

export type DragEntity =
    | { type: 'asset'; asset: Delir.Entity.Asset }
    | { type: 'clip'; clip: Delir.Entity.Clip }
    | { type: 'clip-resizing'; clip: Delir.Entity.Clip }

//
// App services
//

export const openPluginDirectory = operation((context, arg: {}) => {
    const userDir = remote.app.getPath('appData')
    const pluginsDir = path.join(userDir, 'delir/plugins')
    remote.shell.openItem(pluginsDir)
})

export const setActiveProject = operation(
    (context, payload: { project: Delir.Entity.Project; path?: string | null }) => {
        const { project: activeProject } = context.getStore(EditorStore).getState()

        if (!activeProject || payload.project !== activeProject) {
            context.dispatch(EditorActions.clearActiveProjectAction, {})
        }

        context.dispatch(EditorActions.setActiveProjectAction, {
            project: payload.project,
            path: payload.path,
        })
    },
)

export const setDragEntity = operation((context, arg: { entity: DragEntity }) => {
    context.dispatch(EditorActions.setDragEntityAction, arg.entity)
})

export const clearDragEntity = operation((context, arg: {}) => {
    context.dispatch(EditorActions.clearDragEntityAction, {})
})

export const notify = operation(
    (
        context,
        arg: {
            message?: string
            title?: string
            level: 'info' | 'error'
            timeout?: number
            detail?: string
        },
    ) => {
        const id = _.uniqueId('notify')

        context.dispatch(EditorActions.addMessageAction, {
            id,
            title: arg.title,
            message: arg.message,
            detail: arg.detail,
            level: arg.level || 'info',
        })

        if (arg.timeout != null) {
            setTimeout(() => {
                context.dispatch(EditorActions.removeMessageAction, { id })
            }, arg.timeout)
        }
    },
)

export const removeNotification = operation((context, arg: { id: string }) => {
    context.dispatch(EditorActions.removeMessageAction, { id: arg.id })
})

//
// Change active element
//
export const changeActiveComposition = operation((context, { compositionId }: { compositionId: string }) => {
    context.dispatch(EditorActions.changeActiveCompositionAction, {
        compositionId,
    })
})

export const changeActiveClip = operation((context, { clipId }: { clipId: string }) => {
    context.dispatch(EditorActions.changeActiveClipAction, { clipId })
})

export const changeActiveParam = operation((context, { target }: { target: ParameterTarget | null }) => {
    context.dispatch(EditorActions.changeActiveParamAction, { target })
})

export const renderDestinate = operation((context, arg: { compositionId: string }) => {
    const preference = context.getStore(PreferenceStore).getPreferences()

    context.dispatch(EditorActions.renderDestinateAction, {
        compositionId: arg.compositionId,
        ignoreMissingEffect: preference.renderer.ignoreMissingEffect,
    })
})

export const updateProcessingState = operation((context, arg: { stateText: string }) => {
    context.dispatch(EditorActions.updateProcessingStateAction, {
        stateText: arg.stateText,
    })
})

export const seekPreviewFrame = operation((context, { frame = undefined }: { frame?: number }) => {
    const state = context.getStore(EditorStore).getState()

    const { activeComp } = state
    if (!activeComp) return

    frame = _.isNumber(frame) ? frame : state.currentPreviewFrame
    const overloadGuardedFrame = _.clamp(frame, 0, activeComp.durationFrames)
    context.dispatch(EditorActions.seekPreviewFrameAction, {
        frame: overloadGuardedFrame,
    })
})

//
// Import & Export
//
export const newProject = operation(async context => {
    const project = context.getStore(EditorStore).getState().project

    if (project) {
        const acceptDiscard = window.confirm('現在のプロジェクトの変更を破棄して新しいプロジェクトを開きますか？')
        if (!acceptDiscard) {
            return
        }
    }

    await context.executeOperation(setActiveProject, {
        project: new Delir.Entity.Project({}),
    })
})

export const openProject = operation(async context => {
    const project = context.getStore(EditorStore).getState().project

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

    const projectMpk = await fs.readFile(path[0])
    const projectJson = MsgPack().decode(projectMpk).project

    await context.executeOperation(setActiveProject, {
        project: Delir.Exporter.deserializeProject(projectJson),
        path: path[0],
    })
})

export const saveProject = operation(
    async (
        context,
        { path, silent = false, keepPath = false }: { path: string; silent?: boolean; keepPath?: boolean },
    ) => {
        const project = context.getStore(EditorStore).getState().project
        if (!project) return

        await fs.writeFile(path, (MsgPack().encode({
            project: Delir.Exporter.serializeProject(project),
        }) as any) as Buffer)

        let newPath: string | null = path
        if (keepPath) {
            newPath = context.getStore(EditorStore).getState().projectPath
        }

        context.executeOperation(setActiveProject, { project, path: newPath }) // update path

        !silent &&
            (await context.executeOperation(notify, {
                message: t('saved'),
                title: '',
                level: 'info',
                timeout: 1000,
            }))
    },
)

export const autoSaveProject = operation(async context => {
    const { project, projectPath } = context.getStore(EditorStore).getState()
    const isInRendering = context.getStore(RendererStore).isInRendering()

    if (isInRendering) return

    if (!project || !projectPath) {
        context.executeOperation(notify, {
            message: t('letsSave'),
            title: '',
            level: 'info',
            timeout: 5000,
        })

        return
    }

    const frag = path.parse(projectPath)
    const autoSaveFileName = `${frag.name}.auto-saved${frag.ext}`
    const autoSavePath = path.join(frag.dir, autoSaveFileName)

    await context.executeOperation(saveProject, {
        path: autoSavePath,
        silent: true,
        keepPath: true,
    })

    context.executeOperation(notify, {
        message: t('autoSaved', { fileName: autoSaveFileName }),
        title: '',
        level: 'info',
        timeout: 2000,
    })
})

export const changePreferenceOpenState = operation((context, { open }: { open: boolean }) => {
    context.dispatch(EditorActions.changePreferenceOpenStateAction, {
        open,
    })
})

//
// Internal clipboard
//
export const copyEntity = operation(
    (
        context,
        {
            type,
            entity,
        }: {
            type: ClipboardEntry['type']
            entity: Delir.Entity.Clip
        },
    ) => {
        context.dispatch(EditorActions.setClipboardEntry, {
            entry: {
                type,
                entityClone: Delir.Exporter.serializeEntity(entity),
            },
        })
    },
)
