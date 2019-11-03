import { useStore } from '@fleur/react'
import classnames from 'classnames'
import React, { useCallback, useMemo } from 'react'

import TimePixelConversion, { MeasurePoint } from '../../utils/TimePixelConversion'

import RendererStore from '../../domain/Renderer/RendererStore'

import { ContextMenu, MenuItem } from '../../components/ContextMenu/ContextMenu'

import EditorStore from 'domain/Editor/EditorStore'
import { getActiveComp } from 'domain/Editor/selectors'
import { useRef } from 'react'
import { useEffect } from 'react'
import { useObjectState } from 'utils/hooks'
import t from './Gradations.i18n'
import s from './Gradations.sass'

interface Props {
  currentFrame: number
  measures: MeasurePoint[]
  previewPlaying: boolean
  cursorHeight: number
  scrollLeft: number
  scale: number
  pxPerSec: number
  onSeeked: (frame: number) => any
}

interface State {
  dragSeekEnabled: boolean
}

export const Gradations = ({
  currentFrame,
  measures,
  previewPlaying,
  cursorHeight,
  scrollLeft,
  scale,
  pxPerSec,
  onSeeked,
}: Props) => {
  const { lastRenderState, activeComposition } = useStore([EditorStore, RendererStore], getStore => ({
    lastRenderState: getStore(RendererStore).getLastRenderState(),
    activeComposition: getActiveComp(getStore),
  }))

  const [{ dragSeekEnabled }, setState] = useObjectState<State>({
    dragSeekEnabled: false,
  })

  const intervalId = useRef<number>(-1)
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const measureLayer = useRef<HTMLDivElement | null>(null)

  const handleGlobalMouseUp = useCallback(() => {
    window.addEventListener(
      'mouseup',
      () => {
        setState({ dragSeekEnabled: false })
      },
      { once: true },
    )
  }, [])

  const updateCursor = useCallback(() => {
    const usingCurrentFrame = previewPlaying && lastRenderState ? lastRenderState.currentFrame : currentFrame

    if (activeComposition) {
      // Reactの仕組みを使うとrenderMeasureが走りまくってCPUがヤバいので
      // Reactのライフサイクルから外す
      const cursorLeft = TimePixelConversion.framesToPixel({
        pxPerSec: 30,
        framerate: activeComposition.framerate,
        durationFrames: usingCurrentFrame,
        scale,
      })

      cursorRef.current!.style.display = cursorLeft - scrollLeft < 0 ? 'none' : 'block'
      cursorRef.current!.style.left = `${cursorLeft}px`
      cursorRef.current!.style.transform = `translateX(-${scrollLeft}px)`
      measureLayer.current!.style.transform = `translateX(-${scrollLeft}px)`
    }

    intervalId.current = requestAnimationFrame(updateCursor)
  }, [activeComposition, previewPlaying, currentFrame, scrollLeft, lastRenderState])

  const handleSeeking = useCallback(
    ({ nativeEvent: e }: React.MouseEvent<HTMLDivElement>) => {
      // Accepy only "left only" click
      if (e.buttons !== 1) return

      if (e.type === 'mousedown') {
        setState({ dragSeekEnabled: true })
        handleGlobalMouseUp()
      }

      if (!dragSeekEnabled) return
      if (!activeComposition) return

      const frame =
        TimePixelConversion.pixelToFrames({
          pxPerSec,
          framerate: activeComposition.framerate,
          scale,
          pixel: (e as MouseEvent).layerX + scrollLeft,
        }) | 0

      onSeeked(frame)
    },
    [dragSeekEnabled, activeComposition, pxPerSec, scale, scrollLeft, onSeeked],
  )

  const seekToHead = useCallback(() => {
    onSeeked(0)
  }, [onSeeked])

  const measureElements = useMemo(() => {
    if (!activeComposition) return null

    return measures.map(point => (
      <div
        key={point.index}
        className={classnames(s.measureLine, {
          [s['--grid']]: point.frameNumber % 10 === 0,
          [s['--endFrame']]: point.frameNumber === activeComposition.durationFrames,
        })}
        style={{ left: point.left }}
      >
        {point.frameNumber}
      </div>
    ))
  }, [measures, activeComposition])

  useEffect(() => {
    intervalId.current = requestAnimationFrame(updateCursor)
    return () => cancelAnimationFrame(intervalId.current)
  }, [updateCursor])

  return (
    <div
      className={s.Gradations}
      onMouseDown={handleSeeking}
      onMouseMove={handleSeeking}
      onMouseUp={handleSeeking}
      onClick={handleSeeking}
    >
      <ContextMenu>
        <MenuItem label={t(t.k.contextMenu.seekToHead)} onClick={seekToHead} />
      </ContextMenu>
      <div className={s.measureLayerTrimer}>
        <div ref={measureLayer} className={s.measureLayer}>
          {measureElements}
        </div>
      </div>
      <div
        ref={cursorRef}
        className={s.playingCursor}
        style={{
          height: `calc(100% + ${cursorHeight}px - 5px)`,
        }}
      />
    </div>
  )
}
