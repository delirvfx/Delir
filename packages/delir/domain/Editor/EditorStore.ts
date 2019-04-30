import * as Delir from '@delirvfx/core'
import { listen, Store } from '@ragg/fleur'

import { ProjectActions } from '../Project/actions'
import { EditorActions } from './actions'
import { DragEntity } from './operations'
import { ClipboardEntry, ParameterTarget } from './types'

export interface NotificationEntry {
    id: string
    title?: string
    message?: string
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
    currentPreviewFrame: number
    preferenceOpened: boolean
    clipboard: ClipboardEntry | null
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
        currentPreviewFrame: 0,
        preferenceOpened: false,
        clipboard: null,
        notifications: [],
    }

    private handleSetActiveProject = listen(EditorActions.setActiveProjectAction, payload => {
        // tslint:disable-next-line:no-console
        __DEV__ && console.log('✨ Project activated', payload.project)

        this.updateWith(draft => {
            ;(draft.project as EditorState['project']) = payload.project
            draft.projectPath = payload.path!

            // No clear activeComposition etc, if project saved as new file
            if (payload.project !== this.state.project) {
                draft.activeComp = null
                draft.activeClip = null
                draft.activeParam = null
            }
        })
    })

    private handleRemoveComposition = listen(ProjectActions.removeCompositionAction, payload => {
        if (this.state.activeComp && this.state.activeComp.id === payload.targetCompositionId) {
            this.updateWith(draft => {
                draft.activeComp = null
                draft.activeClip = null
                draft.activeParam = null
            })
        }
    })

    private handleRemoveLayer = listen(ProjectActions.removeLayerAction, ({ targetLayerId }) => {
        const { activeClip, project } = this.state
        if (!activeClip) return
        if (!this.state.project) return

        const clipOwnedLayer = project!.findClipOwnerLayer(activeClip.id)

        // Reset selected clip if removed layer contains selected clip
        clipOwnedLayer &&
            this.updateWith(d => {
                d.activeClip = null
                d.activeParam = null
            })
    })

    private handleRemoveClip = listen(ProjectActions.removeClipAction, payload => {
        const { activeClip } = this.state

        if (activeClip && activeClip.id === payload.targetClipId) {
            this.updateWith(draft => {
                draft.activeClip = null
                draft.activeParam = null
            })
        }
    })

    private handleRemoveEffect = listen(ProjectActions.removeEffectFromClipAction, payload => {
        const { activeParam } = this.state
        if (activeParam && activeParam.type === 'effect' && payload.targetEffectId === activeParam.entityId) {
            this.updateWith(draft => (draft.activeParam = null))
        }
    })

    private handlesetDragEntity = listen(EditorActions.setDragEntityAction, payload => {
        this.updateWith(d => ((d.dragEntity as DragEntity) = payload))
    })

    private handleclearDragEntity = listen(EditorActions.clearDragEntityAction, () => {
        this.updateWith(d => (d.dragEntity = null))
    })

    private handleChangeActiveComposition = listen(EditorActions.changeActiveCompositionAction, ({ compositionId }) => {
        const { project, activeComp } = this.state
        if (project == null) return

        const comp = project.findComposition(compositionId)!
        if (activeComp && comp.id === activeComp.id) return

        this.updateWith(d => {
            ;(d.activeComp as EditorState['activeComp']) = comp
            d.activeClip = null
            d.activeParam = null
        })
    })

    private handleChangeActiveClip = listen(EditorActions.changeActiveClipAction, payload => {
        const { project } = this.state
        if (project == null) return

        const clip = project.findClip(payload.clipId)
        this.updateWith(d => {
            ;(d.activeClip as EditorState['activeClip']) = clip
            d.activeParam = null
        })
    })

    private handleChangeActiveParam = listen(EditorActions.changeActiveParamAction, ({ target }) => {
        const { project } = this.state
        if (project == null) return

        this.updateWith(draft => {
            if (target) {
                const clip =
                    target.type === 'clip'
                        ? project.findClip(target.entityId)
                        : project.findEffectOwnerClip(target.entityId)
                ;(draft.activeClip as EditorState['activeClip']) = clip
            }

            draft.activeParam = target
        })
    })

    private handleupdateProcessingState = listen(EditorActions.updateProcessingStateAction, payload => {
        this.updateWith(d => (d.processingState = payload.stateText))
    })

    private handleseekPreviewFrame = listen(EditorActions.seekPreviewFrameAction, payload => {
        this.updateWith(d => (d.currentPreviewFrame = Math.round(payload.frame)))
    })

    private handleaddMessage = listen(EditorActions.addMessageAction, payload => {
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

    private handleRemoveMessage = listen(EditorActions.removeMessageAction, payload => {
        this.updateWith(d => {
            const idx = d.notifications.findIndex(entry => entry!.id === payload.id)
            d.notifications.splice(idx, 1)
        })
    })

    private handleChangePreferenceOpenState = listen(EditorActions.changePreferenceOpenStateAction, ({ open }) => {
        this.updateWith(draft => (draft.preferenceOpened = open))
    })

    private handleSetClipboardEntry = listen(EditorActions.setClipboardEntry, payload => {
        this.updateWith(draft => (draft.clipboard = payload.entry))
    })

    public get currentPointFrame() {
        return this.state.currentPreviewFrame
    }

    public getActiveParam() {
        return this.state.activeParam
    }

    public get project() {
        return this.state.project
    }

    public get activeComp() {
        return this.state.activeComp ? { ...this.state.activeComp } : null
    }

    public get activeClip() {
        return this.state.activeClip ? { ...this.state.activeClip } : null
    }

    public get dragEntity() {
        return this.state.dragEntity
    }

    /** @deprecated */
    public getActiveComposition() {
        return this.state.activeComp ? { ...this.state.activeComp } : null
    }

    public getClipboardEntry() {
        return this.state.clipboard
    }

    public getState() {
        return this.state
    }
}
