import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'
import cancelEvent from '../../utils/cancelEvent'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import s from './Clip.styl'

interface TimelaneLayerProps {
    layer: Delir.Project.Clip,
    left: number,
    width: number,
    onChangePlace: (draggedPx: number) => any,
    onChangeDuration: (displayWidth: number) => any,
}

interface TimelaneLayerState {
    draggedPxX: number
    dragStartPosition: {clientX: number, clientY: number}|null
    dragStyle: {[prop: string]: string}|null

    resizeStartPosition: {clientX: number}|null
    resizeMovedX: number
}

export default class TimelaneLayer extends React.Component<TimelaneLayerProps, TimelaneLayerState>
{
    static propTypes = {
        layer: PropTypes.object.isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        onChangePlace: PropTypes.func.isRequired,
        onChangeDuration: PropTypes.func.isRequired,
    }

    constructor()
    {
        super()

        this.state = {
            draggedPxX: 0,
            dragStartPosition: null,
            dragStyle: {transform: 'translateX(0)'},

            resizeStartPosition: null,
            resizeMovedX: 0,
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

        EditorStateActions.setDragEntity({type: 'layer', layer: this.props.layer})
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
        EditorStateActions.clearDragEntity()

        this.setState({
            draggedPxX: 0,
            dragStyle: {transform: 'translateX(0)'}
        })
    }

    makeAlias = layerId =>
    {
    }

    removeLayer = layerId =>
    {
        ProjectModifyActions.removeLayer(layerId)
    }

    resizeStart = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        console.log('resize start')

        this.setState({
            resizeStartPosition: {clientX: e.clientX},
        })

        e.stopPropagation()
    }

    resizeMove = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        const {resizeStartPosition} = this.state
        console.log('resizing', resizeStartPosition)
        if (!resizeStartPosition) return

        this.setState({
            resizeMovedX: e.clientX - resizeStartPosition.clientX,
        })

        e.stopPropagation()
    }

    resizeEnd = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        const newWidth = this.props.width + this.state.resizeMovedX

        this.setState({
            resizeStartPosition: null,
            resizeMovedX: 0,
        })

        this.props.onChangeDuration(newWidth)
        e.stopPropagation()
    }

    render()
    {
        const {layer} = this.props

        return (
            <div className={s.clip}
                style={{
                    left: this.props.left,
                    width: this.props.width + this.state.resizeMovedX,
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
                <div
                    className={s.resizeHandle}
                    draggable
                    onDragStart={this.resizeStart}
                    onDrag={this.resizeMove}
                    onDragEnd={this.resizeEnd}
                />
            </div>
        )
    }
}