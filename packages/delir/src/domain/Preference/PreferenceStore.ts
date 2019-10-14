import { listen, reducerStore, Store } from '@fleur/fleur'
import _ from 'lodash'

import { PreferenceActions } from './actions'

export interface Preference {
  editor: {
    /** Audio volume of 0 to 100 */
    audioVolume: number
  }
  develop: {
    pluginDirs: string[]
  }
  renderer: {
    ignoreMissingEffect: boolean
  }
}

export const defaultPreferance = {
  editor: {
    audioVolume: 100,
  },
  develop: {
    pluginDirs: [],
  },
  renderer: {
    ignoreMissingEffect: false,
  },
}

export default reducerStore<Preference>('PreferenceStore', () => ({ ...defaultPreferance }))
  .listen(PreferenceActions.restorePreference, (draft, { preference }) => {
    _.merge(draft, preference)
  })
  .listen(PreferenceActions.changePreference, (draft, { patch }) => {
    _.merge(draft, patch)
  })
  .listen(PreferenceActions.changeDevelopPluginDirs, (draft, { dirs }) => {
    draft.develop.pluginDirs = dirs
  })
