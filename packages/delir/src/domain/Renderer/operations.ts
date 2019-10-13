import * as Delir from '@delirvfx/core'
import { operation } from '@fleur/fleur'
import { remote } from 'electron'
import { exists } from 'fs-extra'
import { join } from 'path'
import Watchpack from 'watchpack'

import { NotificationTimeouts } from 'domain/Editor/models'
import { getAllPreferences, getDevelopPluginDirs } from 'domain/Preference/selectors'
import { keepAliveOperation } from 'utils/keepAliveOperation'
import EditorStore from '../Editor/EditorStore'
import * as EditorOps from '../Editor/operations'
import { RendererActions } from './actions'
import FSPluginLoader from './FSPluginLoader'
import { getLoadedPlugins } from './selectors'

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

  const developmentPluginDirs = getDevelopPluginDirs(getStore)

  const wp = new Watchpack({
    aggregateTimeout: 1000,
  })
  wp.watch([], developmentPluginDirs, Date.now())

  wp.on('aggregated', async (changes: string[]) => {
    const updatedPackages: any[] = []
    const failedPackages: ErrorEntry[] = []

    for (const packageDir of changes) {
      try {
        const packageJsonPath = join(packageDir, 'package.json')
        if (!(await (exists as any)(packageJsonPath))) return

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
  })

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
