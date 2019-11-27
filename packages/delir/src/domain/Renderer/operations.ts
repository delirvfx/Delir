import * as Delir from '@delirvfx/core'
import { operation } from '@fleur/fleur'
import deream, { EncodingOption, RenderingProgress } from '@ragg/deream'
import { remote } from 'electron'
import { exists } from 'fs-extra'
import { join } from 'path'
import { dirname } from 'path'
import Watchpack from 'watchpack'

import { Platform } from 'utils/platform'

import { NotificationTimeouts } from 'domain/Editor/models'
import { getActiveComp } from 'domain/Editor/selectors'
import { getAllPreferences, getDevPluginDirs } from 'domain/Preference/selectors'
import { getProject } from 'domain/Project/selectors'
import { keepAliveOperation } from 'utils/keepAliveOperation'
import EditorStore from '../Editor/EditorStore'
import * as EditorOps from '../Editor/operations'
import { RendererActions } from './actions'
import FSPluginLoader from './FSPluginLoader'
import t from './operations.i18n'
import RendererStore from './RendererStore'

export const loadPlugins = operation(async context => {
  const userDir = remote.app.getPath('appData')

  const loaded = [
    await (__DEV__
      ? FSPluginLoader.loadPackageDirs(join((global as any).__dirname, '../plugins'))
      : { loaded: [], failed: [] }),
    await (!__DEV__
      ? FSPluginLoader.loadPackageDirs(join(remote.app.getAppPath(), '/plugins'))
      : { loaded: [], failed: [] }),
    await FSPluginLoader.loadPackageDirs(join(userDir, '/delir/plugins')),
  ]

  const successes = [].concat(...loaded.map<any>(({ loaded }) => loaded))
  const fails = [].concat(...loaded.map<any>(({ failed }) => failed))

  if (fails.length > 0) {
    const failedPlugins = fails.map((fail: any) => fail.package).join(', ')
    const message = fails
      .map((fail: any) => `${fail.package}\n${fail.reason.map((r: string) => `  - ${r}\n`)}`)
      .join('\n')

    await context.executeOperation(EditorOps.notify, {
      title: `Failed to load ${fails.length} plugins`,
      message: `${failedPlugins}`,
      level: 'error',
      detail: message,
    })
  }

  // tslint:disable-next-line:no-console
  __DEV__ && console.log('Plugin loaded', successes, 'Failed:', fails)
  context.dispatch(RendererActions.registerPlugins, { plugins: successes })
})

export const watchDevelopmentPlugins = keepAliveOperation(({ getStore, dispatch, executeOperation }) => {
  interface ErrorEntry {
    package: string
    reasons: string[]
  }

  const devPluginDirs = getDevPluginDirs(getStore)

  const handleChanges = async (changedDirs: string[]) => {
    const updatedPackages: any[] = []
    const failedPackages: ErrorEntry[] = []

    for (const packageDir of changedDirs) {
      try {
        const packageJsonPath = join(packageDir, 'package.json')

        if (!(await (exists as any)(packageJsonPath))) {
          failedPackages.push({
            package: packageDir,
            reasons: [`package.json not found`],
          })

          continue
        }

        const packageInfo = await FSPluginLoader.loadPackage(packageDir)

        const valid = Delir.PluginRegistry.validateEffectPluginPackageJSON(packageInfo.packageJson)
        if (valid.hasError) {
          failedPackages.push({
            package: packageInfo.id,
            reasons: valid.reason,
          })
          continue
        }

        updatedPackages.push(packageInfo)
      } catch (e) {
        failedPackages.push({
          package: packageDir,
          reasons: [`Error: ${e.message}`],
        })
      }
    }

    const updatedIds = updatedPackages.map((packageInfo: any) => packageInfo.id)
    await executeOperation(stopPreview)
    dispatch(RendererActions.unregisterPlugins, { ids: updatedIds })
    dispatch(RendererActions.registerPlugins, { plugins: updatedPackages })
    dispatch(RendererActions.clearCache, {})

    if (failedPackages.length) {
      await executeOperation(EditorOps.notify, {
        level: 'error',
        title: 'Dev: Failed to reload plugins',
        detail: failedPackages
          .map(entry => `${entry.package}\n${entry.reasons.map(r => `  - ${r}`).join('\n')}`)
          .join('\n'),
        timeout: NotificationTimeouts.error,
      })
    }

    if (updatedPackages.length) {
      await executeOperation(EditorOps.notify, {
        level: 'info',
        title: 'Dev: Plugins has been reloaded',
        detail: updatedIds.map(id => `- ${id}`).join('\n'),
        timeout: NotificationTimeouts.verbose,
      })
    }
  }

  const wp = new Watchpack({
    aggregateTimeout: 1000,
  })
  wp.watch([], devPluginDirs, Date.now())
  wp.on('aggregated', handleChanges)

  // Load plugins
  handleChanges(devPluginDirs)

  return () => wp.close()
})

export const setPreviewCanvas = operation((context, arg: { canvas: HTMLCanvasElement }) => {
  context.dispatch(RendererActions.setPreviewCanvas, arg)
})

export const startPreview = operation(
  (context, { compositionId, beginFrame }: { compositionId: string; beginFrame?: number }) => {
    beginFrame = beginFrame != null ? beginFrame : context.getStore(EditorStore).currentPointFrame
    const preference = getAllPreferences(context.getStore)

    context.dispatch(RendererActions.startPreview, {
      compositionId,
      beginFrame,
      ignoreMissingEffect: preference.renderer.ignoreMissingEffect,
    })
  },
)

export const stopPreview = operation(context => {
  context.dispatch(RendererActions.stopPreview, {})
})

export const renderDestinate = operation(
  async (
    context,
    {
      compositionId,
      destPath,
      encodingOption,
    }: {
      compositionId: string
      destPath: string
      encodingOption: EncodingOption
    },
  ) => {
    const project = getProject(context.getStore)
    const composition = getActiveComp(context.getStore)
    const preference = getAllPreferences(context.getStore)
    const { engine, pluginRegistry } = context.getStore(RendererStore)

    const appPath = dirname(remote.app.getPath('exe'))
    const ffmpegBin =
      __DEV__ || Platform.isLinux
        ? 'ffmpeg'
        : require('path').resolve(appPath, Platform.isMacOS ? '../Resources/ffmpeg' : './ffmpeg.exe')

    if (!project || !composition) return

    context.dispatch(RendererActions.setInRenderingStatus, { isInRendering: true })

    try {
      await deream({
        project,
        rootCompId: composition.id,
        encoding: encodingOption,
        exportPath: destPath,
        pluginRegistry: pluginRegistry,
        ignoreMissingEffect: preference.renderer.ignoreMissingEffect,
        temporaryDir: remote.app.getPath('temp'),
        ffmpegBin,
        onProgress: progress => {
          context.dispatch(RendererActions.setRenderingProgress, { progress })
        },
      })
    } catch (e) {
      await context.executeOperation(EditorOps.notify, {
        level: 'error',
        title: t(t.k.renderingFailed.title),
        detail: e.message,
        timeout: NotificationTimeouts.userConfirmationNecessary,
      })

      context.dispatch(RendererActions.setRenderingProgress, { progress: null })
    } finally {
      context.dispatch(RendererActions.setInRenderingStatus, { isInRendering: false })
    }
  },
)
