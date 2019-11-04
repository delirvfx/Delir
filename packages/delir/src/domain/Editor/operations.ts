import * as Delir from '@delirvfx/core'
import { operation } from '@fleur/fleur'
import archiver from 'archiver';
import { remote } from 'electron'
import glob from 'fast-glob'
import fs from 'fs-extra'
import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import MsgPack from 'msgpack5'
import path from 'path'
import unzipper from 'unzipper'
import uuid from 'uuid'
import { SpreadType } from '../../utils/Spread'

import { HistoryGroup } from 'domain/History/HistoryGroup';
import { Command } from 'domain/History/HistoryStore';
import { ProjectActions } from 'domain/Project/actions';
import { AddClipCommand } from 'domain/Project/Commands/AddClipCommand';
import * as HistoryOps from '../History/operations'
import { migrateProject } from '../Project/models'
import * as ProjectOps from '../Project/operations'
import { getProject } from '../Project/selectors'
import RendererStore from '../Renderer/RendererStore'
import { EditorActions } from './actions'
import EditorStore from './EditorStore'
import { NotificationTimeouts} from './models'
import t from './operations.i18n'
import { getActiveComp, getClipboardEntry, getCurrentPreviewFrame, getSelectedClipIds } from './selectors';
import { ClipboardEntryClip, ParameterTarget } from './types'

export type DragEntity =
  | { type: 'asset'; asset: Delir.Entity.Asset }
  | { type: 'clip'; baseClipId: string }
  | { type: 'clip-resizing'; clip: SpreadType<Delir.Entity.Clip> }

type ProjectPackAssetMap = Record<string, {fileName: string, tmpName: string}>

//
// App services
//

export const openPluginDirectory = operation(context => {
  const userDir = remote.app.getPath('appData')
  const pluginsDir = path.join(userDir, 'delir/plugins')
  remote.shell.openItem(pluginsDir)
})

export const setActiveProject = operation(
  async (context, payload: { project: Delir.Entity.Project; path?: string | null }) => {
    const { project: activeProject } = context.getStore(EditorStore).getState()
    const projectChanged = payload.project !== activeProject

    if (!activeProject || projectChanged) {
      context.dispatch(EditorActions.clearActiveProject, {})
    }

    context.dispatch(EditorActions.setActiveProject, {
      project: payload.project,
      path: payload.path,
    })

    if (projectChanged) {
      await context.executeOperation(HistoryOps.clearHistory)
    }
  },
)

export const setDragEntity = operation((context, arg: { entity: DragEntity }) => {
  context.dispatch(EditorActions.setDragEntity, arg.entity)
})

export const clearDragEntity = operation(context => {
  context.dispatch(EditorActions.clearDragEntity, {})
})

