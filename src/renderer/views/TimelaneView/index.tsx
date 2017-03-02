import _ from 'lodash'
import * as uuid from 'uuid'
import * as classnames from 'classnames'
import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import RendererService from '../../services/renderer'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import {default as ProjectModifyStore, ProjectModifyState} from '../../stores/project-modify-store'

import TimelaneHelper from '../../helpers/timelane-helper'

import Workspace from '../components/workspace'
import Pane from '../components/pane'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import SelectList from '../components/select-list'

import LaneLabel from '../timeline/lane-label'
import LaneKeyframes from '../timeline/lane-keyframes'
import KeyframeView from '../KeyframeView'
import TimelaneLayerList from './_TimelaneLayerList'
import Gradations from './_Gradations'

import s from './style.styl'

interface TimelineViewProps {
    editor: EditorState,
    project: ProjectModifyState,
}

interface TimelineViewState {
    timelineScrollTop: number,
    cursorHeight: number,
    scale: number,
    selectedLaneId: number|null,
}

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
    constructor()
    {
        super()

        this.state = {
            timelineScrollTop: 0,
            cursorHeight: 0,
            scale: 1,
            selectedLaneId: null,
        }
    }

    scrollSync(event)
    {
        this.setState({'timelineScrollTop': event.target.scrollTop})
    }

    componentDidMount()
    {
        const {timelineLanes} = this.refs
        this.setState({
            cursorHeight: timelineLanes ? timelineLanes.getBoundingClientRect().height + 1 : 0
        })
    }

    componentDidUpdate()
    {
        this.refs.timelineLabels.scrollTop = this.refs.timelineLanes.scrollTop = this.state.timelineScrollTop
    }

    laneSelected = laneId =>
    {
        this.setState({selectedLaneId: laneId})
    }

    scaleChanged = scale =>
    {
        this.setState({scale: scale})
    }

    addNewTimelane = () =>
    {
        if (!this.props.editor.activeComp) return

        ProjectModifyActions.addTimelane(
            this.props.editor.activeComp,
            new Delir.Project.Timelane
        )
    }

    removeTimelane = timelaneId =>
    {
        if (!this.props.editor.activeComp) return
        ProjectModifyActions.removeTimelane(timelaneId)
    }

    scaleTimeline = e =>
    {
        if (e.altKey) {
            this.setState({scale: this.state.scale + (e.deltaY * .05)})
        }
    }

    dropAsset = e =>
    {
        const {dragEntity, activeComp} = this.props.editor

        if (!activeComp) {
            EditorStateActions.notify('Must be select any composition before add assets to timeline', 'Woops', 'error', 1000)
            return
        }

        if (!activeComp || !dragEntity || dragEntity.type !== 'asset') return
        const {asset} = dragEntity
        ProjectModifyActions.addTimelaneWithAsset(activeComp, asset)
    }

    render()
    {
        const {scale} = this.state
        const {project, activeComp, activeLayer} = this.props.editor
        const {id: compId, framerate} = activeComp ? activeComp : {id: '', framerate: 30}
        const timelineLanes = activeComp ? Array.from(activeComp.timelanes) : []

        return (
            <Pane className={s.timelaneView} allowFocus>
                <Workspace direction='vertical'>
                    <Pane>
                        <Workspace direction="horizontal" onDrop={this.dropAsset}>
                            {/* Timelane Panel */}
                            <Pane className='timeline-labels-container'>
                                <div className='timeline-labels-header'>
                                    <div className='--col-name'>Lanes</div>
                                    <span>x {scale}</span>
                                    {/*
                                        <div className='--col-visibility'>Label</div>
                                        <div className='--col-lock'>Label</div>
                                    */}
                                </div>

                                <div ref='timelineLabels' className='timeline-labels' onScroll={this.scrollSync.bind(this)}>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label='Add new timelane' onClick={this.addNewTimelane} enabled={!!activeComp} />
                                        <MenuItem type='separator' />
                                    </ContextMenu>
                                    {activeComp && (
                                        <SelectList key={compId}>
                                            {timelineLanes.map(lane => (
                                                <LaneLabel key={lane.id} timelane={lane} onSelect={this.laneSelected} onRemove={this.removeTimelane} />)
                                            )}
                                        </SelectList>
                                    )}
                                </div>
                            </Pane>
                            {/* Layer Panel */}
                            <Pane className='timeline-container' onWheel={this.scaleTimeline}>
                                <Gradations
                                    cursorHeight={this.state.cursorHeight}
                                    scale={this.state.scale}
                                    activeComposition={activeComp}
                                />

                                <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label='Add new timelane' onClick={this.addNewTimelane} enabled={!!activeComp} />
                                        <MenuItem type='separator' />
                                    </ContextMenu>
                                    {activeComp && timelineLanes.map(timelane => (
                                        <TimelaneLayerList
                                            key={timelane.id!}
                                            timelane={timelane}
                                            framerate={framerate}
                                            scale={this.state.scale}
                                        />
                                    ))}
                                </ul>
                            </Pane>
                        </Workspace>
                    </Pane>
                    <Pane>
                        <KeyframeView activeLayer={activeLayer} />
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}