import { StoreGetter } from '@fleur/fleur'
import { ContextProp, useFleurContext, useStore } from '@fleur/react'
import React, { MouseEvent, useCallback, useRef } from 'react'
import { frameToTimeCode } from '../../utils/Timecode'

import { Dropdown } from '../../components/Dropdown'
import { Pane } from '../../components/Pane'

import { getActiveComp, getCurrentPreviewFrame } from 'domain/Editor/selectors'
import EditorStore from '../../domain/Editor/EditorStore'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import { useEffect } from 'react'
import { WheelEvent } from 'react'
import { useObjectState } from 'utils/hooks'
import { Platform } from 'utils/platform'
import t from './PreviewView.i18n'
import s from './PreviewView.sass'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

interface State {
  scale: number
  scaleListShown: boolean
  positionX: number
  positionY: number
}

const mapStoresToProps = (getStore: StoreGetter) => {
  const editorStore = getStore(EditorStore)

  return
}

export const PreviewView = (props: Props) => {
  const { executeOperation } = useFleurContext()
  const { activeComp, currentPreviewFrame, previewPlaying, lastRenderState } = useStore(
    [EditorStore, RendererStore],
    getStore => ({
      activeComp: getActiveComp(getStore),
      currentPreviewFrame: getCurrentPreviewFrame(getStore),
      previewPlaying: getStore(RendererStore).previewPlaying,
      lastRenderState: getStore(RendererStore).getLastRenderState(),
    }),
  )

  const [{ scale, positionX, positionY, scaleListShown }, setState] = useObjectState<State>({
    scale: 1,
    scaleListShown: false,
    positionX: 0,
    positionY: 0,
  })

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scaleListRef = useRef<Dropdown | null>(null)
  const mouseMovement = useRef<{ baseScreenX: number; baseScreenY: number } | null>({ baseScreenX: 0, baseScreenY: 0 })

  const handleWheelPreviewView = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (e.altKey && !e.ctrlKey) {
        setState({
          scale: Math.max(0.1, Math.min(scale + -e.deltaY / 20, 3)),
        })
      }

      if (Platform.isMacOS) {
        setState(
          e.ctrlKey
            ? { scale: Math.max(0.05, scale - e.deltaY * 0.01) }
            : {
                positionX: positionX - e.deltaX,
                positionY: positionY - e.deltaY,
              },
        )
      }
    },
    [scale, positionX, positionY],
  )

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.nativeEvent.which !== 2) return // Middle click
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.nativeEvent.which !== 2) return // Middle click

      setState(state => ({
        positionX: state.positionX + e.movementX * (1 / scale),
        positionY: state.positionY + e.movementY * (1 / scale),
      }))
    },
    [scale],
  )

  const handleMouseUp = useCallback(() => {
    mouseMovement.current = null
  }, [])

  const handleToggleScaleList = useCallback(() => {
    scaleListRef.current!.toggle()
  }, [])

  const handleSelectScale = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    scaleListRef.current!.hide()

    setState({
      scale: parseInt(e.currentTarget.dataset.value!, 10) / 100,
      positionX: 0,
      positionY: 0,
      scaleListShown: false,
    })
  }, [])

  useEffect(() => {
    executeOperation(RendererOps.setPreviewCanvas, { canvas: canvasRef.current! })
  }, [])

  const displayScale = Math.round(scale * 100)
  const width = activeComp ? activeComp.width : 640
  const height = activeComp ? activeComp.height : 360
  const currentFrame = previewPlaying && lastRenderState ? lastRenderState.currentFrame : currentPreviewFrame
  const timecode = activeComp ? frameToTimeCode(currentFrame, activeComp.framerate) : '--:--:--:--'

  return (
    <Pane className={s.Preview} allowFocus>
      <div className={s.Preview_Inner}>
        <div className={s.Preview_Header}>{activeComp && activeComp.name}</div>
        <div
          className={s.Preview_View}
          onWheel={handleWheelPreviewView}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className={s.PreviewView_Canvas}
            width={width}
            height={height}
            style={{
              transform: `scale(${scale}) translateX(${positionX}px) translateY(${positionY}px)`,
            }}
          />
        </div>
        <div className={s.Preview_Footer}>
          <label className={s.FooterItem} onClick={handleToggleScaleList}>
            <i className="fa fa-search-plus" />
            <span className={s.currentScale}>{displayScale}%</span>
            <Dropdown ref={scaleListRef} className={s.dropdown} shownInitial={scaleListShown}>
              <div data-value="50" onClick={handleSelectScale}>
                50%
              </div>
              <div data-value="100" onClick={handleSelectScale}>
                100%
              </div>
              <div data-value="150" onClick={handleSelectScale}>
                150%
              </div>
              <div data-value="200" onClick={handleSelectScale}>
                200%
              </div>
              <div data-value="250" onClick={handleSelectScale}>
                250%
              </div>
              <div data-value="300" onClick={handleSelectScale}>
                300%
              </div>
            </Dropdown>
          </label>
          <div className={s.FooterItem}>{timecode}</div>
        </div>
      </div>
    </Pane>
  )
}
