import _ from 'lodash';
import classnames from 'classnames'
import React, {PropTypes} from 'react'

import EditorStateActions from '../actions/editor-state-actions'
import ProjectModifyActions from '../actions/project-modify-actions'

import RendererService from '../services/renderer'

import EditorStateStore from '../stores/editor-state-store'
import ProjectModifyStore from '../stores/project-modify-store'

import TimelaneHelper from '../helpers/timelane-helper'

import Workspace from './components/workspace'
import Pane from './components/pane'
import LabelInput from './components/label-input'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import SelectList from './components/select-list'

const dragSession = new WeakMap()

class TimelineLaneLayer extends React.Component
{
    static propTypes = {
        layer: PropTypes.object.isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        onChangePlace: PropTypes.func.isRequired,
    }

    removers = []

    constructor()
    {
        super()

        this.state = {
            project: EditorStateStore.getState(),
            draggedPxX: 0,
            dragStartPosition: null,
            dragStyle: {transform: 'translateX(0)'},
        }

        this.removers.push(EditorStateStore.addListener(() => {
            this.setState({project: EditorStateStore.getState()})
        }))
    }

    componentWillUnmount()
    {
        this.removers.forEach(remover => remover.remove())
    }

    selectLayer(e)
    {
        EditorStateActions.changeActiveLayer(this.props.layer.id)
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
            draggedPxX: movedX,
            dragStyle: {
                transform: `translateX(${movedX}px)`
            }
        })
    }

    dragEnd(e)
    {
        this.props.onChangePlace(this.state.draggedPxX)

        this.setState({
            draggedPxX: 0,
            dragStyle: {
                transform: 'translateX(0)'
            }
        })
    }

    removeLayer = layerId =>
    {
        ProjectModifyActions.removeLayer(layerId)
    }

    render()
    {
        const {layer} = this.props

        return (
            <div className='timerange-bar'
                style={{
                    left: this.props.left,
                    width: this.props.width,
                    ...this.state.dragStyle,
                }}
                draggable={true}
                onClick={this.selectLayer.bind(this)}
                onDragStart={this.dragStart.bind(this)}
                onDrag={this.drag.bind(this)}
                onDragEnd={this.dragEnd.bind(this)}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label='remove ' onClick={this.removeLayer.bind(null, layer.id)} />
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
        framerate: PropTypes.number.isRequired,
        scale: PropTypes.number.isRequired,
    }

    constructor()
    {
        super()

        this.state = {
            dragovered: false,
            pxPerSec: 30,
        }
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

        ProjectModifyActions.moveLayerToTimelane(data.layerId, this.props.timelane.id)
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

    changeLayerPlace(layer, movedX)
    {
        const movedFrames = TimelaneHelper.pixelToFrames({
            pxPerSec: this.state.pxPerSec,
            framerate: this.props.framerate,
            pixel: movedX,
            scale: this.props.scale,
        })

        layer.placedFrame = layer.placedFrame + movedFrames
        console.log(layer.placedFrame, movedFrames);
        this.setState({a: Math.random()})
    }

    addNewLayer = (layerRendererId) =>
    {
        ProjectModifyActions.createLayer(this.props.timelane.id, layerRendererId)
    }

    render()
    {
        const {timelane} = this.props
        const plugins = RendererService.pluginRegistry.getLoadedPluginSummaries()


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
                    <MenuItem label='Add new Layer'>
                        {_.map(plugins, p =>
                            <MenuItem label={p.packageName} onClick={this.addNewLayer.bind(null, p.packageId)} />
                        )}
                    </MenuItem>
                    <MenuItem type='separator' />
                </ContextMenu>

                {Array.from(timelane.layers.values()).map(layer => {
                    const opt = {
                        pxPerSec: this.state.pxPerSec,
                        framerate: this.props.framerate,
                        scale: this.props.scale,
                    };
                    const width = TimelaneHelper.framesToPixel({
                        durationFrame: layer.durationFrame|0,
                        ...opt,
                    })
                    const left = TimelaneHelper.framesToPixel({
                        durationFrame: layer.placedFrame|0,
                        ...opt,
                    })

                    return (
                        <TimelineLaneLayer
                            key={layer.id}
                            layer={layer}
                            width={width}
                            left={left}
                            onChangePlace={this.changeLayerPlace.bind(this, layer)}
                        />
                    )
                })}
            </li>
        )
    }
}

