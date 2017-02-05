import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import classnames from 'classnames'
import * as Delir from 'delir-core'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import RendererService from '../../services/renderer'
import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'
import TimelaneHelper from '../../helpers/timelane-helper'

import TimelaneLayer from './_TimelaneLayer'
import LaneKeyframes from '../timeline/lane-keyframes'

interface TimelaneLaneProps {
    timelane: Delir.Project.Timelane,
    activeLayer: Delir.Project.Layer,
    framerate: number,
    scale: number,
}

interface TimelaneLaneState {
    dragovered: boolean,
    pxPerSec: number,
}

export default class TimelineLane extends React.Component<TimelaneLaneProps, TimelaneLaneState>
{
    static propTypes = {
        timelane: PropTypes.object.isRequired,
        framerate: PropTypes.number.isRequired,
        scale: PropTypes.number.isRequired,
        activeLayer: PropTypes.object.isRequired,
    }

    _plugins: {packageId: string, packageName: string}[]

    constructor()
    {
        super()

        this._plugins = RendererService.pluginRegistry.getLoadedPluginSummaries()

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

        ProjectModifyActions.modifyLayer(layer.id, {placedFrame: layer.placedFrame + movedFrames})
    }

    addNewLayer = (layerRendererId) =>
    {
        ProjectModifyActions.createLayer(this.props.timelane.id, layerRendererId, 0, 100)
    }

    render()
    {
        const {timelane, activeLayer, framerate, scale} = this.props
        const {pxPerSec} = this.state
        const keyframes = activeLayer ? activeLayer.keyframes : {}
        const layers = Array.from<Delir.Project.Layer>(timelane.layers.values())
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
                    <MenuItem label='Add new Layer' enabled={!!plugins.length}>
                        {_.map(plugins, p =>
                            <MenuItem label={p.packageName} onClick={this.addNewLayer.bind(null, p.packageId)} />
                        )}
                    </MenuItem>
                    <MenuItem type='separator' />
                </ContextMenu>

                <div className='timeline-lane-layers'>
                    {layers.map(layer => {
                        const opt = {
                            pxPerSec: pxPerSec,
                            framerate: framerate,
                            scale: scale,
                        };
                        const width = TimelaneHelper.framesToPixel({
                            durationFrames: layer.durationFrames|0,
                            ...opt,
                        })
                        const left = TimelaneHelper.framesToPixel({
                            durationFrames: layer.placedFrame|0,
                            ...opt,
                        })

                        return (
                            <TimelaneLayer
                                key={layer.id!}
                                layer={layer}
                                width={width}
                                left={left}
                                onChangePlace={this.changeLayerPlace.bind(this, layer)}
                            />
                        )
                    })}
                </div>
                <LaneKeyframes keyframes={keyframes && keyframes[tmpKey] ? keyframes[tmpKey] : []} pxPerSec={pxPerSec} />
            </li>
        )
    }
}