import * as Delir from '@delirvfx/core'
import { StoreGetter } from '@fleur/fleur'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/react'
import classnames from 'classnames'
import _ from 'lodash'
import React, { createRef } from 'react'
import ReactDOM from 'react-dom'
import { SortEndHandler } from 'react-sortable-hoc'
import TimePixelConversion from '../../utils/TimePixelConversion'

import * as EditorOps from '../../domain/Editor/operations'
import { getSelectedClips } from '../../domain/Editor/selectors'
import * as ProjectOps from '../../domain/Project/operations'

import EditorStore from '../../domain/Editor/EditorStore'
import ProjectStore from '../../domain/Project/ProjectStore'
import RendererStore from '../../domain/Renderer/RendererStore'

import { Dropdown } from '../../components/Dropdown'
import { Pane } from '../../components/Pane'
import { Workspace } from '../../components/Workspace'

import { KeyframeEditor } from '../KeyframeEditor'
import { ClipDragMediator } from './ClipDragMediator'
import { Gradations } from './Gradations'
import { LayerLabelList } from './LayerLabelList'

import t from './Timeline.i18n'
import s from './Timeline.sass'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

interface State {
  timelineScrollTop: number
  timelineScrollLeft: number
  timelineScrollWidth: number
  cursorHeight: number
  scale: number
  selectedLayerId: string | null
  clipDragOffset: { x: number }
}

export const PX_PER_SEC = 30

const mapStoresToProps = (getStore: StoreGetter) => ({
  activeComp: getStore(EditorStore).activeComp,
  activeClips: getSelectedClips(getStore),
  currentPointFrame: getStore(EditorStore).currentPointFrame,
  previewPlayed: getStore(RendererStore).previewPlaying,
})

/**
 * Timeline structure:
 *
 * Timeline
 *   └ Layer
 *     └ LayerLabel
 *     └ ClipSpace
 *       └ Clip
 */
