import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { SortEndHandler } from 'react-sortable-hoc'
import TimePixelConversion from '../../utils/TimePixelConversion'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import ProjectStore from '../../domain/Project/ProjectStore'

import Pane from '../../components/pane'
import Workspace from '../../components/workspace'

import { ContextMenu, MenuItem } from '../../components/ContextMenu'
import DropDown from '../../components/dropdown'

import KeyframeEditor from '../KeyframeEditor'
import Gradations from './Gradations'
import Layer from './Layer'
import LayerLabelList from './LayerLabelList'

import * as s from './style.styl'
import t from './Timeline.i18n'

interface ConnectedProps {
    editor: EditorState
}

interface State {
    timelineScrollTop: number
    timelineScrollLeft: number
    cursorHeight: number
    scale: number
    selectedLayerId: string | null
}

type Props = ConnectedProps & ContextProp

const PX_PER_SEC = 30

/**
 * Timeline structure:
 *
 * Timeline
 *   └ Layer
 *     └ LayerLabel
 *     └ ClipSpace
 *       └ Clip
 */
export default withComponentContext(
    connectToStores([EditorStore, ProjectStore], context => ({
        editor: context.getStore(EditorStore).getState(),
    }))(
        class Timeline extends React.Component<Props, State> {
            public props: Props & {
                editor: EditorState
            }

            public refs: {
                scaleList: DropDown
                keyframeView: InstanceType<typeof KeyframeEditor>
                timelineLayers: HTMLUListElement
                timelineLabels: HTMLDivElement
            }

            public state: State = {
                timelineScrollTop: 0,
                timelineScrollLeft: 0,
                cursorHeight: 0,
                scale: 1,
                selectedLayerId: null,
            }

            public componentDidMount() {
                this._syncCursorHeight()
                window.addEventListener('resize', _.debounce(this._syncCursorHeight, 1000 / 30))
            }

            public componentDidUpdate() {
                this.refs.timelineLabels.scrollTop = this.refs.timelineLayers.scrollTop = this.state.timelineScrollTop
            }

            public render() {
                const { scale, timelineScrollLeft } = this.state
                const { activeComp, activeClip, currentPreviewFrame, previewPlayed } = this.props.editor
                const { framerate } = activeComp ? activeComp : { framerate: 30 }
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
                                                {t('layers')}
                                                <i
                                                    className={classNames('twa twa-heavy-plus-sign', s.addLayerIcon)}
                                                    onClick={this.handleAddLayer}
                                                />
                                            </div>
                                            <div className={s.scaleLabel} onClick={this._toggleScaleList}>
                                                <DropDown ref="scaleList" className={s.scaleList} shownInitial={false}>
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
                                                </DropDown>
                                                <i className="fa fa-search-plus" />
                                                <span className={s.currentScale}>{(scale * 100) | 0}%</span>
                                            </div>
                                        </div>

                                        <div
                                            ref="timelineLabels"
                                            className={s.labels}
                                            onScroll={this.handleScrollLayerLabel}
                                        >
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
                                    <Pane className={s.timelineContainer} onWheel={this._scaleTimeline}>
                                        <Gradations
                                            activeComposition={activeComp}
                                            measures={measures}
                                            previewPlayed={previewPlayed}
                                            currentFrame={currentPreviewFrame}
                                            cursorHeight={this.state.cursorHeight}
                                            scale={this.state.scale}
                                            pxPerSec={PX_PER_SEC}
                                            scrollLeft={timelineScrollLeft}
                                            onSeeked={this._onSeeked}
                                        />

                                        <div
                                            ref="timelineLayers"
                                            className={s.layerContainer}
                                            onScroll={this.handleScrollTimeline}
                                        >
                                            {activeComp &&
                                                layers.map((layer, idx) => (
                                                    <Layer
                                                        key={layer.id!}
                                                        layer={layer}
                                                        layerIndex={idx}
                                                        framerate={framerate}
                                                        pxPerSec={PX_PER_SEC}
                                                        scale={scale}
                                                        activeClip={activeClip}
                                                        scrollLeft={timelineScrollLeft}
                                                    />
                                                ))}
                                        </div>
                                    </Pane>
                                </Workspace>
                            </Pane>
                            <Pane className={s.keyframeGraphRegion}>
                                <KeyframeEditor
                                    ref="keyframeView"
                                    activeComposition={activeComp}
                                    activeClip={activeClip}
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

            private _syncCursorHeight = () => {
                const { timelineLayers, keyframeView } = this.refs

                const timelineHeight = timelineLayers.getBoundingClientRect().height
                const keyFrameViewHeight = (ReactDOM.findDOMNode(keyframeView!) as Element).getBoundingClientRect()
                    .height

                this.setState({
                    cursorHeight: timelineHeight + keyFrameViewHeight + 1,
                })
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
                const {
                    editor: { activeComp },
                } = this.props
                if (!activeComp) return

                const layer = activeComp.layers[oldIndex]
                this.props.context.executeOperation(ProjectOps.moveLayerOrder, {
                    layerId: layer.id,
                    newIndex,
                })
            }

            private handleAddLayer = () => {
                const { editor } = this.props

                if (!editor.activeComp) return

                this.props.context.executeOperation(ProjectOps.addLayer, {
                    targetCompositionId: editor.activeComp.id,
                })
            }

            private onLayerRemove = (layerId: string) => {
                if (!this.props.editor.activeComp) return
                this.props.context.executeOperation(ProjectOps.removeLayer, {
                    layerId,
                })
            }

            private _scaleTimeline = (e: React.WheelEvent<HTMLDivElement>) => {
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
                const { timelineLayers } = this.refs
                timelineLayers.scrollLeft += dx
                this.setState({ timelineScrollLeft: timelineLayers.scrollLeft })
            }

            private _toggleScaleList = () => {
                this.refs.scaleList.toggle()
            }

            private _selectScale = ({ nativeEvent: e }: React.MouseEvent<HTMLLIElement>) => {
                const scale = +(e.target as HTMLLIElement).dataset.value! / 100
                this.refs.scaleList.hide()
                this.setState({ scale: scale })
            }

            private _dropAsset = (e: React.DragEvent<HTMLElement>) => {
                const { dragEntity, activeComp } = this.props.editor

                if (!activeComp) {
                    this.props.context.executeOperation(EditorOps.notify, {
                        message: t('errors.compositionNotSelected'),
                        title: 'Woops',
                        level: 'info',
                        timeout: 4000,
                    })

                    return
                }

                if (!activeComp || !dragEntity || dragEntity.type !== 'asset') return
                const { asset } = dragEntity
                this.props.context.executeOperation(ProjectOps.addLayerWithAsset, {
                    targetComposition: activeComp,
                    asset,
                })
            }

            private _onSeeked = (frame: number) => {
                this.props.context.executeOperation(EditorOps.seekPreviewFrame, {
                    frame,
                })
            }
        },
    ),
)
