import { operation } from '@ragg/fleur'
import { remote } from 'electron'
import { join } from 'path'

import * as EditorOps from '../Editor/operations'
import { RendererActions } from './actions'
import FSPluginLoader from './FSPluginLoader'

export const loadPlugins = operation(async (context) => {
    const userDir = remote.app.getPath('appData')
    const loader = new FSPluginLoader()

    const loaded = [
        await (__DEV__ ? loader.loadPackageDir(join((global as any).__dirname, '../plugins')) : []),
        await loader.loadPackageDir(join(userDir, '/delir/plugins')),
    ]

    const successes = [].concat(...loaded.map<any>(({loaded}) => loaded))
    const fails = [].concat(...loaded.map<any>(({failed}) => failed))

    if (fails.length > 0) {
        const failedPlugins = fails.map((fail: any) => fail.package).join(', ')
        const message = fails.map((fail: any) => fail.reason).join('\n\n')

        await context.executeOperation(EditorOps.notify, {
            message: `${failedPlugins}`,
            title: `Failed to load ${fails.length} plugins`,
            level: 'error',
            timeout: 5000,
            detail: message,
        })
    }

    __DEV__ && console.log('Plugin loaded', successes, 'Failed:', fails)
    context.dispatch(RendererActions.addPlugins, { plugins: successes })
})

export const setPreviewCanvas = operation((context, arg: { canvas: HTMLCanvasElement }) => {
    context.dispatch(RendererActions.setPreviewCanvas, arg)
})