export const notify = operation(
  (
    context,
    arg: {
      id?: string,
      message?: string
      title?: string
      level: 'info' | 'error'
      timeout?: number
      detail?: string
    },
  ) => {
    const id = arg.id || _.uniqueId('notify')

    context.dispatch(EditorActions.addMessage, {
      id,
      title: arg.title,
      message: arg.message,
      detail: arg.detail,
      level: arg.level || 'info',
      timeout: arg.timeout
    })
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

export const changeActiveLayer = operation(({ dispatch }, layerId: string) => {
  dispatch(EditorActions.changeActiveLayer, { layerId })
})

export const addOrRemoveSelectClip = operation((context, args: { clipIds: string[] }) => {
  context.dispatch(EditorActions.addOrRemoveSelectClip, {
    clipIds: args.clipIds,
  })
})

export const changeSelectClip = operation((context, { clipIds }: { clipIds: string[] }) => {
  context.dispatch(EditorActions.changeSelectClip, { clipIds })
})

export const changeActiveParam = operation((context, { target }: { target: ParameterTarget | null }) => {
  context.dispatch(EditorActions.changeActiveParam, { target })
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
  const projectMpk = await fs.readFile(path)
  const projectJson = MsgPack().decode(projectMpk).project
  const project = Delir.Exporter.deserializeProject(projectJson)
  const migrated = migrateProject(Delir.ProjectMigrator.migrate(project))

  await context.executeOperation(setActiveProject, {
    project: migrated,
    path,
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
      timeout: NotificationTimeouts.verbose,
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
    timeout: NotificationTimeouts.verbose,
  })
})

export const exportProjectPack = operation(async ({ getStore, executeOperation }, {dist}: {dist: string}) => {
  const project = cloneDeep(getProject(getStore)) as Delir.Entity.Project | null
  if (!project) return

  await executeOperation(notify, {level:'info', timeout: NotificationTimeouts.verbose, message: t(t.k.packageExporting) })

  const tmpDir = path.join(remote.app.getPath('temp'), `delirpp-export-${uuid.v4()}`)
  const fileNames = new Set()
  const assetMap: ProjectPackAssetMap = {}
  await fs.mkdirp(tmpDir)
  await Promise.all(
    (project.assets as Delir.Entity.Asset[]).map(async asset => {
      const assetPath = /^file:\/\/(.*)$/.exec(asset.path)?.[1]
      if (!assetPath) return

      const sourceFileName = path.basename(assetPath)
      let distFileName: string = sourceFileName
      {
        let idx = 0
        while (true) {
          if (!fileNames.has(distFileName)) break
          idx++
          const {name, ext} = path.parse(sourceFileName)
          distFileName = `${name} (${idx})${ext}`
        }
      }
      fileNames.add(distFileName)

      const ext = path.extname(assetPath)
      const tmpName = `${uuid.v4()}${ext}`
      assetMap[asset.id] = { fileName: distFileName, tmpName}
      asset.patch({path: tmpName})
      await fs.copyFile(assetPath, path.join(tmpDir, tmpName))
    }),
  )

  // Erase privacy data (path)
  project.assets.forEach(asset => asset.patch({path: ''}))

  await fs.writeFile(path.join(tmpDir, 'project.msgpack'), (MsgPack().encode({
    project: Delir.Exporter.serializeProject(project),
    assets: assetMap
  }) as any) as Buffer)

  const archive = archiver('zip', {zlib:{level:9}})
  archive.pipe(fs.createWriteStream(dist))
  archive.directory(tmpDir, false)
  await archive.finalize()
  await executeOperation(notify, {level:'info', timeout: NotificationTimeouts.verbose, message: t(t.k.packageExportCompleted) })
})

export const importProjectPack = operation(async ({executeOperation}, { src, dist: distDir }: {src: string, dist: string}) => {
  const tmpDir = path.join(remote.app.getPath('temp'), `delirpp-import-${uuid.v4()}`)
  await fs.mkdirp(tmpDir)

  await new Promise(resolve => {
    fs.createReadStream(src)
      .pipe(unzipper.Extract({ path: tmpDir }))
      .once('close',resolve)
  })

  const msgpack = MsgPack()
  const packProjectPath = path.join(tmpDir, 'project.msgpack')
  const {project: rawProject, assets} = msgpack.decode(await fs.readFile(packProjectPath))
  const project = Delir.Exporter.deserializeProject(rawProject)

  // Restore asset paths
  await Promise.all(Object.entries(assets as ProjectPackAssetMap).map(async ([id, {fileName, tmpName}]) => {
    const asset = project.findAsset(id)!
    await fs.rename(path.join(tmpDir, tmpName), path.join(tmpDir, fileName))
    asset.patch({path: path.join(/* Target to finalized dir */distDir, fileName) })
  }))

  // Save project to .delir
  const packFileName = path.parse(src).name
  const tmpProjectPath = path.join(tmpDir, `${packFileName}.delir`)

  await fs.writeFile(tmpProjectPath, msgpack.encode({
    project: Delir.Exporter.serializeProject(project)
  }))

  // Finalize
  await fs.remove(packProjectPath)
  const files = await glob(`**`, {cwd: tmpDir, absolute: true})
  await Promise.all(files.map(async file => {
    const distName = path.relative(tmpDir, file)
    await fs.move(file, path.join(distDir, distName))
  }))

  const projectPath = path.join(distDir, `${packFileName}.delir`)
  await executeOperation(setActiveProject, {project, path: projectPath})
})

export const changePreferenceOpenState = operation((context, { open }: { open: boolean }) => {
  context.dispatch(EditorActions.changePreferenceOpenState, {
    open,
  })
})

//
// Internal clipboard
//
export const copyClips = operation(({getStore, dispatch}) => {
    const clipIds = getSelectedClipIds(getStore)
    const comp = getActiveComp(getStore)!
    const firstLayerIndexOfSelection = comp.layers.findIndex(layer => !!layer.findClip(clipIds[0]))

    const entities: ClipboardEntryClip['entities'] = []
    let offset = 0
    for (let idx = firstLayerIndexOfSelection; idx < comp.layers.length; idx++) {
      const layer = comp.layers[idx]

      // find clips in current layer
      const containedClips = clipIds
        .map(clipId => layer.findClip(clipId))
        .filter((clip): clip is Delir.Entity.Clip => !!clip)

      entities[offset] = {offset, clips: containedClips}
      offset++
    }


    dispatch(EditorActions.setClipboardEntry, {
      entry: { type: 'clip', entities },
    })
  },
)

export const cutClips = operation(({executeOperation, getStore}) => {
  executeOperation(copyClips)
  executeOperation(ProjectOps.removeClips, { clipIds: getSelectedClipIds(getStore) })
})

export const pasteClipIntoLayer = operation(async (context, { layerId }: { layerId: string }) => {
  const entry = getClipboardEntry(context.getStore)
  if (!entry || entry.type !== 'clip') return

  const {entities} = entry
  const project = getProject(context.getStore)!
  const placedFrame = getCurrentPreviewFrame(context.getStore)
  const composition = project.findLayerOwnerComposition(layerId)!
  const firstLayerIdxOfEntity = composition.layers.findIndex(layer => layer.id === layerId)
  const headClipPlacedFrame = entities
    .flatMap(({clips}) => clips)
    .reduce((headPlacedFrame: number, next) => Math.min(headPlacedFrame, next.placedFrame), Infinity)

  const commands: Command[] = []
  for (const {offset, clips} of entities) {
    const layer = composition.layers[Math.min(firstLayerIdxOfEntity + offset, composition.layers.length - 1)]

    for (const sourceClip of clips) {
      const clip = sourceClip.clone()

      clip.patch({
        placedFrame: (sourceClip.placedFrame - headClipPlacedFrame) + placedFrame,
      })

      context.dispatch(ProjectActions.addClip, {
        targetLayerId: layer.id,
        newClip: clip,
      })

      commands.push(new AddClipCommand(composition.id, layer.id, clip))
    }
  }

  await context.executeOperation(HistoryOps.pushHistory, {
    command: new HistoryGroup(commands),
  })


  await context.executeOperation(seekPreviewFrame, {})
})
