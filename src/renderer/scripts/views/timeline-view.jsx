import _ from 'lodash';
import React, {PropTypes} from 'react'

import Actions from '../actions'
import AppStore from '../stores/app-store'
import ProjectStore from '../stores/project-store'

import Workspace from './components/workspace'
import Pane from './components/pane'

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
        // e.preventDefault()

        this.setState({
            dragStartPosition: {
                clientX: e.clientX,
                clientY: e.clientY
            }
        })

        // console.log('layer - dragstart');

        dragSession.set(this, {
            type: 'delir/drag-layer',
            layerId: this.props.layer.id,
        })

        this.props.dragStart(this)

        // e.dataTransfer.setData('application/json', JSON.stringify({
        //     type: 'delir/drag-layer',
        //     layerId: this.props.layer.id,
        // }))
    }

    drag(e)
    {
        // console.log(Object.assign({}, e));

        const movedX = e.clientX - this.state.dragStartPosition.clientX
        const movedY = e.clientY - this.state.dragStartPosition.clientY

        // console.log('layer - drag');

        this.setState({
            dragStyle: {
                transform: `translateX(${movedX}px) translateY(${movedY}px)`
            }
        })
    }

    dragEnd(e)
    {
        // console.log('DragEnd', Object.assign({}, e));
        // console.log('layer - dragend');

        this.setState({
            dragStyle: {
                transform: 'translateX(0)'
            }
        })
    }


    render()
    {
        // console.log({left: 30, ...this.state.dragStyle});

        return (
            <div className='timerange-bar'
                style={{left: 30, ...this.state.dragStyle}}
                draggable={true}
                onClick={this.selectLayer.bind(this)}
                onDragStart={this.dragStart.bind(this)}
                onDrag={this.drag.bind(this)}
                onDragEnd={this.dragEnd.bind(this)}
            />
        )
    }
}

class TimelineLane extends React.Component
{
    static propTypes = {
        timelane: PropTypes.object.isRequired,
    }

    draggingLayer = null

    onDrop(e)
    {
        // e.preventDefault()
        // e.stopPropagation()

        console.log('lane - drop', this.props.timelane.id)
        const data = JSON.parse(e.dataTransfer.getData('application/json'))
        // console.log(data);

        if (data.type !== 'delir/drag-layer') {
            return
        }

        // Actions.moveLayerToTimelane(data.layerId, this.props.timelane.id)
    }

    // onDragEnd(e)
    // {
    //     console.log('lane - dragend', this.props.timelane.id);
    // }

    onDragOver(e)
    {
        console.log('lane - dragover', this.props.timelane.id);

        // console.log(e.dataTransfer.getData('application/json'));
        // const {layerId} = JSON.parse(e.dataTransfer.getData('application/json'))
        // console.log(_.find(Array.from(timelane.layers.values()), {id: layerId}))

        const {layerId} = dragSession.get(this.draggingLayer)
        let hasChild = _.find(Array.from(this.props.timelane.layers.values()), {id: layerId})

        // console.log(hasChild);
        if (! hasChild) {
            e.preventDefault()
        }

        // console.log('over');
        // e.stopPropagation()
    }

    layerDragStart(c)
    {
        this.draggingLayer = c
    }

    render()
    {
        const {timelane} = this.props

        return (
            <li
                className='timeline-lane'
                data-lane-id={timelane.id}
                onDragOver={this.onDragOver.bind(this)}
                onDrop={this.onDrop.bind(this)}
            >
                {Array.from(timelane.layers.values()).map(layer => (
                    <TimelineLaneLayer key={layer.id} layer={layer} dragStart={this.layerDragStart.bind(this)}/>
                ))}
            </li>
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
                            <span>Label</span>
                            <span>Label</span>
                            <span>Label</span>
                        </div>

                        <div ref='timelineLabels' className='timeline-labels' onScroll={this.scrollSync.bind(this)}>
                            {timelineLanes.map((lane, idx) => (
                                <ul key={idx} className='timeline-labels-label'>
                                    <li className='timeline-labels-label-item'>
                                        Lane1 {idx}
                                    </li>
                                    <li className='timeline-labels-label-item'>
                                        🙈
                                    </li>
                                    <li className='timeline-labels-label-item'>
                                        🙆
                                    </li>
                                    <li className='timeline-labels-label-item'>
                                        <input type='checkbox' />
                                    </li>
                                </ul>
                            ))}
                        </div>
                    </Pane>
                    <Pane className='timeline-container'>
                        <div className='timeline-gradations'>
                            <div className='timeline-playingCursor' style={{height:this.state.cursorHeight}}></div>
                        </div>

                        <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
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
