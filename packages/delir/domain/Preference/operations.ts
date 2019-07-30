import { operation, OperationContext } from '@fleur/fleur'
import { remote } from 'electron'
import { existsSync, readFileSync, writeFile } from 'fs'
import _ from 'lodash'
import path from 'path'

import * as EditorOps from '../Editor/operations'
import { RendererActions } from '../Renderer/actions'
import { PreferenceActions } from './actions'

import PreferenceStore, { defaultPreferance, Preference } from './PreferenceStore'
import { validateSchema } from './validation'

const userDir = remote.app.getPath('userData')
const preferencePath = path.join(userDir, 'preferences.json')

export const restoreApplicationPreference = operation(context => {
    if (!existsSync(preferencePath)) {
        return
    }

    const json = readFileSync(preferencePath, { encoding: 'UTF-8' })

    let preference: Preference
    try {
        preference = _.defaultsDeep(JSON.parse(json), defaultPreferance)
    } catch {
        context.executeOperation(EditorOps.notify, {
            title: 'App preference loading failed',
            message: 'preferences.json invalid. Use initial preference instead.',
            level: 'error',
            timeout: 5000,
        })

        return
    }

    const error = validateSchema(preference)

    if (error) {
        context.executeOperation(EditorOps.notify, {
            title: 'App preference loading failed',
            message: 'preferences.json invalid. Use initial preference instead.\n' + error.message,
            level: 'error',
            timeout: 5000,
        })

        return
    }

    context.dispatch(RendererActions.setAudioVolume, { volume: preference.editor.audioVolume })
    context.dispatch(PreferenceActions.restorePreference, { preference })
})

export const savePreferences = (() => {
    let timeout: number = -1

    const executeSave = async (context: OperationContext) => {
        const preference = context.getStore(PreferenceStore).dehydrate()
        writeFile(preferencePath, JSON.stringify(preference, null, 2), err => {
            // tslint:disable-next-line:no-console
            err && console.error(err)
        })
    }

    return operation(async context => {
        clearTimeout(timeout)
        timeout = (setTimeout(executeSave, 1000, context) as unknown) as number
    })
})()

export const setAudioVolume = operation(async (context, volume: number) => {
    context.dispatch(PreferenceActions.changePreference, {
        patch: {
            editor: { audioVolume: volume },
        },
    })

    context.dispatch(RendererActions.setAudioVolume, { volume })
    await context.executeOperation(savePreferences)
})

export const setRendererIgnoreMissingEffectPreference = operation(async (context, { ignore }: { ignore: boolean }) => {
    context.dispatch(PreferenceActions.changePreference, {
        patch: { renderer: { ignoreMissingEffect: ignore } },
    })
    await context.executeOperation(savePreferences)
})
