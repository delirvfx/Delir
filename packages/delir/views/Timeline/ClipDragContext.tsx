import * as React from 'react'

interface ClipDragContext {
    emitClipDrag: (movementX: number, originalPlacedFrame: number) => void
    emitClipDragEnd: (movementX: number, originalPlacedFrame: number) => void
}

export type ClipDragProps = ClipDragContext
export const ClipDragContext = React.createContext<ClipDragContext>(null!)

export function withClipDragContext(Component: React.ComponentType<ClipDragProps>) {
    return (props: object) => {
        const context = React.useContext(ClipDragContext)
        return <Component {...context} {...props} />
    }
}
