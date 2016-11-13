import _ from 'lodash'
import classnames from 'classnames'
import React, {PropTypes} from 'react'
import {Disposable} from 'event-kit'

import EditorStateActions from '../actions/editor-state-actions'
import ProjectModifyActions from '../actions/project-modify-actions'

import RendererService from '../services/renderer'

import EditorStateStore from '../stores/editor-state-store'
import ProjectModifyStore from '../stores/project-modify-store'

import TimelaneHelper from '../helpers/timelane-helper'

import Workspace from './components/workspace'
import Pane from './components/pane'
import LabelInput from './components/label-input'

import {ContextMenu, MenuItem} from './electron/context-menu'
import SelectList from './components/select-list'

import LaneLabel from './timeline/lane-label'
import LaneKeyframes from './timeline/lane-keyframes'

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

    makeAlias = layerId =>
    {
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
                    <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, layer.id)} />
                    <MenuItem label='remove ' onClick={this.removeLayer.bind(null, layer.id)} />
                    <MenuItem type='separator' />
                </ContextMenu>
                <span>#{layer.id.substring(0, 4)}</span>
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
        activeLayer: PropTypes.object.isRequired,
    }

    constructor()
    {
        super()

        this._plugins = RendererService.pluginRegistry.getLoadedPluginSummaries()

        this.state = {
            dragovered: false,
            pxPerSec: 30,
            // editorState: EditorStateStore.getState(),
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
        this.setState({a: Math.random()})
    }

    addNewLayer = (layerRendererId) =>
    {
        ProjectModifyActions.createLayer(this.props.timelane.id, layerRendererId)
    }

    render()
    {
        const {timelane, activeLayer} = this.props
        const {keyframes} = activeLayer ? activeLayer : {}
        const layers = Array.from(timelane.layers.values())
        const plugins = this._plugins

        const tmpKey = keyframes ? Object.keys(keyframes)[1] : ''

        return (
            <li
                className={classnames('timeline-lane', {
                    dragover: this.state.dragovered,
                    '--expand': layers.findIndex(layer => !!(activeLayer && layer.id === activeLayer.id)) !== -1,
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

                <div className='timeline-lane-layers'>
                    {layers.map(layer => {
                        const opt = {
                            pxPerSec: this.state.pxPerSec,
                            framerate: this.props.framerate,
                            scale: this.props.scale,
                        };
                        const width = TimelaneHelper.framesToPixel({
                            durationFrames: layer.durationFrames|0,
                            ...opt,
                        })
                        const left = TimelaneHelper.framesToPixel({
                            durationFrames: layer.placedFrames|0,
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
                </div>
                <LaneKeyframes
                    height={100}
                    pxPerSec={this.state.pxPerSec}
                    framerate={this.props.framerate}
                    keyframes={keyframes && keyframes[tmpKey] ? keyframes[tmpKey] : []}
                />
            </li>
        )
    }
}

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
            ..._.pick(EditorStateStore.getState(), ['project', 'activeComp', 'activeLayer']),
        }

        EditorStateStore.addListener(() => {
            this.setState(_.pick(EditorStateStore.getState(), ['project', 'activeComp', 'activeLayer']))
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
        if (!this.state.activeComp) return
        ProjectModifyActions.createTimelane(this.state.activeComp.id)
    }

    removeTimelane = timelaneId =>
    {
        if (!this.state.activeComp) return
        ProjectModifyActions.removeTimelane(timelaneId)
    }

    scaleTimeline = e =>
    {
        if (e.altKey) {
            this.setState({scale: this.state.scale + (e.deltaY * .05)})
        }
    }

    render()
    {
        const {project, activeComp, scale, activeLayer} = this.state
        const {id: compId, framerate} = activeComp ? activeComp : {id: '', framerate: 30}
        const timelineLanes = activeComp ? Array.from(activeComp.timelanes.values()) : []

        return (
            <Pane className='view-timeline' allowFocus>
                <Workspace direction="horizontal">
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
                            {activeComp && (
                                <div>
                                    <ContextMenu>
                                        <MenuItem type='separator' />
                                        <MenuItem label='Add new timelane' onClick={this.addNewTimelane} />
                                        <MenuItem type='separator' />
                                    </ContextMenu>
                                    <SelectList key={compId}>
                                        {timelineLanes.map(lane => (
                                            <LaneLabel key={lane.id} timelane={lane} onSelect={this.laneSelected} onRemove={this.removeTimelane} />)
                                        )}
                                    </SelectList>
                                </div>
                            )}
                        </div>
                    </Pane>
                    <Pane className='timeline-container' onWheel={this.scaleTimeline}>
                        <TimelineGradations
                            cursorHeight={this.state.cursorHeight}
                            framerate={framerate}
                            scale={this.state.scale}
                            activeProject={project}
                        />

                            <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
                                {activeComp && (
                                    <div>
                                        <ContextMenu>
                                            <MenuItem type='separator' />
                                            <MenuItem label='Add new timelane' onClick={this.addNewTimelane} />
                                            <MenuItem type='separator' />
                                        </ContextMenu>
                                        {timelineLanes.map(timelane => (
                                            <TimelineLane
                                                key={timelane.id}
                                                timelane={timelane}
                                                framerate={framerate}
                                                scale={this.state.scale}
                                                activeLayer={activeLayer}
                                            />
                                        ))}
                                    </div>
                                )}
                            </ul>
                        )}
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}
