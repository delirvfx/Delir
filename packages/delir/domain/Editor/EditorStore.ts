import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { listen, Store } from '@ragg/fleur'
import { ProjectModActions } from '../../actions/actions'
import { EditorActions } from './actions'
import { DragEntity } from './operations'

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
        dragEntity: null,
        processingState: null,
        previewPlayed: false,
        currentPreviewFrame: 0,
        preferenceOpened: false,
        notifications: []
    }

    // @ts-ignore
    private handlesetActiveProject = listen(EditorActions.setActiveProjectAction, (payload) => {
        __DEV__ && console.log('✨ Project activated', payload.project)

        this.updateWith(draft => {
            draft.project = payload.project
            draft.projectPath = payload.path!

            // No clear activeComposition etc, if project saved as new file
            if (payload.project !== this.state.project) {
                draft.activeComp = null
                draft.activeClip = null
            }
        })
    })

    // @ts-ignore
    private handleclearActiveProject = listen(EditorActions.clearActiveProjectAction, () => {
        __DEV__ && console.log('💥 Project deactivated')

        this.updateWith(draft => {
            Object.assign(draft, {
                project: null,
                activeComp: null,
                activeClip: null,
            })
        })
    })

    // @ts-ignore
    private handleRemoveClip = listen(ProjectModActions.removeClipAction, (payload) => {
        const { activeClip } = this.state

        if (activeClip && activeClip.id === payload.targetClipId) {
            this.updateWith(draft => draft.activeClip = null)
        }
    })

    // @ts-ignore
    private handleRemoveLayer = listen(ProjectModActions.removeLayerAction, ({ targetLayerId }) => {
        const { activeClip } = this.state
        if (!activeClip) return
        if (!this.state.project) return

        const clipContainedLayer = ProjectHelper.findParentLayerByClipId(this.state.project, activeClip.id)

        // Reset selected clip if removed layer contains selected clip
        clipContainedLayer && this.updateWith(d => d.activeClip = null)
    })

    // @ts-ignore
    private handlesetDragEntity = listen(EditorActions.setDragEntityAction, (payload) => {
        this.updateWith(d => d.dragEntity = payload)
    })

    // @ts-ignore
    private handleclearDragEntity = listen(EditorActions.clearDragEntityAction, () => {
        this.updateWith(d => d.dragEntity = null)
    })

    // @ts-ignore
    private handleChangeActiveComposition = listen(EditorActions.changeActiveCompositionAction, ({ compositionId }) => {
        if (this.state.project == null) return

        const comp = ProjectHelper.findCompositionById(this.state.project, compositionId)

        this.updateWith(d => {
            d.activeComp = comp
            d.activeClip = null
        })
    })

    // @ts-ignore
    private handlechangeActiveClip = listen(EditorActions.changeActiveClipAction, (payload) => {
        if (this.state.project == null) return

        const clip = ProjectHelper.findClipById(this.state.project, payload.clipId)
        this.updateWith(d => d.activeClip = clip)
    })

    // @ts-ignore
    private handleupdateProcessingState = listen(EditorActions.updateProcessingStateAction, (payload) => {
        this.updateWith(d => d.processingState = payload.stateText)
    })

    // @ts-ignore
    private handlestartPreview = listen(EditorActions.startPreviewAction, () => {
        this.updateWith(d => d.previewPlayed = true)
    })

    // @ts-ignore
    private handlestopPreview = listen(EditorActions.stopPreviewAction, () => {
        this.updateWith(d => d.previewPlayed = false)
    })

    // @ts-ignore
    private handleseekPreviewFrame = listen(EditorActions.seekPreviewFrameAction, (payload) => {
        this.updateWith(d => d.currentPreviewFrame = Math.round(payload.frame))
    })

    // @ts-ignore
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

    // @ts-ignore
    private handleRemoveMessage = listen(EditorActions.removeMessageAction, (payload) => {
        this.updateWith(d => {
            const idx = d.notifications.findIndex(entry => entry!.id === payload.id)
            d.notifications.splice(idx, 1)
        })
    })

    // @ts-ignore
    private handleChangePreferenceOpenState = listen(EditorActions.changePreferenceOpenStateAction, ({ open }) => {
        this.updateWith(draft => draft.preferenceOpened = open)
    })

    public getState() {
        return this.state
    }
}