export default withFleurContext(
  connectToStores([EditorStore, ProjectStore, RendererStore], mapStoresToProps)(
    class Timeline extends React.Component<Props, State> {
      public state: State = {
        timelineScrollTop: 0,
        timelineScrollLeft: 0,
        timelineScrollWidth: 0,
        cursorHeight: 0,
        scale: 1,
        selectedLayerId: null,
        clipDragOffset: { x: 0 },
      }

      private scaleList = createRef<Dropdown>()
      private timelineContainer = createRef<HTMLDivElement>()
      private labelContainer = createRef<HTMLDivElement>()
      private keyframeView = createRef<InstanceType<typeof KeyframeEditor>>()

      public componentDidMount() {
        this.syncCursorHeight()
        window.addEventListener('resize', _.debounce(this.syncCursorHeight, 1000 / 30))
      }

      public componentDidUpdate() {
        const { activeComp } = this.props
        const { scale } = this.state
        this.labelContainer.current!.scrollTop = this.timelineContainer.current!.scrollTop = this.state.timelineScrollTop

        if (activeComp) {
          const { durationFrames, framerate } = activeComp
          const scrollWidth = TimePixelConversion.framesToPixel({
            pxPerSec: PX_PER_SEC,
            durationFrames: durationFrames + framerate * 2,
            framerate: framerate,
            scale,
          })

          if (this.state.timelineScrollWidth !== scrollWidth) {
            this.setState({
              timelineScrollWidth: scrollWidth,
            })
          }
        }
      }

      public render() {
        const { scale, timelineScrollLeft, timelineScrollWidth } = this.state
        const { previewPlayed, activeComp, activeClips, currentPointFrame } = this.props
        const layers: Delir.Entity.Layer[] = activeComp ? Array.from(activeComp.layers) : []

        const measures = !activeComp
          ? []
          : TimePixelConversion.buildMeasures({
              durationFrames: activeComp.durationFrames,
              pxPerSec: PX_PER_SEC,
              framerate: activeComp.framerate,
              scale,
              placeIntervalWidth: 20,
              maxMeasures: activeComp.durationFrames,
            })

        return (
          <Pane className={s.Timeline} allowFocus>
            <Workspace direction="vertical">
              <Pane className={s.timelineRegion}>
                <Workspace direction="horizontal" onDrop={this._dropAsset}>
                  {/* Layer Panel */}
                  <Pane className={s.labelsContainer}>
                    <div className={s.labelsHeader}>
                      <div className={s.columnName}>
                        {t(t.k.layers)}
                        <i
                          className={classnames('twa twa-heavy-plus-sign', s.addLayerIcon)}
                          onClick={this.handleAddLayer}
                        />
                      </div>
                      <div className={s.scaleLabel} onClick={this._toggleScaleList}>
                        <Dropdown ref={this.scaleList} className={s.scaleList} shownInitial={false}>
                          <li data-value="50" onClick={this._selectScale}>
                            50%
                          </li>
                          <li data-value="100" onClick={this._selectScale}>
                            100%
                          </li>
                          <li data-value="150" onClick={this._selectScale}>
                            150%
                          </li>
                          <li data-value="200" onClick={this._selectScale}>
                            200%
                          </li>
                          <li data-value="250" onClick={this._selectScale}>
                            250%
                          </li>
                          <li data-value="300" onClick={this._selectScale}>
                            300%
                          </li>
                        </Dropdown>
                        <i className="fa fa-search-plus" />
                        <span className={s.currentScale}>{(scale * 100) | 0}%</span>
                      </div>
                    </div>

                    <div ref={this.labelContainer} className={s.labels} onScroll={this.handleScrollLayerLabel}>
                      {activeComp && (
                        <LayerLabelList
                          layers={layers}
                          useDragHandle={true}
                          onSortEnd={this.onLayerSort}
                          onLayerSelect={this.onLayerSelect}
                          onLayerRemove={this.onLayerRemove}
                        />
                      )}
                    </div>
                  </Pane>
                  {/* Layer Panel */}
                  <Pane className={s.timelineContainer} onWheel={this.handleScaleTimeline}>
                    <Gradations
                      activeComposition={activeComp}
                      measures={measures}
                      previewPlaying={previewPlayed}
                      currentFrame={currentPointFrame}
                      cursorHeight={this.state.cursorHeight}
                      scale={this.state.scale}
                      pxPerSec={PX_PER_SEC}
                      scrollLeft={timelineScrollLeft}
                      onSeeked={this._onSeeked}
                    />

                    <div
                      ref={this.timelineContainer}
                      className={s.layerContainer}
                      style={{ display: 'flex' }}
                      onMouseUp={this.handleMouseUpOnTimeline}
                      onKeyDown={this.handleKeydownTimeline}
                      onScroll={this.handleScrollTimeline}
                    >
                      {activeComp && (
                        <ClipDragMediator
                          comp={activeComp}
                          scale={scale}
                          scrollLeft={timelineScrollLeft}
                          scrollWidth={timelineScrollWidth}
                        />
                      )}
                    </div>
                  </Pane>
                </Workspace>
              </Pane>
              <Pane className={s.keyframeGraphRegion}>
                <KeyframeEditor
                  ref={this.keyframeView}
                  activeComposition={activeComp}
                  activeClip={activeClips.length === 1 ? activeClips[0] : null}
                  pxPerSec={PX_PER_SEC}
                  scale={scale}
                  scrollLeft={timelineScrollLeft}
                  measures={measures}
                  onScroll={this.handleScrollKeyframeEditor}
                  onScaled={this.handleScaleKeyframeEditor}
                />
              </Pane>
            </Workspace>
          </Pane>
        )
      }

      private syncCursorHeight = () => {
        const timelineHeight = this.timelineContainer.current!.getBoundingClientRect().height
        const keyFrameViewHeight = (ReactDOM.findDOMNode(this.keyframeView.current!) as Element).getBoundingClientRect()
          .height

        this.setState({
          cursorHeight: timelineHeight + keyFrameViewHeight + 1,
        })
      }

      private handleMouseUpOnTimeline = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!(e.target as HTMLElement).closest('[data-clip-id]')) {
          this.props.executeOperation(EditorOps.changeSelectClip, { clipIds: [] })
        }
      }

      private handleScrollLayerLabel = (e: React.UIEvent<HTMLDivElement>) => {
        this.setState({
          timelineScrollTop: e.currentTarget.scrollTop,
        })
      }

      private handleScrollTimeline = (e: React.UIEvent<HTMLDivElement>) => {
        this.setState({
          timelineScrollTop: e.currentTarget.scrollTop,
          timelineScrollLeft: e.currentTarget.scrollLeft,
        })
      }

      private onLayerSelect = (layerId: string) => {
        this.setState({ selectedLayerId: layerId })
      }

      private onLayerSort: SortEndHandler = ({ oldIndex, newIndex }) => {
        const { activeComp } = this.props
        if (!activeComp) return

        const layer = activeComp.layers[oldIndex]
        this.props.executeOperation(ProjectOps.moveLayerOrder, {
          layerId: layer.id,
          newIndex,
        })
      }

      private handleAddLayer = () => {
        const { activeComp } = this.props

        if (!activeComp) return
        this.props.executeOperation(ProjectOps.addLayer, {
          targetCompositionId: activeComp.id,
        })
      }

      private onLayerRemove = (layerId: string) => {
        if (!this.props.activeComp) return
        this.props.executeOperation(ProjectOps.removeLayer, {
          layerId,
        })
      }

      private handleKeydownTimeline = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Prevent scrolling by space key
        if (e.keyCode === 32) e.preventDefault()
      }

      private handleScaleTimeline = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
          const newScale = this.state.scale + e.deltaY * 0.05
          this.setState({ scale: Math.max(newScale, 0.1) })
          e.preventDefault()
        }
      }

      private handleScaleKeyframeEditor = (scale: number) => {
        this.setState({ scale })
      }

      private handleScrollKeyframeEditor = (dx: number, dy: number) => {
        this.timelineContainer.current!.scrollLeft += dx
        // Set scrollLeft normalized by DOM
        this.setState({ timelineScrollLeft: this.timelineContainer.current!.scrollLeft })
      }

      private _toggleScaleList = () => {
        this.scaleList.current!.toggle()
      }

      private _selectScale = ({ nativeEvent: e }: React.MouseEvent<HTMLLIElement>) => {
        const scale = +(e.target as HTMLLIElement).dataset.value! / 100
        this.scaleList.current!.hide()
        this.setState({ scale: scale })
      }

      private _dropAsset = (e: React.DragEvent<HTMLElement>) => {
        const { activeComp } = this.props
        const { dragEntity } = this.props.getStore(EditorStore).getState()

        if (!activeComp) {
          this.props.executeOperation(EditorOps.notify, {
            message: t(t.k.errors.compositionNotSelected),
            title: 'Woops',
            level: 'info',
            timeout: 4000,
          })

          return
        }

        if (!activeComp || !dragEntity || dragEntity.type !== 'asset') return
        const { asset } = dragEntity
        this.props.executeOperation(ProjectOps.addLayerWithAsset, {
          targetComposition: activeComp,
          asset,
        })
      }

      private _onSeeked = (frame: number) => {
        this.props.executeOperation(EditorOps.seekPreviewFrame, {
          frame,
        })
      }
    },
  ),
)