class TimelineGradations extends React.Component
{
    static propTypes = {
        cursorHeight: PropTypes.number.isRequired,
    }

    intervalId = null

    state = {
        left: 0,
    }

    componentDidMount()
    {
        this.intervalId = setInterval(() => {
            const project = EditorStateStore.getState()
            if (! project) return

            const renderer = RendererService.renderer
            if (! renderer.isPlaying()) return

            this.setState({
                left: TimelaneHelper.framesToPixel({
                    pxPerSec: 30,
                    framerate: this.props.framerate,
                    durationFrame: renderer.session.lastRenderedFrame,
                    scale: this.props.scale,
                }),
            })
        }, 1)
    }

    componentWillUnmount()
    {
        clearInterval(this.intervalId)
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
            ..._.pick(EditorStateStore.getState(), ['project', 'activeComp']),
        }

        EditorStateStore.addListener(() => {
            this.setState(_.pick(EditorStateStore.getState(), ['project', 'activeComp']))
        })

        ProjectModifyStore.addListener(() => {
            console.log('csl');
            this.setState({})
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

    scaleChanged = scale =>
    {
        this.setState({scale: scale})
    }

    addNewTimelane = () =>
    {
        if (!this.state.activeComp) return
        ProjectModifyActions.createTimelane(this.state.activeComp.id)
    }

    removeTimelane = timelaneId =>
    {
        if (!this.state.activeComp) return
        ProjectModifyActions.removeTimelane(timelaneId)
    }

    render()
    {
        const {project, activeComp} = this.state
        const {id: compId, framerate} = activeComp ? activeComp : {id: '', framerate: 30}
        const timelineLanes = activeComp ? Array.from(activeComp.timelanes.values()) : []

        return (
            <Pane className='view-timeline' allowFocus>
                <Workspace direction="horizontal">
                    <Pane className='timeline-labels-container'>
                        <div className='timeline-labels-header'>
                            <div className='--col-name'>Lanes</div>
                            <LabelInput
                                style={{float:'right'}}
                                onChange={this.scaleChanged}
                                defaultValue="1"
                                doubleClickToEdit
                            />
                            {/*
                                <div className='--col-visibility'>Label</div>
                                <div className='--col-lock'>Label</div>
                            */}
                        </div>

                        <div ref='timelineLabels' className='timeline-labels' onScroll={this.scrollSync.bind(this)}>
                            <ContextMenu>
                                <MenuItem type='separator' />
                                <MenuItem label='Add new timelane' onClick={this.addNewTimelane} />
                                <MenuItem type='separator' />
                            </ContextMenu>
                            <SelectList key={compId}>
                                {timelineLanes.map(lane => {
                                    return (
                                        <ul key={lane.id} className='timeline-labels-label'>
                                            <ContextMenu>
                                                <MenuItem type='separator' />
                                                <MenuItem label='複製' onClick={() => {}} />
                                                <MenuItem label='削除' onClick={this.removeTimelane.bind(null, lane.id)} />
                                                <MenuItem type='separator' />
                                            </ContextMenu>

                                            <li className='timeline-labels-label-item --col-name' onClick={this.laneSelected.bind(this, lane.id)}>
                                                {/* {this.state.selectedLaneId === lane.id && '*'} */}
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
                            </SelectList>
                        </div>
                    </Pane>
                    <Pane className='timeline-container'>
                        <TimelineGradations
                            cursorHeight={this.state.cursorHeight}
                            framerate={framerate}
                            scale={this.state.scale}
                        />

                        <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
                            <ContextMenu>
                                <MenuItem type='separator' />
                                <MenuItem label='Add new timelane' onClick={this.addNewTimelane} />
                                <MenuItem type='separator' />
                            </ContextMenu>
                            {timelineLanes.map(lane => (
                                <TimelineLane key={lane.id} timelane={lane} framerate={framerate} scale={this.state.scale}/>
                            ))}
                        </ul>
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}
