import { listen, Store } from '@fleur/fleur'
import * as _ from 'lodash'

import { PreferenceActions } from './actions'

export interface Preference {
    editor: {
        /** Audio volume of 0 to 100 */
        audioVolume: number
    }
    renderer: {
        ignoreMissingEffect: boolean
    }
}

export const defaultPreferance = {
    editor: {
        audioVolume: 100,
    },
    renderer: {
        ignoreMissingEffect: false,
    },
}

export default class PreferenceStore extends Store<Preference> {
    public static storeName = 'PreferenceStore'

    public state: Preference = defaultPreferance

    private restorePreference = listen(PreferenceActions.restorePreference, ({ preference }) => {
        this.updateWith(draft => _.merge(draft, preference))
    })

    private handlePreferenceChange = listen(PreferenceActions.changePreference, ({ patch }) => {
        this.updateWith(draft => {
            _.merge(draft, patch)
        })
    })

    public get audioVolume() {
        return this.state.editor.audioVolume
    }

    public getPreferences() {
        return this.state
    }
}
