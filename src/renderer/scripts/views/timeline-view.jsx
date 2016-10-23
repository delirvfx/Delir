import _ from 'lodash';
import classnames from 'classnames'
import React, {PropTypes} from 'react'

import Actions from '../actions'
import AppStore from '../stores/app-store'
import ProjectStore from '../stores/project-store'

import Workspace from './components/workspace'
import Pane from './components/pane'
import LabelInput from './components/label-input'

import {ContextMenu, MenuItem} from '../electron/context-menu'

const dragSession = new WeakMap()

class TimelineLaneLayer extends React.Component
{
    removers = []

    constructor()
    {
        super()

        this.state = {
            project: ProjectStore.getState(),
            dragStartPosition: null,
            dragStyle: {transform: 'translateX(0)'},
        }

        this.removers.push(ProjectStore.addListener(() => {
            this.setState({project: ProjectStore.getState()})
        }))
    }

    componentWillUnmount()
    {
        this.removers.forEach(remover => remover.remove())
    }

    selectLayer(e)
    {
        Actions.changeActiveLayer(this.props.layer.id)
    }

    dragStart(e)
    {
        this.setState({
            dragStartPosition: {
                clientX: e.clientX,
                clientY: e.clientY
            }
        })

        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'delir/drag-layer',
            layerId: this.props.layer.id,
        }))
    }

    drag(e)
    {
        const movedX = e.clientX - this.state.dragStartPosition.clientX
        const movedY = e.clientY - this.state.dragStartPosition.clientY

        this.setState({
            dragStyle: {
                transform: `translateX(${movedX}px)`
            }
        })
    }

    dragEnd(e)
    {
        this.setState({
            dragStyle: {
                transform: 'translateX(0)'
            }
        })
    }


    render()
    {
        return (
            <div className='timerange-bar'
                style={{left: 30, ...this.state.dragStyle}}
                draggable={true}
                onClick={this.selectLayer.bind(this)}
                onDragStart={this.dragStart.bind(this)}
                onDrag={this.drag.bind(this)}
                onDragEnd={this.dragEnd.bind(this)}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label='Remote it' onClick={() => {}} />
                    <MenuItem type='separator' />
                </ContextMenu>
            </div>
        )
    }
}

class TimelineLane extends React.Component
{
    static propTypes = {
        timelane: PropTypes.object.isRequired,
    }

    state = {
        dragovered: false
    }

    onDrop(e)
    {
        e.preventDefault()
        e.stopPropagation()

        this.setState({dragovered: false})

        const data = JSON.parse(e.dataTransfer.getData('application/json'))
        const {layerId} = data
        let isChildLayer = !! _.find(Array.from(this.props.timelane.layers.values()), {id: layerId})

        if (data.type !== 'delir/drag-layer' || isChildLayer) {
            return
        }

        Actions.moveLayerToTimelane(data.layerId, this.props.timelane.id)
    }

    onDragLeave(e)
    {
        this.setState({dragovered: false})
    }

    onDragOver(e)
    {
        e.preventDefault()
        e.stopPropagation()
        this.setState({dragovered: true})
    }

    render()
    {
        const {timelane} = this.props

        return (
            <li
                className={classnames('timeline-lane', {
                    dragover: this.state.dragovered,
                })}
                data-lane-id={timelane.id}
                onDragOver={this.onDragOver.bind(this)}
                onDragLeave={this.onDragLeave.bind(this)}
                onDrop={this.onDrop.bind(this)}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label='Add new Layer' onClick={() => {}} />
                    <MenuItem type='separator' />
                </ContextMenu>

                {Array.from(timelane.layers.values()).map(layer => (
                    <TimelineLaneLayer key={layer.id} layer={layer} />
                ))}
            </li>
        )
    }
}

class TimelineGradations extends React.Component
{
    static propTypes = {
        cursorHeight: PropTypes.number.isRequired,
    }

    render()
    {
        return (
            <div className='timeline-gradations'>
                <div className='timeline-playingCursor' style={{height:this.props.cursorHeight}}></div>
            </div>
        )
    }
}

export default class TimelineView extends React.Component
{
    constructor()
    {
        super()

        this.state = {
            project: ProjectStore.getState(),
            timelineScrollTop: 0,
            cursorHeight: 0,
            selectedLaneId: null,
        }

        ProjectStore.addListener(() => {
            this.setState({project: ProjectStore.getState()})
        })
    }

    scrollSync(event)
    {
        this.setState({'timelineScrollTop': event.target.scrollTop})
    }

    componentDidMount()
    {
        // console.log(this.refs.timelineLanes);
        this.setState({
            cursorHeight: this.refs.timelineLanes.getBoundingClientRect().height + 1
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

    render()
    {
        const {project} = this.state
        const timelineLanes = project.activeComp ? Array.from(project.activeComp.timelanes.values()) : []
        // console.log(timelineLanes);

        return (
            <Pane className='view-timeline' allowFocus>
                <Workspace direction="horizontal">
                    <Pane className='timeline-labels-container'>
                        <div className='timeline-labels-header'>
                            <div className='--col-name'>Lanes</div>
                            {/*
                                <div className='--col-visibility'>Label</div>
                                <div className='--col-lock'>Label</div>
                            */}
                        </div>

                        <div ref='timelineLabels' className='timeline-labels' onScroll={this.scrollSync.bind(this)}>
                            <ContextMenu>
                                <MenuItem type='separator' />
                                <MenuItem label='Add new timelane' onClick={() => {}} />
                                <MenuItem type='separator' />
                            </ContextMenu>
                            {timelineLanes.map(lane => {
                                return (
                                    <ul key={lane.id} className='timeline-labels-label'>
                                        <ContextMenu>
                                            <MenuItem type='separator' />
                                            <MenuItem label='複製' onClick={() => {}} />
                                            <MenuItem label='削除' onClick={() => {}} />
                                            <MenuItem type='separator' />
                                        </ContextMenu>

                                        <li className='timeline-labels-label-item --col-name' onClick={this.laneSelected.bind(this, lane.id)}>
                                            {/* {this.state.selectedLaneId === lane.id && '*'} */}
                                            {console.log(lane)}
                                            <LabelInput defaultValue={lane.name} placeholder='TimeLane' />
                                        </li>
                                        <li className='timeline-labels-label-item --col-visibility'>
                                            🙈
                                        </li>
                                        <li className='timeline-labels-label-item --col-lock'>
                                            🙆
                                        </li>
                                    </ul>
                                )
                            })}
                        </div>
                    </Pane>
                    <Pane className='timeline-container'>
                        <TimelineGradations cursorHeight={this.state.cursorHeight}/>

                        <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
                            <ContextMenu>
                                <MenuItem type='separator' />
                                <MenuItem label='Add new timelane' onClick={() => {}} />
                                <MenuItem type='separator' />
                            </ContextMenu>
                            {timelineLanes.map(lane => (
                                <TimelineLane key={lane.id} timelane={lane} />
                            ))}
                        </ul>
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}
