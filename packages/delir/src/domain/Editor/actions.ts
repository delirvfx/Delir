import * as Delir from '@delirvfx/core'
import { action, actions } from '@fleur/fleur'
import { EncodingOption } from '@ragg/deream'

import { DragEntity } from './operations'
import { ClipboardEntry, ParameterTarget } from './types'

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
  updateProcessingState: action<{ stateText: string }>(),
  addMessage: action<{
    id: string
    title?: string
    level: 'info' | 'error'
    message?: string
    detail?: string
  }>(),
  removeMessage: action<{ id: string }>(),
  seekPreviewFrame: action<{ frame: number }>(),
  setClipboardEntry: action<{ entry: ClipboardEntry }>(),
  changePreferenceOpenState: action<{ open: boolean }>(),
})
