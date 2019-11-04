import * as Delir from '@delirvfx/core'
import { action, actions } from '@fleur/fleur'

import { NotificationEntry } from './EditorStore'
import { DragEntity } from './operations'
import { ClipboardEntryClip, ParameterTarget } from './types'

export const EditorActions = actions('Editor', {
  setActiveProject: action<{
    project: Delir.Entity.Project
    path?: string | null
  }>(),
  clearActiveProject: action<{}>(),
  setDragEntity: action<DragEntity>(),
  clearDragEntity: action<{}>(),
  changeActiveComposition: action<{ compositionId: string }>(),
  changeActiveLayer: action<{ layerId: string }>(),
  changeSelectClip: action<{ clipIds: string[] }>(),
  addOrRemoveSelectClip: action<{ clipIds: string[] }>(),
  changeActiveParam: action<{ target: ParameterTarget | null }>(),
  addMessage: action<NotificationEntry>(),
  removeMessage: action<{ id: string }>(),
  seekPreviewFrame: action<{ frame: number }>(),
  setClipboardEntry: action<{ entry: ClipboardEntryClip }>(),
  changePreferenceOpenState: action<{ open: boolean }>(),
})
