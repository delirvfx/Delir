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

import EditorStateStore from '../../stores/editor-state-store'
import ProjectModifyStore from '../../stores/project-modify-store'

import TimelaneHelper from '../../helpers/timelane-helper'

import Workspace from '../components/workspace'
import Pane from '../components/pane'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import SelectList from '../components/select-list'

import LaneLabel from '../timeline/lane-label'
import LaneKeyframes from '../timeline/lane-keyframes'

import TimelaneLayerList from './_TimelaneLayerList'

class TimelineGradations extends React.Component
{
    static propTypes = {
        activeProject: PropTypes.object.isRequired,
        cursorHeight: PropTypes.number.isRequired,
    }

    intervalId = null

    state = {
        left: 0,
    }

    componentDidMount()
    {
        this.intervalId = requestAnimationFrame(this.updateCursor)
    }

    componentWillUnmount()
    {
        cancelAnimationFrame(this.intervalId)
    }

    updateCursor = () =>
    {
        const renderer = RendererService.renderer

        if (this.props.activeProject && renderer.isPlaying) {
            this.setState({
                left: TimelaneHelper.framesToPixel({
                    pxPerSec: 30,
                    framerate: this.props.framerate,
                    durationFrames: renderer.session.lastRenderedFrame,
                    scale: this.props.scale,
                }),
            })
        }

        this.intervalId = requestAnimationFrame(this.updateCursor)
    }

    render()
    {
        return (
            <div className='timeline-gradations'>
                <div className='timeline-playingCursor' style={{
                    left: this.state.left,
                    height: this.props.cursorHeight
                }} />
            </div>
        )
    }
}

@connectToStores([EditorStateStore, ProjectModifyStore], context => ({
    editor: EditorStateStore.getState(),
}))
export default class TimelineView extends React.Component
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

        if (dragEntity.type !== 'asset') return
        const {entity: asset} = dragEntity
        const processablePlugins = RendererService.pluginRegistry.getPluginsByAcceptFileType(asset.mimeType)

        // TODO: Support selection
        if (processablePlugins.length) {
            const timelane = new Delir.Project.Timelane
            timelane.id = uuid.v4()

            const layer = new Delir.Project.Layer
            Object.assign(layer, {
                id: uuid.v4(),
                renderer: processablePlugins[0].id,
                placedFrame: 0,
                durationFrames: 1,
            })

            timelane.layers.add(layer)
            ProjectModifyActions.addTimelane(activeComp, timelane)
        }
    }

    render()
    {
        const {scale} = this.state
        const {project, activeComp, activeLayer} = this.props.editor
        const {id: compId, framerate} = activeComp ? activeComp : {id: '', framerate: 30}
        const timelineLanes = activeComp ? Array.from(activeComp.timelanes) : []

        return (
            <Pane className='view-timeline' allowFocus>
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
                        <TimelineGradations
                            cursorHeight={this.state.cursorHeight}
                            framerate={framerate}
                            scale={this.state.scale}
                            activeProject={project}
                        />

                        <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
                            <ContextMenu>
                                <MenuItem type='separator' />
                                <MenuItem label='Add new timelane' onClick={this.addNewTimelane} enabled={!!activeComp} />
                                <MenuItem type='separator' />
                            </ContextMenu>
                            {activeComp && timelineLanes.map(timelane => (
                                <TimelaneLayerList
                                    key={timelane.id}
                                    timelane={timelane}
                                    framerate={framerate}
                                    scale={this.state.scale}
                                    activeLayer={activeLayer}
                                />
                            ))}
                        </ul>
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}
