import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

interface TimelaneLayerProps {
    layer: Delir.Project.Layer,
    left: number,
    width: number,
    onChangePlace: (draggedPx: number) => any,
}

interface TimelaneLayerState {
    draggedPxX: number,
    dragStartPosition: {clientX: number, clientY: number}|null,
    dragStyle: {[prop: string]: string}|null
}

export default class TimelaneLayer extends React.Component<TimelaneLayerProps, TimelaneLayerState>
{
    static propTypes = {
        layer: PropTypes.object.isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        onChangePlace: PropTypes.func.isRequired,
    }

    constructor()
    {
        super()

        this.state = {
            draggedPxX: 0,
            dragStartPosition: null,
            dragStyle: {transform: 'translateX(0)'},
        }
    }

    selectLayer = e => {
        EditorStateActions.changeActiveLayer(this.props.layer.id)
    }

    dragStart = e => {
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

    drag = (e) => {
        const movedX = e.clientX - this.state.dragStartPosition.clientX
        const movedY = e.clientY - this.state.dragStartPosition.clientY

        this.setState({
            draggedPxX: movedX,
            dragStyle: {
                transform: `translateX(${movedX}px)`
            }
        })
    }

    dragEnd = (e) => {
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
                onClick={this.selectLayer}
                onDragStart={this.dragStart}
                onDrag={this.drag}
                onDragEnd={this.dragEnd}
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