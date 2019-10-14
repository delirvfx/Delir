import * as Delir from '@delirvfx/core'
import { selector } from '@fleur/fleur'
import ProjectStore from './ProjectStore'

export const getProject = selector((getState) => getState(ProjectStore).project as Delir.Entity.Project | null)

export const getAssetById = selector([getProject], ([project], assetId: string) => {
  return project ? project.findAsset(assetId) : null
})

export const getCompositionById = selector([getProject], ([project], compositionId: string) => {
  return project?.findComposition(compositionId) ?? null
})

export const getClipById = selector((getState, clipId: string) => {
  const { project } = getState(ProjectStore)
  if (!project) return []
  return project.findClip(clipId)
})

export const getClipsByIds = selector((getState, clipIds: string[]) => {
  const { project } = getState(ProjectStore)
  if (!project) return []
  return clipIds.map(id => project.findClip(id))
})
