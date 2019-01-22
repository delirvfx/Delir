import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, StoreGetter, withComponentContext } from '@ragg/fleur-react'
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
import RendererStore from '../../domain/Renderer/RendererStore'

import DropDown from '../../components/dropdown'
import Pane from '../../components/pane'
import Workspace from '../../components/workspace'

import KeyframeEditor from '../KeyframeEditor'
import Gradations from './Gradations'
import Layer from './Layer'
import LayerLabelList from './LayerLabelList'

import * as s from './style.styl'
import t from './Timeline.i18n'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

interface State {
    timelineScrollTop: number
    timelineScrollLeft: number
    timelineScrollWidth: number
    cursorHeight: number
    scale: number
    selectedLayerId: string | null
}

const PX_PER_SEC = 30

const mapStoresToProps = (getStore: StoreGetter) => ({
    activeComp: getStore(EditorStore).getActiveComposition(),
    activeClip: getStore(EditorStore).activeClip,
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
export default withComponentContext(
    connectToStores([EditorStore, ProjectStore], mapStoresToProps)(
        class Timeline extends React.Component<Props, State> {
            public state: State = {
                timelineScrollTop: 0,
                timelineScrollLeft: 0,
                timelineScrollWidth: 0,
                cursorHeight: 0,
                scale: 1,
                selectedLayerId: null,
            }

            private scaleList = React.createRef<DropDown>()
            private timelineContainer = React.createRef<HTMLDivElement>()
            private labelContainer = React.createRef<HTMLDivElement>()
            private keyframeView = React.createRef<InstanceType<typeof KeyframeEditor>>()

            public componentDidMount() {
                this.syncCursorHeight()
                window.addEventListener('resize', _.debounce(this.syncCursorHeight, 1000 / 30))
            }

            public shouldComponentUpdate(nextProps: Props, nextState: State) {
                return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)
            }

            public componentDidUpdate() {
                const { activeComp } = this.props
                const { scale } = this.state
                this.labelContainer.current!.scrollTop = this.timelineContainer.current!.scrollTop = this.state.timelineScrollTop

                if (activeComp) {
                    const { durationFrames, framerate } = activeComp
                    this.setState({
                        timelineScrollWidth: TimePixelConversion.framesToPixel({
                            pxPerSec: PX_PER_SEC,
                            durationFrames: durationFrames + framerate,
                            framerate: framerate,
                            scale,
                        }),
                    })
                }
            }

            public render() {
                const { scale, timelineScrollLeft, timelineScrollWidth } = this.state
                const { previewPlayed, activeComp, activeClip, currentPointFrame } = this.props
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
                                                <DropDown
                                                    ref={this.scaleList}
                                                    className={s.scaleList}
                                                    shownInitial={false}
                                                >
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
                                            ref={this.labelContainer}
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
                                            onScroll={this.handleScrollTimeline}
                                        >
                                            {activeComp &&
                                                layers.map((layer, idx) => (
                                                    <Layer
                                                        key={layer.id!}
                                                        layer={{ ...layer }}
                                                        layerIndex={idx}
                                                        framerate={framerate}
                                                        pxPerSec={PX_PER_SEC}
                                                        scale={scale}
                                                        scrollLeft={timelineScrollLeft}
                                                        scrollWidth={timelineScrollWidth}
                                                    />
                                                ))}
                                        </div>
                                    </Pane>
                                </Workspace>
                            </Pane>
                            <Pane className={s.keyframeGraphRegion}>
                                <KeyframeEditor
                                    ref={this.keyframeView}
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

            private syncCursorHeight = () => {
                const timelineHeight = this.timelineContainer.current!.getBoundingClientRect().height
                const keyFrameViewHeight = (ReactDOM.findDOMNode(
                    this.keyframeView.current!,
                ) as Element).getBoundingClientRect().height

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
                const { activeComp } = this.props
                if (!activeComp) return

                const layer = activeComp.layers[oldIndex]
                this.props.context.executeOperation(ProjectOps.moveLayerOrder, {
                    layerId: layer.id,
                    newIndex,
                })
            }

            private handleAddLayer = () => {
                const { activeComp } = this.props

                if (!activeComp) return
                this.props.context.executeOperation(ProjectOps.addLayer, {
                    targetCompositionId: activeComp.id,
                })
            }

            private onLayerRemove = (layerId: string) => {
                if (!this.props.activeComp) return
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
                const { dragEntity } = this.props.context.getStore(EditorStore).getState()

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
