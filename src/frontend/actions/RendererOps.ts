import { operation } from '@ragg/fleur'
import * as Delir from 'delir-core'
import { remote } from 'electron'
import { join } from 'path'

import { RendererActions } from './actions'
import * as AppOps from './App'

export const loadPlugins = operation(async (context) => {
    const userDir = remote.app.getPath('appData')
    const loader = new Delir.PluginSupport.FSPluginLoader()

    const loaded = [
        await loader.loadPackageDir(join(remote.app.getAppPath(), '/plugins')),
        await loader.loadPackageDir(join(userDir, '/delir/plugins')),
    ]

    const successes = [].concat(...loaded.map<any>(({loaded}) => loaded))
    const fails = [].concat(...loaded.map<any>(({failed}) => failed))

    if (fails.length > 0) {
        const failedPlugins = fails.map((fail: any) => fail.package).join(', ')
        const message = fails.map((fail: any) => fail.reason).join('\n\n')

        await context.executeOperation(AppOps.notify, {
            message: `${failedPlugins}`,
            title: `Failed to load ${fails.length} plugins`,
            level: 'error',
            timeout: 5000,
            detail: message,
        })
    }

    __DEV__ && console.log('Plugin loaded', successes, 'Failed:', fails)
    context.dispatch(RendererActions.addPlugins, { plugins: loaded })
})

export const setPreviewCanvas = operation((context, arg: { canvas: HTMLCanvasElement }) => {
    context.dispatch(RendererActions.setPreviewCanvas, arg)
})
