import * as _ from 'lodash'
import * as uuid from 'uuid'
import * as classnames from 'classnames'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactDOM from 'react-dom'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/Flux/connectToStores'
import TimePixelConversion from '../../utils/TimePixelConversion'

import AppActions from '../../actions/App'
import ProjectModActions from '../../actions/ProjectMod'

import RendererService from '../../services/renderer'

import {default as EditorStateStore, EditorState} from '../../stores/EditorStateStore'
import {default as ProjectStore, ProjectStoreState} from '../../stores/ProjectStore'

import Workspace from '../components/workspace'
import Pane from '../components/pane'

import {ContextMenu, MenuItem} from '../components/ContextMenu'
import SelectList from '../components/select-list'
import DropDown from '../components/dropdown'

import LaneLabel from './LaneLabel'
import KeyframeEditor from '../KeyframeEditor'
import ClipSpace from './_ClipSpace'
import Gradations from './_Gradations'

import t from './Timelane.i18n'
import * as s from './style.styl'

interface TimelineViewProps {
    editor?: EditorState,
}

interface TimelineViewState {
    timelineScrollTop: number,
    timelineScrollLeft: number,
    cursorHeight: number,
    scale: number,
    selectedLaneId: number|null,
}

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
@connectToStores([EditorStateStore, ProjectStore], context => ({
    editor: EditorStateStore.getState(),
}))
export default class TimelineView extends React.Component<TimelineViewProps, TimelineViewState>
{
    public refs: {
        scaleList: DropDown
        keyframeView: KeyframeEditor
        timelineLanes: HTMLUListElement
        timelineLabels: HTMLDivElement
    }

    public state: TimelineViewState = {
        timelineScrollTop: 0,
        timelineScrollLeft: 0,
        cursorHeight: 0,
        scale: 1,
        selectedLaneId: null,
    }

    public componentDidMount()
    {
        this._syncCursorHeight()
        window.addEventListener('resize', _.debounce(this._syncCursorHeight, 1000 / 30))
    }

    public componentDidUpdate()
    {
        this.refs.timelineLabels.scrollTop = this.refs.timelineLanes.scrollTop = this.state.timelineScrollTop
    }

    private _syncCursorHeight = () =>
    {
        const {timelineLanes, keyframeView} = this.refs

        const timelineHeight = timelineLanes.getBoundingClientRect().height
        const keyFrameViewHeight = ReactDOM.findDOMNode(keyframeView).getBoundingClientRect().height

        this.setState({
            cursorHeight: timelineHeight + keyFrameViewHeight + 1
        })
    }

    private _scrollSync = (e: React.WheelEvent<HTMLElement>) =>
    {
        this.setState({
            timelineScrollLeft: e.currentTarget.scrollLeft,
            timelineScrollTop: e.currentTarget.scrollTop
        })
    }

    private _selectLayer = laneId =>
    {
        this.setState({selectedLaneId: laneId})
    }

    private _addNewLayer = () =>
    {
        if (!this.props.editor.activeComp) return

        ProjectModActions.addLayer(
            this.props.editor.activeComp,
            new Delir.Project.Layer
        )
    }

    private _removeLayer = layerId =>
    {
        if (!this.props.editor.activeComp) return
        ProjectModActions.removeLayer(layerId)
    }

    private _scaleTimeline = e =>
    {
        if (e.altKey) {
            const newScale = this.state.scale + (e.deltaY * .05)
            this.setState({scale: Math.max(newScale, .1)})
        }
    }

    private _toggleScaleList = () =>
    {
        this.refs.scaleList.toggle()
    }

    private _selectScale = ({nativeEvent: e}: React.MouseEvent<HTMLLIElement>) => {
        const scale = +(e.target as HTMLLIElement).dataset.value! / 100
        this.refs.scaleList.hide()
        this.setState({scale: scale})
    }

