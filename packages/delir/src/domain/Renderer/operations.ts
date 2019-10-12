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
      ? FSPluginLoader.loadPackageDir(join((global as any).__dirname, '../plugins'))
      : { loaded: [], failed: [] }),
    await (!__DEV__
      ? FSPluginLoader.loadPackageDir(join(remote.app.getAppPath(), '/plugins'))
      : { loaded: [], failed: [] }),
    await FSPluginLoader.loadPackageDir(join(userDir, '/delir/plugins')),
  ]

  const successes = [].concat(...loaded.map<any>(({ loaded }) => loaded))
  const fails = [].concat(...loaded.map<any>(({ failed }) => failed))

  if (fails.length > 0) {
    const failedPlugins = fails.map((fail: any) => fail.package).join(', ')
    const message = fails.map((fail: any) => fail.reason).join('\n\n')

    await context.executeOperation(EditorOps.notify, {
      message: `${failedPlugins}`,
      title: `Failed to load ${fails.length} plugins`,
      level: 'error',
      detail: message,
    })
  }

  // tslint:disable-next-line:no-console
  __DEV__ && console.log('Plugin loaded', successes, 'Failed:', fails)
  context.dispatch(RendererActions.registerPlugins, { plugins: successes })
})

export const watchDevelopmentPlugins = keepAliveOperation(({ getStore, dispatch, executeOperation }) => {
  const developmentPluginDirs = getDevelopPluginDirs(getStore)

  const wp = new Watchpack({
    aggregateTimeout: 1000,
  })
  wp.watch([], developmentPluginDirs, Date.now())

  wp.on('aggregated', async (changes: string[]) => {
    const plugins = getLoadedPlugins(getStore)
    const updatedPackages: any[] = []
    for (const packageDir of changes) {
      const packageJsonPath = join(packageDir, 'package.json')
      if (!(await (exists as any)(packageJsonPath))) return

      const packageInfo = await FSPluginLoader.loadPackage(packageDir)
      const changedPlugin = plugins.find((entry: any) => entry.id === packageInfo.id)
      if (!changedPlugin) return

      updatedPackages.push(packageInfo)
    }

    const updatedIds = updatedPackages.map((packageInfo: any) => packageInfo.id)
    dispatch(RendererActions.unregisterPlugins, { ids: updatedIds })
    dispatch(RendererActions.registerPlugins, { plugins: updatedPackages })
    dispatch(RendererActions.clearCache)

    await executeOperation(EditorOps.notify, {
      level: 'info',
      title: 'Dev: Plugin has been reloaded',
      message: updatedIds.map(id => `- ${id}`).join('\n'),
      timeout: NotificationTimeouts.verbose,
    })
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
