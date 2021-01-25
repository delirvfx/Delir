import React, { useContext } from 'react'

export type EmitClipDragHandler = (arg: { nextX: number; nextY: number; originalPlacedFrame: number }) => void

export type EmitClipResizeHandler = (arg: { nextX: number; originalPlacedFrame: number; deltaWidth: number }) => void

interface ClipDragContext {
  emitClipDrag: EmitClipDragHandler
  emitClipDragEnd: EmitClipDragHandler
  emitClipResize: EmitClipResizeHandler
  emitClipResizeEnd: EmitClipResizeHandler
}

export type ClipDragProps = ClipDragContext
export const ClipDragContext = React.createContext<ClipDragContext>(null!)

export const useClipDragContext = () => {
  return useContext(ClipDragContext)
}
