import { operation } from '@ragg/fleur'
import { remote } from 'electron'
import { join } from 'path'

import EditorStore from '../Editor/EditorStore'
import * as EditorOps from '../Editor/operations'
import PreferenceStore from '../Preference/PreferenceStore'
import { RendererActions } from './actions'
import FSPluginLoader from './FSPluginLoader'

export const loadPlugins = operation(async context => {
    const userDir = remote.app.getPath('appData')
    const loader = new FSPluginLoader()

    const loaded = [
        await (__DEV__
            ? loader.loadPackageDir(join((global as any).__dirname, '../plugins'))
            : { loaded: [], failed: [] }),
        await (!__DEV__
            ? loader.loadPackageDir(join(remote.app.getAppPath(), '/plugins'))
            : { loaded: [], failed: [] }),
        await loader.loadPackageDir(join(userDir, '/delir/plugins')),
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
    context.dispatch(RendererActions.addPlugins, { plugins: successes })
})

export const setPreviewCanvas = operation((context, arg: { canvas: HTMLCanvasElement }) => {
    context.dispatch(RendererActions.setPreviewCanvas, arg)
})

export const startPreview = operation(
    (context, { compositionId, beginFrame }: { compositionId: string; beginFrame?: number }) => {
        beginFrame = beginFrame != null ? beginFrame : context.getStore(EditorStore).currentPointFrame
        const preference = context.getStore(PreferenceStore).getPreferences()

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
