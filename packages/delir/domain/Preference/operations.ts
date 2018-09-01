import { operation } from '@ragg/fleur'
import { remote } from 'electron'
import { existsSync, readFileSync, writeFile } from 'fs'
import * as path from 'path'

import * as AppOps from '../../actions/App'
import { PreferenceActions } from './actions'

import PreferenceStore from '@ragg/delir/domain/Preference/PreferenceStore'
import { validateSchema } from './validation'

const userDir = remote.app.getPath('userData')
const preferencePath = path.join(userDir, 'preferences.json')

export const restoreApplicationPreference = operation((context) => {
    if (!existsSync(preferencePath)) {
        return
    }

    const json = readFileSync(preferencePath, { encoding: 'UTF-8' })

    let preference: any
    try {
        preference = JSON.parse(json)
    } catch {
        context.executeOperation(AppOps.notify, {
            title: 'App preference loading failed',
            message: 'preferences.json invalid. Use initial preference instead.',
            level: 'error',
            timeout: 5000,
        })

        return
    }

    const error = validateSchema(preference)

    if (error) {
        context.executeOperation(AppOps.notify, {
            title: 'App preference loading failed',
            message: 'preferences.json invalid. Use initial preference instead.\n' + error.message,
            level: 'error',
            timeout: 5000,
        })

        return
    }

    context.dispatch(PreferenceActions.restorePreference, { preference })
})

export const savePreferences = operation(async (context) => {
    const preference = context.getStore(PreferenceStore).dehydrate()
    await new Promise((resolve, reject) => writeFile(preferencePath, JSON.stringify(preference), (err) => {
        err ? reject(err) : resolve()
    }))
})

export const setRendererIgnoreMissingEffectPreference = operation(async (context, { ignore }: { ignore: boolean }) => {
    context.dispatch(PreferenceActions.changePreference, { patch: { renderer: { ignoreMissingEffect: ignore } } })
    await context.executeOperation(savePreferences, {})
})