    private _dropAsset = e =>
    {
        const {dragEntity, activeComp} = this.props.editor

        if (!activeComp) {
            AppActions.notify('Must be select any composition before add assets to timeline', 'Woops', 'error', 1000)
            return
        }

        if (!activeComp || !dragEntity || dragEntity.type !== 'asset') return
        const {asset} = dragEntity
        ProjectModActions.addLayerWithAsset(activeComp, asset)
    }

    private _onSeeked = (frame: number) =>
    {
        AppActions.seekPreviewFrame(frame)
    }

    public render()
    {
        const {scale, timelineScrollLeft} = this.state
        const {activeComp, activeClip, currentPreviewFrame, previewPlayed} = this.props.editor
        const {id: compId, framerate} = activeComp ? activeComp : {id: '', framerate: 30}
        const timelineLanes = activeComp ? Array.from(activeComp.layers) : []

        const measures = !activeComp ? [] : TimePixelConversion.buildMeasures({
            durationFrames      : activeComp.durationFrames,
            pxPerSec            : PX_PER_SEC,
            framerate           : activeComp.framerate,
            scale,
            placeIntervalWidth  : 20,
            maxMeasures         : activeComp.durationFrames
        })

        return (
            <Pane className={s.timelineView} allowFocus>
                <Workspace direction='vertical'>
                    <Pane className={s.timelineRegion}>
                        <Workspace direction="horizontal" onDrop={this._dropAsset}>
                            {/* Layer Panel */}
                            <Pane className='timeline-labels-container'>
                                <div className='timeline-labels-header'>
                                    <div className='--col-name'>Lanes</div>
                                    <div className={s.scaleLabel} onClick={this._toggleScaleList}>
                                        <DropDown ref='scaleList' className={s.scaleList} shownInitial={false}>
                                            <li data-value="50" onClick={this._selectScale}>50%</li>
                                            <li data-value="100" onClick={this._selectScale}>100%</li>
                                            <li data-value="150" onClick={this._selectScale}>150%</li>
                                            <li data-value="200" onClick={this._selectScale}>200%</li>
                                            <li data-value="250" onClick={this._selectScale}>250%</li>
                                            <li data-value="300" onClick={this._selectScale}>300%</li>
                                        </DropDown>
                                        Scale: {scale * 100 | 0}%
                                    </div>
                                </div>

                                <div ref='timelineLabels' className='timeline-labels' onScroll={this._scrollSync}>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label={t('contextMenu.addLayer')} onClick={this._addNewLayer} enabled={!!activeComp} />
                                        <MenuItem type='separator' />
                                    </ContextMenu>
                                    {activeComp && (
                                        <SelectList key={compId}>
                                            {timelineLanes.map(lane => (
                                                <LaneLabel key={lane.id} layer={lane} onSelect={this._selectLayer} onRemove={this._removeLayer} />)
                                            )}
                                        </SelectList>
                                    )}
                                </div>
                            </Pane>
                            {/* Layer Panel */}
                            <Pane className='timeline-container' onWheel={this._scaleTimeline}>
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

                                <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this._scrollSync}>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label={t('contextMenu.addLayer')} onClick={this._addNewLayer} enabled={!!activeComp} />
                                        <MenuItem type='separator' />
                                    </ContextMenu>
                                    {activeComp && timelineLanes.map(layer => (
                                        <ClipSpace
                                            key={layer.id!}
                                            layer={layer}
                                            framerate={framerate}
                                            pxPerSec={PX_PER_SEC}
                                            scale={scale}
                                            activeClip={activeClip}
                                        />
                                    ))}
                                </ul>
                            </Pane>
                        </Workspace>
                    </Pane>
                    <Pane className={s.keyframeGraphRegion}>
                        <KeyframeEditor
                            ref='keyframeView'
                            activeComposition={activeComp}
                            activeClip={activeClip}
                            pxPerSec={PX_PER_SEC}
                            scale={scale}
                            scrollLeft={timelineScrollLeft}
                            measures={measures}
                        />
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}
