import * as Delir from '@delirvfx/core'
import { operation } from '@ragg/fleur'
import { remote } from 'electron'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as MsgPack from 'msgpack5'
import * as path from 'path'
import { SpreadType } from '../../utils/Spread'

import PreferenceStore from '../Preference/PreferenceStore'
import { migrateProject } from '../Project/models'
import RendererStore from '../Renderer/RendererStore'
import EditorStore from './EditorStore'

import { EditorActions } from './actions'
import t from './operations.i18n'
import { ClipboardEntry, ParameterTarget } from './types'

export type DragEntity =
    | { type: 'asset'; asset: Delir.Entity.Asset }
    | { type: 'clip'; clip: SpreadType<Delir.Entity.Clip> }
    | { type: 'clip-resizing'; clip: SpreadType<Delir.Entity.Clip> }

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
            context.dispatch(EditorActions.clearActiveProject, {})
        }

        context.dispatch(EditorActions.setActiveProject, {
            project: payload.project,
            path: payload.path,
        })
    },
)

export const setDragEntity = operation((context, arg: { entity: DragEntity }) => {
    context.dispatch(EditorActions.setDragEntity, arg.entity)
})

export const clearDragEntity = operation((context, arg: {}) => {
    context.dispatch(EditorActions.clearDragEntity, {})
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

        context.dispatch(EditorActions.addMessage, {
            id,
            title: arg.title,
            message: arg.message,
            detail: arg.detail,
            level: arg.level || 'info',
        })

        if (arg.timeout != null) {
            setTimeout(() => {
                context.dispatch(EditorActions.removeMessage, { id })
            }, arg.timeout)
        }
    },
)

export const removeNotification = operation((context, arg: { id: string }) => {
    context.dispatch(EditorActions.removeMessage, { id: arg.id })
})

//
// Change active element
//
export const changeActiveComposition = operation((context, { compositionId }: { compositionId: string }) => {
    context.dispatch(EditorActions.changeActiveComposition, {
        compositionId,
    })
})

export const addOrRemoveSelectClip = operation((context, args: { clipIds: string[] }) => {
    context.dispatch(EditorActions.addOrRemoveSelectClip, { clipIds: args.clipIds })
})

export const changeSelectClip = operation((context, { clipIds }: { clipIds: string[] }) => {
    context.dispatch(EditorActions.changeSelectClip, { clipIds })
})

export const changeActiveParam = operation((context, { target }: { target: ParameterTarget | null }) => {
    context.dispatch(EditorActions.changeActiveParam, { target })
})

export const renderDestinate = operation((context, arg: { compositionId: string }) => {
    const preference = context.getStore(PreferenceStore).getPreferences()

    context.dispatch(EditorActions.renderDestinate, {
        compositionId: arg.compositionId,
        ignoreMissingEffect: preference.renderer.ignoreMissingEffect,
    })
})

export const updateProcessingState = operation((context, arg: { stateText: string }) => {
    context.dispatch(EditorActions.updateProcessingState, {
        stateText: arg.stateText,
    })
})

export const seekPreviewFrame = operation((context, { frame = undefined }: { frame?: number }) => {
    const state = context.getStore(EditorStore).getState()

    const { activeComp } = state
    if (!activeComp) return

    frame = _.isNumber(frame) ? frame : state.currentPreviewFrame
    const overloadGuardedFrame = _.clamp(frame, 0, activeComp.durationFrames)
    context.dispatch(EditorActions.seekPreviewFrame, {
        frame: overloadGuardedFrame,
    })
})

//
// Import & Export
//
export const newProject = operation(async context => {
    await context.executeOperation(setActiveProject, {
        project: new Delir.Entity.Project({}),
    })
})

export const openProject = operation(async (context, { path }: { path: string }) => {
    const projectMpk = await fs.readFile(path[0])
    const projectJson = MsgPack().decode(projectMpk).project
    const project = Delir.Exporter.deserializeProject(projectJson)
    const migrated = migrateProject(Delir.ProjectMigrator.migrate(project))

    await context.executeOperation(setActiveProject, {
        project: migrated,
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
                message: t(t.k.saved),
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
            message: t(t.k.letsSave),
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
        message: t(t.k.autoSaved, { fileName: autoSaveFileName }),
        title: '',
        level: 'info',
        timeout: 2000,
    })
})

export const changePreferenceOpenState = operation((context, { open }: { open: boolean }) => {
    context.dispatch(EditorActions.changePreferenceOpenState, {
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
            entity: SpreadType<Delir.Entity.Clip>
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
