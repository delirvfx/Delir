import { action, actions } from '@ragg/fleur'

import { Preference } from './PreferenceStore'

export const PreferenceActions = actions('Preference', {
    restorePreference: action<{ preference: Preference }>(),
    changePreference: action<{ patch: Partial<Preference> }>(),
})
