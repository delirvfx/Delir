import { action, actions } from '@fleur/fleur'

import { Preference } from './PreferenceStore'

type DeepPartial<T extends object> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }

export const PreferenceActions = actions('Preference', {
    restorePreference: action<{ preference: Preference }>(),
    changePreference: action<{ patch: DeepPartial<Preference> }>(),
})
