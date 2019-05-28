import { StoreGetter } from '@fleur/fleur-react'
import ProjectStore from './ProjectStore'

export const getClipById = (clipId: string) => (getStore: StoreGetter) => {
    const project = getStore(ProjectStore).getProject()
    if (!project) return []
    return project.findClip(clipId)
}

export const getClipsByIds = (clipIds: string[]) => (getStore: StoreGetter) => {
    const project = getStore(ProjectStore).getProject()
    if (!project) return []
    return clipIds.map(id => project.findClip(id))
}
