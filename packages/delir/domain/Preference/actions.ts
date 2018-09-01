import { action } from '@ragg/fleur'

import { Preference } from './PreferenceStore'

export const PreferenceActions = {
    restorePreference: action<{ preference: Preference }>(),
    changePreference: action<{ patch: Partial<Preference> }>(),
}
