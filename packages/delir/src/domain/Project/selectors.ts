import { selector } from '@fleur/fleur'
import ProjectStore from './ProjectStore'

export const getProject = selector(getState => getState(ProjectStore).project)

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
