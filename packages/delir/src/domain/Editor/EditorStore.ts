import * as Delir from '@delirvfx/core'
import { listen, Store } from '@fleur/fleur'

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
  timeout: number | undefined
}

export interface EditorState {
  project: Delir.Entity.Project | null
  projectPath: string | null
  activeComp: Delir.Entity.Composition | null
  activeLayerId: string | null
  selectClipIds: string[]
  activeParam: ParameterTarget | null
  dragEntity: DragEntity | null
  currentPreviewFrame: number
  preferenceOpened: boolean
  clipboard: ClipboardEntry | null
  notifications: NotificationEntry[]
}

export default class EditorStore extends Store<EditorState> {
  public static storeName = 'EditorStore'

  public state: EditorState = {
    project: null,
    projectPath: null,
    activeComp: null,
    activeLayerId: null,
    selectClipIds: [],
    activeParam: null,
    dragEntity: null,
    currentPreviewFrame: 0,
    preferenceOpened: false,
    clipboard: null,
    notifications: [],
  }

  private handleSetActiveProject = listen(EditorActions.setActiveProject, payload => {
    // tslint:disable-next-line:no-console
    __DEV__ && console.log('✨ Project activated', payload.project)

    this.updateWith(draft => {
      ;(draft.project as EditorState['project']) = payload.project
      draft.projectPath = payload.path!

      // No clear activeComposition etc, if project saved as new file
      if (payload.project !== this.state.project) {
        draft.activeComp = null
        draft.activeParam = null
        draft.clipboard = null
      }
    })
  })

  private handleRemoveComposition = listen(ProjectActions.removeComposition, payload => {
    if (this.state.activeComp && this.state.activeComp.id === payload.targetCompositionId) {
      this.updateWith(draft => {
        draft.activeComp = null
        draft.activeParam = null
      })
    }
  })

  private handleRemoveLayer = listen(ProjectActions.removeLayer, ({ targetLayerId }) => {
    const { selectClipIds, project } = this.state
    if (!project) return

    this.updateWith(d => {
      // Remove clip from selection if removed layer contains selected clip
      if (selectClipIds.length) {
        d.selectClipIds.forEach((clipId, idx) => {
          const clipOwnedLayer = project!.findClipOwnerLayer(clipId)
          if (!clipOwnedLayer || clipOwnedLayer.id !== targetLayerId) return

          d.selectClipIds.splice(idx, 1)

          if (d.activeParam && d.activeParam.entityId === clipId) {
            d.activeParam = null
          }
        })
      }

      if (targetLayerId === d.activeLayerId) {
        d.activeLayerId = null
      }
    })
  })

  private handleRemoveClip = listen(ProjectActions.removeClip, payload => {
    const { selectClipIds, activeParam } = this.state
    const index = selectClipIds.indexOf(payload.targetClipId)

    // Remove removing clip ID from selectClipIds
    if (index !== -1) {
      this.updateWith(d => d.selectClipIds.splice(index, 1))
    }

    // Clear activeParam if parameter owned by removing clip
    if (activeParam && activeParam.type === 'clip' && activeParam.entityId === payload.targetClipId) {
      this.updateWith(d => (d.activeParam = null))
    }
  })

  private handleRemoveEffect = listen(ProjectActions.removeEffectFromClip, payload => {
    const { activeParam } = this.state
    if (activeParam && activeParam.type === 'effect' && payload.targetEffectId === activeParam.entityId) {
      this.updateWith(draft => (draft.activeParam = null))
    }
  })

  private handlesetDragEntity = listen(EditorActions.setDragEntity, payload => {
    this.updateWith(d => ((d.dragEntity as DragEntity) = payload))
  })

  private handleclearDragEntity = listen(EditorActions.clearDragEntity, () => {
    this.updateWith(d => (d.dragEntity = null))
  })

  private handleChangeActiveComposition = listen(EditorActions.changeActiveComposition, ({ compositionId }) => {
    const { project, activeComp } = this.state
    if (project == null) return

    const comp = project.findComposition(compositionId)!
    if (activeComp && comp.id === activeComp.id) return

    this.updateWith(d => {
      ;(d.activeComp as EditorState['activeComp']) = comp
      d.selectClipIds = []
      d.activeParam = null
    })
  })

  private handleChangeActiveLayer = listen(EditorActions.changeActiveLayer, ({ layerId }) => {
    this.updateWith(d => (d.activeLayerId = layerId))
  })

  private handleAddOrRemoveSelectClip = listen(EditorActions.addOrRemoveSelectClip, payload => {
    const { project } = this.state
    if (project == null) return

    this.updateWith(d => {
      payload.clipIds.forEach(clipId => {
        const index = d.selectClipIds.indexOf(clipId)

        if (index === -1) {
          d.selectClipIds.push(clipId)
        } else {
          d.selectClipIds.splice(index, 1)
        }
      })
    })
  })

  private handleChangeSelectClip = listen(EditorActions.changeSelectClip, payload => {
    const { project } = this.state
    if (project == null) return

    this.updateWith(d => {
      d.selectClipIds = payload.clipIds
      d.activeParam = null
    })
  })

  private handleChangeActiveParam = listen(EditorActions.changeActiveParam, ({ target }) => {
    const { project } = this.state
    if (project == null) return

    this.updateWith(d => {
      if (target) {
        const clip =
          target.type === 'clip' ? project.findClip(target.entityId) : project.findEffectOwnerClip(target.entityId)

        d.selectClipIds = [clip!.id]
      }

      d.activeParam = target
    })
  })

  private handleseekPreviewFrame = listen(EditorActions.seekPreviewFrame, payload => {
    this.updateWith(d => (d.currentPreviewFrame = Math.round(payload.frame)))
  })

  private handleAddMessage = listen(EditorActions.addMessage, payload => {
    this.updateWith(d => {
      d.notifications.push(payload)
    })
  })

  private handleRemoveMessage = listen(EditorActions.removeMessage, payload => {
    this.updateWith(d => {
      const idx = d.notifications.findIndex(entry => entry!.id === payload.id)
      d.notifications.splice(idx, 1)
    })
  })

  private handleChangePreferenceOpenState = listen(EditorActions.changePreferenceOpenState, ({ open }) => {
    this.updateWith(draft => (draft.preferenceOpened = open))
  })

  private handleSetClipboardEntry = listen(EditorActions.setClipboardEntry, payload => {
    this.updateWith(
      draft =>
        // WTF. TypeScript recognize draft.clipboard and payload.entry as different types.
        (draft.clipboard = payload.entry as any),
    )
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

  public get focusClipId() {
    return this.state.selectClipIds.length === 1 ? this.state.selectClipIds[0] : null
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
