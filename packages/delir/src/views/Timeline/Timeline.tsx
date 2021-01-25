import * as Delir from '@delirvfx/core'
import { useFleurContext, useStore } from '@fleur/react'
import classnames from 'classnames'
import _ from 'lodash'
import React, { useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { SortEndHandler } from 'react-sortable-hoc'
import TimePixelConversion from '../../utils/TimePixelConversion'

import { useObjectState } from 'utils/hooks'
import { Dropdown } from '../../components/Dropdown'
import { Pane } from '../../components/Pane'
import { Workspace } from '../../components/Workspace'
import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import { getSelectedClipIds, getSelectedClips } from '../../domain/Editor/selectors'
import * as ProjectOps from '../../domain/Project/operations'
import ProjectStore from '../../domain/Project/ProjectStore'
import RendererStore from '../../domain/Renderer/RendererStore'
import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'
import { KeyframeEditor } from '../KeyframeEditor'
import { ClipDragMediator } from './ClipDragMediator'
import { Gradations } from './Gradations'
import { LayerLabelList } from './LayerLabelList'

import { useRef } from 'react'
import { useEffect } from 'react'
import { useLayoutEffect } from 'react'
import { Platform } from 'utils/platform'
import t from './Timeline.i18n'
import s from './Timeline.sass'

interface State {
  timelineScrollTop: number
  timelineScrollLeft: number
  timelineScrollWidth: number
  cursorHeight: number
  scale: number
}

export const PX_PER_SEC = 30

export const Timeline = () => {
  const { executeOperation, getStore } = useFleurContext()
  const { activeComp, activeClips, currentPointFrame, previewPlayed } = useStore(getStore => ({
    activeComp: getStore(EditorStore).activeComp,
    activeClips: getSelectedClips(getStore),
    currentPointFrame: getStore(EditorStore).currentPointFrame,
    previewPlayed: getStore(RendererStore).previewPlaying,
  }))

  const [
    { timelineScrollTop, timelineScrollLeft, timelineScrollWidth, cursorHeight, scale },
    setState,
  ] = useObjectState<State>({
    timelineScrollTop: 0,
    timelineScrollLeft: 0,
    timelineScrollWidth: 0,
    cursorHeight: 0,
    scale: 1,
  })

  const mousetrap = useRef<MousetrapInstance | null>(null)
  const scaleList = useRef<Dropdown | null>(null)
  const timelineContainer = useRef<HTMLDivElement | null>(null)
  const labelContainer = useRef<HTMLDivElement | null>(null)
  const keyframeView = useRef<React.Component | null>(null)

  const handleGlobalCopy = useCallback(() => {
    executeOperation(EditorOps.copyClips)
  }, [])

  const handleGlobalCut = useCallback(() => {
    executeOperation(EditorOps.cutClips)
  }, [])

  const handleShortcutDel = useCallback(() => {
    executeOperation(ProjectOps.removeClips, {
      clipIds: getSelectedClipIds(getStore),
    })
  }, [])

  const handleResizeWindow = useCallback(
    _.debounce(() => {
      const timelineHeight = timelineContainer.current!.getBoundingClientRect().height
      const keyFrameViewHeight = (ReactDOM.findDOMNode(keyframeView.current!) as Element).getBoundingClientRect().height

      setState({
        cursorHeight: timelineHeight + keyFrameViewHeight + 1,
      })
    }, 1000 / 30),
    [],
  )

  const handleScrollLayerLabel = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setState({
      timelineScrollTop: e.currentTarget.scrollTop,
    })
  }, [])

  const handleScrollTimeline = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setState({
      timelineScrollTop: e.currentTarget.scrollTop,
      timelineScrollLeft: e.currentTarget.scrollLeft,
    })
  }, [])

  const onLayerSelect = useCallback((layerId: string) => {
    executeOperation(EditorOps.changeActiveLayer, layerId)
  }, [])

  const onLayerSort: SortEndHandler = useCallback(
    ({ oldIndex, newIndex }) => {
      if (!activeComp) return

      const layer = activeComp.layers[oldIndex]
      executeOperation(ProjectOps.moveLayerOrder, {
        layerId: layer.id,
        newIndex,
      })
    },
    [activeComp],
  )

  const handleAddLayer = useCallback(() => {
    if (!activeComp) return

    executeOperation(ProjectOps.addLayer, {
      targetCompositionId: activeComp.id,
    })
  }, [activeComp])

  const onLayerRemove = useCallback(
    (layerId: string) => {
      if (!activeComp) return
      executeOperation(ProjectOps.removeLayer, {
        layerId,
      })
    },
    [activeComp],
  )

  const handleKeydownTimeline = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent scrolling by space key
    if (e.keyCode === 32) e.preventDefault()
  }, [])

  const handleWheelTimeline = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (Platform.isMacOS && e.ctrlKey) {
        setState({ scale: Math.max(scale - e.deltaY * 0.1, 0.1) })
        return
      }

      if (e.altKey) {
        const newScale = scale + e.deltaY * 0.05
        setState({ scale: Math.max(newScale, 0.1) })
      }
    },
    [scale],
  )

  const handleScaleKeyframeEditor = useCallback((scale: number) => {
    setState({ scale })
  }, [])

  const handleScrollKeyframeEditor = useCallback((dx: number, dy: number) => {
    timelineContainer.current!.scrollLeft += dx
    // Set scrollLeft normalized by DOM
    setState({ timelineScrollLeft: timelineContainer.current!.scrollLeft })
  }, [])

  const handleClickOpenScaleList = useCallback(() => {
    scaleList.current!.show()
  }, [])

  const handleSelectScale = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    const scale = +(e.target as HTMLLIElement).dataset.value! / 100
    scaleList.current!.hide()
    setState({ scale })
  }, [])

  const handleDropAsset = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      const { dragEntity } = getStore(EditorStore).getState()

      if (!activeComp) {
        executeOperation(EditorOps.notify, {
          message: t(t.k.errors.compositionNotSelected),
          title: 'Woops',
          level: 'info',
          timeout: 4000,
        })

        return
      }

      if (!activeComp || !dragEntity || dragEntity.type !== 'asset') return
      const { asset } = dragEntity
      executeOperation(ProjectOps.addLayerWithAsset, {
        targetComposition: activeComp,
        asset,
      })
    },
    [activeComp],
  )

  const handleGradationSeeked = useCallback((frame: number) => {
    executeOperation(EditorOps.seekPreviewFrame, { frame })
  }, [])

  useEffect(() => {
    handleResizeWindow()

    mousetrap.current = new Mousetrap(timelineContainer.current!)
    mousetrap.current.bind('del', handleShortcutDel)

    timelineContainer.current!.addEventListener('focusin', () => {
      GlobalEvents.on(GlobalEvent.copyViaApplicationMenu, handleGlobalCopy)
      GlobalEvents.on(GlobalEvent.cutViaApplicationMenu, handleGlobalCut)
    })

    timelineContainer.current!.addEventListener('focusout', () => {
      GlobalEvents.on(GlobalEvent.copyViaApplicationMenu, handleGlobalCopy)
      GlobalEvents.on(GlobalEvent.cutViaApplicationMenu, handleGlobalCut)
    })

    window.addEventListener('resize', handleResizeWindow)

    return () => {
      window.removeEventListener('resize', handleResizeWindow)
      mousetrap.current?.reset()
    }
  }, [])

  useLayoutEffect(() => {
    labelContainer.current!.scrollTop = timelineContainer.current!.scrollTop = timelineScrollTop

    if (activeComp) {
      const { durationFrames, framerate } = activeComp
      const scrollWidth = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        durationFrames: durationFrames + framerate * 2,
        framerate: framerate,
        scale,
      })

      if (timelineScrollWidth !== scrollWidth) {
        setState({
          timelineScrollWidth: scrollWidth,
        })
      }
    }
  }, [activeComp?.durationFrames, activeComp?.framerate, scale, timelineScrollTop])

  const layers: Delir.Entity.Layer[] = activeComp ? Array.from(activeComp.layers) : []

  const measures = useMemo(
    () =>
      activeComp
        ? TimePixelConversion.buildMeasures({
            durationFrames: activeComp.durationFrames,
            pxPerSec: PX_PER_SEC,
            framerate: activeComp.framerate,
            scale,
            placeIntervalWidth: 20,
            maxMeasures: activeComp.durationFrames,
          })
        : [],
    [scale, activeComp?.durationFrames, activeComp?.framerate],
  )

  return (
    <Pane className={s.Timeline} allowFocus>
      <Workspace direction="vertical">
        <Pane className={s.timelineRegion}>
          <Workspace direction="horizontal" onDrop={handleDropAsset}>
            {/* Layer Panel */}
            <Pane className={s.labelsContainer}>
              <div className={s.labelsHeader}>
                <div className={s.columnName}>
                  {t(t.k.layers)}
                  <i className={classnames('twa twa-heavy-plus-sign', s.addLayerIcon)} onClick={handleAddLayer} />
                </div>
                <div className={s.scaleLabel} onClick={handleClickOpenScaleList}>
                  <Dropdown ref={scaleList} className={s.scaleList}>
                    <div data-value="50" onClick={handleSelectScale}>
                      50%
                    </div>
                    <div data-value="100" onClick={handleSelectScale}>
                      100%
                    </div>
                    <div data-value="300" onClick={handleSelectScale}>
                      300%
                    </div>
                    <div data-value="1000" onClick={handleSelectScale}>
                      1000%
                    </div>
                  </Dropdown>
                  <i className="fa fa-search-plus" />
                  <span className={s.currentScale}>{(scale * 100) | 0}%</span>
                </div>
              </div>

              <div ref={labelContainer} className={s.labels} onScroll={handleScrollLayerLabel}>
                {activeComp && (
                  <LayerLabelList
                    layers={layers}
                    useDragHandle={true}
                    onSortEnd={onLayerSort}
                    onLayerSelect={onLayerSelect}
                    onLayerRemove={onLayerRemove}
                  />
                )}
              </div>
            </Pane>
            {/* Layer Panel */}
            <Pane className={s.timelineContainer} onWheel={handleWheelTimeline}>
              <Gradations
                measures={measures}
                previewPlaying={previewPlayed}
                currentFrame={currentPointFrame}
                cursorHeight={cursorHeight}
                scale={scale}
                pxPerSec={PX_PER_SEC}
                scrollLeft={timelineScrollLeft}
                onSeeked={handleGradationSeeked}
              />

              <div ref={timelineContainer} className={s.layerContainer} onScroll={handleScrollTimeline}>
                <div style={{ display: 'flex', height: '100%' }} onKeyDown={handleKeydownTimeline}>
                  {activeComp && (
                    <ClipDragMediator
                      comp={activeComp}
                      scale={scale}
                      scrollLeft={timelineScrollLeft}
                      scrollWidth={timelineScrollWidth}
                    />
                  )}
                </div>
              </div>
            </Pane>
          </Workspace>
        </Pane>
        <Pane className={s.keyframeGraphRegion}>
          <KeyframeEditor
            ref={keyframeView}
            activeComposition={activeComp}
            activeClip={activeClips.length === 1 ? activeClips[0] : null}
            pxPerSec={PX_PER_SEC}
            scale={scale}
            scrollLeft={timelineScrollLeft}
            measures={measures}
            onScroll={handleScrollKeyframeEditor}
            onScaled={handleScaleKeyframeEditor}
          />
        </Pane>
      </Workspace>
    </Pane>
  )
}
