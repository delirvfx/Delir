import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'
import * as classnames from 'classnames'

import {ContextMenu, MenuItem} from '../components/ContextMenu'
import AppActions from '../../actions/App'
import ProjectModActions from '../../actions/ProjectMod'

import t from './_Clip.i18n'
import * as s from './Clip.styl'

interface TimelaneClipProps {
    clip: Delir.Project.Clip,
    left: number,
    width: number,
    active: boolean
    onChangePlace: (draggedPx: number) => any,
    onChangeDuration: (displayWidth: number) => any,
}

interface TimelaneClipState {
    draggedPxX: number
    dragStartPosition: {clientX: number, clientY: number}|null
    dragStyle: {[prop: string]: string}|null

    resizeStartPosition: {clientX: number}|null
    resizeMovedX: number
}

export default class TimelaneClip extends React.Component<TimelaneClipProps, TimelaneClipState>
{
    public static propTypes = {
        clip: PropTypes.instanceOf(Delir.Project.Clip).isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        active: PropTypes.bool.isRequired,
        onChangePlace: PropTypes.func.isRequired,
        onChangeDuration: PropTypes.func.isRequired,
    }

    public state = {
        draggedPxX: 0,
        dragStartPosition: null,
        dragStyle: {transform: 'translateX(0)'},

        resizeStartPosition: null,
        resizeMovedX: 0,
    }

    public refs: {
        clipRoot: HTMLDivElement
    }

    private selectClip = e =>
    {
        AppActions.changeActiveClip(this.props.clip.id!)
    }

    private dragStart = e =>
    {
        this.setState({
            dragStartPosition: {
                clientX: e.clientX,
                clientY: e.clientY
            }
        })

        AppActions.setDragEntity({type: 'clip', clip: this.props.clip})
    }

    private drag = (e) =>
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

    private dragEnd = (e: React.DragEvent<HTMLDivElement>) =>
    {
        AppActions.clearDragEntity()

        this.setState({
            draggedPxX: 0,
            dragStyle: {transform: 'translateX(0)'}
        })
    }

    private makeAlias = clipId => { return }

    private removeClip = clipId =>
    {
        ProjectModActions.removeClip(clipId)
    }

    private resizeStart = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        console.log('resize start')

        this.setState({
            resizeStartPosition: {clientX: e.clientX},
        })

        e.stopPropagation()
    }

    private resizeMove = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        const {resizeStartPosition} = this.state
        if (!resizeStartPosition) return

        this.setState({
            resizeMovedX: e.clientX - resizeStartPosition.clientX,
        })

        e.stopPropagation()
    }

    private resizeEnd = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        const newWidth = this.props.width + this.state.resizeMovedX

        this.setState({
            resizeStartPosition: null,
            resizeMovedX: 0,
        })

        this.props.onChangeDuration(newWidth)
        e.stopPropagation()
    }

    public render()
    {
        const {clip, active} = this.props

        return (
            <div className={classnames(s.clip, {[s['clip--active']]: active})}
                style={{
                    left: this.props.left,
                    width: this.props.width + this.state.resizeMovedX,
                    ...this.state.dragStyle,
                }}
                draggable={true}
                onClick={this.selectClip}
                onDragStart={this.dragStart}
                onDrag={this.drag}
                onDragEnd={this.dragEnd}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    {/* <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, clip.id)} /> */}
                    <MenuItem label={t('contextMenu.remove')} onClick={this.removeClip.bind(null, clip.id)} />
                    <MenuItem type='separator' />
                </ContextMenu>
                <span className={s.clipNameLabel}>{t(['renderers', clip.renderer])}</span>
                <span className={s.clipIdLabel}>#{clip.id.substring(0, 4)}</span>
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
