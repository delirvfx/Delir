import * as Delir from '@delirvfx/core'
import { useFleurContext } from '@fleur/react'
import Selection from '@simonwep/selection-js'
import React, { useCallback, useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'

import * as EditorOps from '../../domain/Editor/operations'
import { getSelectedClips } from '../../domain/Editor/selectors'
import * as ProjectOps from '../../domain/Project/operations'

import { SpreadType } from '../../utils/Spread'
import TimePixelConversion from '../../utils/TimePixelConversion'
import { ClipDragContext, EmitClipDragHandler, EmitClipResizeHandler } from './ClipDragContext'
import { Layer } from './Layer'
import { PX_PER_SEC } from './Timeline'

import s from './ClipsMediator.sass'

interface Props {
  comp: SpreadType<Delir.Entity.Composition>
  scale: number
  scrollLeft: number
  scrollWidth: number
}

interface State {
  clipDragOffset: {
    x: number
    y: number
    width: number
    // layerMovement: number
  }
}

export const ClipDragMediator = ({ comp, scale, scrollLeft, scrollWidth }: Props) => {
  const { executeOperation, getStore } = useFleurContext()
  const [{ clipDragOffset }, setState] = useImmer({ clipDragOffset: { x: 0, y: 0, width: 0 } })
  const selection = useRef<Selection>()
  const rootRef = useRef<HTMLDivElement | null>(null)

  const calcMovementFrame = useCallback(
    (nextPx: number, originalFrameLength: number) => {
      return (
        TimePixelConversion.pixelToFrames({
          pxPerSec: PX_PER_SEC,
          framerate: comp.framerate,
          pixel: nextPx,
          scale: scale,
        }) - originalFrameLength
      )
    },
    [comp.framerate, scale],
  )

  const handleClipDragging: EmitClipDragHandler = useCallback(
    ({ nextX, nextY, originalPlacedFrame }) => {
      const movementFrame = calcMovementFrame(nextX, originalPlacedFrame)
      const offsetX = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        framerate: comp.framerate,
        durationFrames: movementFrame,
        scale: scale,
      })

      setState(draft => {
        draft.clipDragOffset = { x: offsetX, y: nextY, width: 0 }
      })
    },
    [calcMovementFrame, comp.framerate, scale],
  )

  const handleClipDragEnd: EmitClipDragHandler = useCallback(
    ({ nextX, nextY, originalPlacedFrame }) => {
      const clips = getSelectedClips(getStore)
      const movementFrame = calcMovementFrame(nextX, originalPlacedFrame)
      const patches = clips.map(clip => {
        return {
          clipId: clip.id,
          patch: {
            placedFrame: clip.placedFrame + movementFrame,
          } as Partial<Delir.Entity.Clip>,
        }
      })

      executeOperation(ProjectOps.modifyClips, patches)
      setState(draft => {
        draft.clipDragOffset = { x: 0, y: 0, width: 0 }
      })
    },
    [calcMovementFrame],
  )

  const handleClipResize: EmitClipResizeHandler = useCallback(
    ({ nextX, originalPlacedFrame, deltaWidth: nextWidth }) => {
      const sizingFrame = calcMovementFrame(nextWidth, 0)
      const movementFrame = calcMovementFrame(nextX, originalPlacedFrame)

      const offsetX = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        framerate: comp.framerate,
        durationFrames: movementFrame,
        scale: scale,
      })

      const offsetWidth = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        framerate: comp.framerate,
        durationFrames: sizingFrame,
        scale: scale,
      })

      setState(draft => {
        draft.clipDragOffset = { x: offsetX, y: 0, width: offsetWidth }
      })
    },
    [calcMovementFrame, comp.framerate, scale],
  )

  const handleClipResizeEnd: EmitClipResizeHandler = useCallback(
    ({ nextX, originalPlacedFrame, deltaWidth: nextWidth }) => {
      const clips = getSelectedClips(getStore)
      const sizingFrame = calcMovementFrame(nextWidth, 0)
      const movementFrame = calcMovementFrame(nextX, originalPlacedFrame)

      const patches = clips.map(clip => {
        return {
          clipId: clip.id,
          patch: {
            placedFrame: clip.placedFrame + movementFrame,
            durationFrames: clip.durationFrames + sizingFrame,
          } as Partial<Delir.Entity.Clip>,
        }
      })

      executeOperation(ProjectOps.modifyClips, patches)
      setState(draft => {
        draft.clipDragOffset = { x: 0, y: 0, width: 0 }
      })
    },
    [calcMovementFrame],
  )

  const handleDropClipInLayer = useCallback(() => {}, [])

  useEffect(() => {
    selection.current = Selection.create({
      class: s.selectionArea,
      selectionAreaContainer: rootRef.current!,
      startareas: [`.${s.root}`],
      boundaries: [`.${s.root}`],
      selectables: ['[data-clip-id]'],
    })
      .on('beforestart', ({ oe }: Selection.SelectionEvent) => {
        return !(oe.target as HTMLElement).closest('[data-clip-id]')
      })
      .on('stop', ({ oe, selected }: Selection.SelectionEvent) => {
        const clipIds = selected.map(el => (el as HTMLElement).dataset.clipId!)

        if (oe.shiftKey || oe.metaKey) {
          executeOperation(EditorOps.addOrRemoveSelectClip, { clipIds })
        } else {
          executeOperation(EditorOps.changeSelectClip, { clipIds })
        }
      })

    return () => selection.current!.destroy()
  })

  const { framerate } = comp

  return (
    <ClipDragContext.Provider
      value={{
        emitClipDrag: handleClipDragging,
        emitClipDragEnd: handleClipDragEnd,
        emitClipResize: handleClipResize,
        emitClipResizeEnd: handleClipResizeEnd,
      }}
    >
      <div ref={rootRef} className={s.root}>
        {comp.layers.map((layer, idx) => (
          <Layer
            key={layer.id!}
            layer={{ ...layer }}
            layerIndex={idx}
            framerate={framerate}
            pxPerSec={PX_PER_SEC}
            scale={scale}
            clipOffset={clipDragOffset}
            scrollLeft={scrollLeft}
            scrollWidth={scrollWidth}
          />
        ))}
      </div>
    </ClipDragContext.Provider>
  )
}
