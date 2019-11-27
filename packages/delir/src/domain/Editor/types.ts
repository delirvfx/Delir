import * as Delir from '@delirvfx/core'

export interface ParameterTarget {
  type: 'clip' | 'effect'
  entityId: string
  paramName: string
}

export interface ClipboardEntryClip {
  type: 'clip'
  entities: {
    offset: number
    clips: Delir.Entity.Clip[]
  }[]
}

export type ClipboardEntry = ClipboardEntryClip
