import * as Delir from '@delirvfx/core'
import { selector, selectorWithStore } from '@fleur/fleur'
import { getClipsByIds, getCompositionById } from '../Project/selectors'
import EditorStore from './EditorStore'

export const getSelectedClipIds = selector(getState => {
  return getState(EditorStore).selectClipIds
})

export const getSelectedClips = selectorWithStore(getStore => {
  const clipIds = getSelectedClipIds(getStore)
  return getClipsByIds(getStore, clipIds).filter(clip => clip != null) as Delir.Entity.Clip[]
})

export const getActiveLayerId = selector(getState => getState(EditorStore).activeLayerId)

export const getActiveComp = selectorWithStore(getStore => {
  const id = getStore(EditorStore).state.activeComp?.id
  if (!id) return null
  return getCompositionById(getStore, id)
})
