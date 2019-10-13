import { selector } from '@fleur/fleur'
import PreferenceStore from './PreferenceStore'

export const getDevelopPluginDirs = selector(getState => getState(PreferenceStore).develop.pluginDirs)

export const getAudioVolume = selector(getState => getState(PreferenceStore).editor.audioVolume)

export const getAllPreferences = selector(getState => getState(PreferenceStore))
