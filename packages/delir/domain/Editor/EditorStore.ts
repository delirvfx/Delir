import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { listen, Store } from '@ragg/fleur'

import { ProjectActions } from '../Project/actions'
import { EditorActions } from './actions'
import { DragEntity } from './operations'
import { ParameterTarget } from './types'

export interface NotificationEntry {
    id: string
    title?: string
    message: string
    level: 'info' | 'error'
    detail?: string
}

export interface EditorState {
    project: Delir.Entity.Project | null
    projectPath: string | null
    activeComp: Delir.Entity.Composition | null
    activeClip: Delir.Entity.Clip | null
    activeParam: ParameterTarget | null
    dragEntity: DragEntity | null
    processingState: string | null
    previewPlayed: boolean
    currentPreviewFrame: number
    preferenceOpened: boolean
    notifications: NotificationEntry[]
}

export default class EditorStore extends Store<EditorState> {
    public static storeName = 'EditorStore'

    protected state: EditorState = {
        project: null,
        projectPath: null,
        activeComp: null,
        activeClip: null,
        activeParam: null,
        dragEntity: null,
        processingState: null,
        previewPlayed: false,
        currentPreviewFrame: 0,
        preferenceOpened: false,
        notifications: []
    }

    private handlesetActiveProject = listen(EditorActions.setActiveProjectAction, (payload) => {
        __DEV__ && console.log('✨ Project activated', payload.project)

        this.updateWith(draft => {
            draft.project = payload.project
            draft.projectPath = payload.path!

            // No clear activeComposition etc, if project saved as new file
            if (payload.project !== this.state.project) {
                draft.activeComp = null
                draft.activeClip = null
                draft.activeParam = null
            }
        })
    })

    private handleclearActiveProject = listen(EditorActions.clearActiveProjectAction, () => {
        __DEV__ && console.log('💥 Project deactivated')

        this.updateWith(draft => {
            draft.project = null
            draft.activeComp = null
            draft.activeClip = null
            draft.activeParam = null
        })
    })

    private handleRemoveComposition = listen(ProjectActions.removeCompositionAction, (payload) => {
        if (this.state.activeComp && this.state.activeComp.id === payload.targetCompositionId) {
            this.updateWith(draft => {
                draft.activeComp = null
                draft.activeClip = null
                draft.activeParam = null
            })
        }
    })

    private handleRemoveLayer = listen(ProjectActions.removeLayerAction, ({ targetLayerId }) => {
        const { activeClip } = this.state
        if (!activeClip) return
        if (!this.state.project) return

        const clipContainedLayer = ProjectHelper.findParentLayerByClipId(this.state.project, activeClip.id)

        // Reset selected clip if removed layer contains selected clip
        clipContainedLayer && this.updateWith(d => {
            d.activeClip = null
            d.activeParam = null
        })
    })

    private handleRemoveClip = listen(ProjectActions.removeClipAction, (payload) => {
        const { activeClip } = this.state

        if (activeClip && activeClip.id === payload.targetClipId) {
            this.updateWith(draft => {
                draft.activeClip = null
                draft.activeParam = null
            })
        }
    })

    private handleRemoveEffect = listen(ProjectActions.removeEffectFromClipAction, (payload) => {
        const { activeParam } = this.state
        if (activeParam && activeParam.type === 'effect' && payload.targetEffectId === activeParam.entityId) {
            this.updateWith(draft => draft.activeParam = null)
        }
    })

    private handlesetDragEntity = listen(EditorActions.setDragEntityAction, (payload) => {
        this.updateWith(d => d.dragEntity = payload)
    })

    private handleclearDragEntity = listen(EditorActions.clearDragEntityAction, () => {
        this.updateWith(d => d.dragEntity = null)
    })

    private handleChangeActiveComposition = listen(EditorActions.changeActiveCompositionAction, ({ compositionId }) => {
        if (this.state.project == null) return

        const comp = ProjectHelper.findCompositionById(this.state.project, compositionId)

        this.updateWith(d => {
            d.activeComp = comp
            d.activeClip = null
            d.activeParam = null
        })
    })

    private handleChangeActiveClip = listen(EditorActions.changeActiveClipAction, (payload) => {
        if (this.state.project == null) return

        const clip = ProjectHelper.findClipById(this.state.project, payload.clipId)
        this.updateWith(d => {
            d.activeClip = clip
            d.activeParam = null
        })
    })

    private handleChangeActiveParam = listen(EditorActions.changeActiveParamAction, (payload) => {
        this.updateWith(draft => draft.activeParam = payload.target)
    })

    private handleupdateProcessingState = listen(EditorActions.updateProcessingStateAction, (payload) => {
        this.updateWith(d => d.processingState = payload.stateText)
    })

    private handlestartPreview = listen(EditorActions.startPreviewAction, () => {
        this.updateWith(d => d.previewPlayed = true)
    })

    private handlestopPreview = listen(EditorActions.stopPreviewAction, () => {
        this.updateWith(d => d.previewPlayed = false)
    })

    private handleseekPreviewFrame = listen(EditorActions.seekPreviewFrameAction, (payload) => {
        this.updateWith(d => d.currentPreviewFrame = Math.round(payload.frame))
    })

    private handleaddMessage = listen(EditorActions.addMessageAction, (payload) => {
        this.updateWith(d => {
            d.notifications.push({
                id: payload.id,
                title: payload.title,
                message: payload.message!,
                level: payload.level,
                detail: payload.detail,
            })
        })
    })

    private handleRemoveMessage = listen(EditorActions.removeMessageAction, (payload) => {
        this.updateWith(d => {
            const idx = d.notifications.findIndex(entry => entry!.id === payload.id)
            d.notifications.splice(idx, 1)
        })
    })

    private handleChangePreferenceOpenState = listen(EditorActions.changePreferenceOpenStateAction, ({ open }) => {
        this.updateWith(draft => draft.preferenceOpened = open)
    })

    public getActiveParam() {
        return this.state.activeParam
    }

    public getState() {
        return this.state
    }
}
