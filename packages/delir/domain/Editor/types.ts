import * as Delir from '@ragg/delir-core'

export interface ParameterTarget {
    type: 'clip' | 'effect'
    entityId: string
    paramName: string
}

// This is mark of don't use some instance (use clone)
type CloneOf<T extends object> = {
    [K in keyof T]: T[K]
}

export interface ClipboardEntry {
    type: 'clip'
    entityClone: CloneOf<Delir.Entity.Clip>
}
