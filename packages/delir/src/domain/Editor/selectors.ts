import * as Delir from '@delirvfx/core'
import { StoreGetter } from '@fleur/fleur-react'
import { getClipsByIds } from '../Project/selectors'
import EditorStore from './EditorStore'

export const getSelectedClipIds = () => (getStore: StoreGetter) => {
  return getStore(EditorStore).selectClipIds
}

export const getSelectedClips = () => (getStore: StoreGetter) => {
  const clipIds = getStore(EditorStore).selectClipIds
  return getClipsByIds(clipIds)(getStore).filter(clip => clip != null) as Delir.Entity.Clip[]
}

export const getActiveComp = () => (getStore: StoreGetter) => {
  const comp = getStore(EditorStore).activeComp
  return comp
}
