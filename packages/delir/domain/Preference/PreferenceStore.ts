import { listen, Store } from '@ragg/fleur'

import { PreferenceActions } from './actions'

export interface Preference {
    renderer: {
        ignoreMissingEffect: boolean
    }
}

export default class PreferenceStore extends Store<Preference> {
    public static storeName = 'PreferenceStore'

    public state: Preference = {
        renderer: {
            ignoreMissingEffect: false,
        },
    }

    // @ts-ignore
    private restorePreference = listen(PreferenceActions.restorePreference, ({ preference }) => {
        this.updateWith(draft => Object.assign(draft, preference))
    })

    // @ts-ignore
    private handlePreferenceChange = listen(PreferenceActions.changePreference, ({ patch }) => {
        this.updateWith(draft => { Object.assign(draft, patch) })
    })

    public getPreferences() {
        return this.state
    }
}
