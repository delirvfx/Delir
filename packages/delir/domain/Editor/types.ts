import * as Delir from '@delirvfx/core'

export interface ParameterTarget {
  type: 'clip' | 'effect'
  entityId: string
  paramName: string
}

export interface ClipboardEntry {
  type: 'clip'
  entityClone: any
}
