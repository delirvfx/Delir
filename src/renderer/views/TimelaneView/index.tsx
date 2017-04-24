import _ from 'lodash'
import * as uuid from 'uuid'
import * as classnames from 'classnames'
import * as React from 'react'
import {PropTypes} from 'react'
import * as ReactDOM from 'react-dom'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import RendererService from '../../services/renderer'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import {default as ProjectModifyStore, ProjectModifyState} from '../../stores/project-modify-store'

import Workspace from '../components/workspace'
import Pane from '../components/pane'

import {ContextMenu, MenuItem} from '../components/context-menu'
import SelectList from '../components/select-list'
import DropDown from '../components/dropdown'

import LaneLabel from '../timeline/lane-label'
import KeyframeView from '../KeyframeView'
import ClipSpace from './_ClipSpace'
import Gradations from './_Gradations'

import * as s from './style.styl'

interface TimelineViewProps {
    editor: EditorState,
    project: ProjectModifyState,
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
@connectToStores([EditorStateStore, ProjectModifyStore], context => ({
    editor: EditorStateStore.getState(),
}))
export default class TimelineView extends React.Component<TimelineViewProps, TimelineViewState>
{
    protected refs: {
        scaleList: DropDown
        keyframeView: KeyframeView
        timelineLanes: HTMLUListElement
        timelineLabels: HTMLDivElement
    }

    protected state: TimelineViewState = {
        timelineScrollTop: 0,
        timelineScrollLeft: 0,
        cursorHeight: 0,
        scale: 1,
        selectedLaneId: null,
    }

    protected componentDidMount()
    {
        const {timelineLanes, keyframeView} = this.refs

        const timelineHeight = timelineLanes.getBoundingClientRect().height
        const keyFrameViewHeight = ReactDOM.findDOMNode(keyframeView).getBoundingClientRect().height

        this.setState({
            cursorHeight: timelineHeight + keyFrameViewHeight + 1
        })
    }

    protected componentDidUpdate()
    {
        this.refs.timelineLabels.scrollTop = this.refs.timelineLanes.scrollTop = this.state.timelineScrollTop
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

        ProjectModifyActions.addLayer(
            this.props.editor.activeComp,
            new Delir.Project.Layer
        )
    }

    private _removeLayer = layerId =>
    {
        if (!this.props.editor.activeComp) return
        ProjectModifyActions.removeLayer(layerId)
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
        this.setState({scale: scale})
    }

    private _dropAsset = e =>
    {
        const {dragEntity, activeComp} = this.props.editor

        if (!activeComp) {
            EditorStateActions.notify('Must be select any composition before add assets to timeline', 'Woops', 'error', 1000)
            return
        }

        if (!activeComp || !dragEntity || dragEntity.type !== 'asset') return
        const {asset} = dragEntity
        ProjectModifyActions.addLayerWithAsset(activeComp, asset)
    }

    private _onSeeked = (frame: number) =>
    {
        EditorStateActions.seekPreviewFrame(frame)
    }

    protected render()
    {
        const {scale, timelineScrollLeft} = this.state
        const {activeComp, activeClip} = this.props.editor
        const {id: compId, framerate} = activeComp ? activeComp : {id: '', framerate: 30}
        const timelineLanes = activeComp ? Array.from(activeComp.layers) : []

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

                                <div ref='timelineLabels' className='timeline-labels' onScroll={this._scrollSync.bind(this)}>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label='レイヤーを追加' onClick={this._addNewLayer} enabled={!!activeComp} />
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
                                    cursorHeight={this.state.cursorHeight}
                                    scale={this.state.scale}
                                    pxPerSec={PX_PER_SEC}
                                    scrollLeft={timelineScrollLeft}
                                    onSeeked={this._onSeeked}
                                />

                                <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this._scrollSync}>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label='レイヤーを追加' onClick={this._addNewLayer} enabled={!!activeComp} />
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
                        <KeyframeView ref='keyframeView' activeClip={activeClip} pxPerSec={PX_PER_SEC} scale={scale} />
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}
