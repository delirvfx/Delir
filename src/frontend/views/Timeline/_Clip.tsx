import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import * as React from 'react'

import * as AppActions from '../../actions/App'
import * as ProjectModActions from '../../actions/ProjectMod'
import { ContextMenu, MenuItem, MenuItemOption, MenuItemProps } from '../components/ContextMenu'

import RendererStore from '../../stores/RendererStore'
import t from './_Clip.i18n'
import * as s from './Clip.styl'

interface OwnProps {
    clip: Delir.Project.Clip,
    left: number,
    width: number,
    active: boolean
    onChangePlace: (draggedPx: number) => any,
    onChangeDuration: (displayWidth: number) => any,
}

interface ConnectedProps {
    postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
}

type Props = OwnProps  & ConnectedProps & ContextProp

interface State {
    draggedPxX: number
    dragStartPosition: {clientX: number, clientY: number} | null
    dragStyle: {[prop: string]: string} | null

    resizeStartPosition: {clientX: number} | null
    resizeMovedX: number
}

export default withComponentContext(connectToStores([RendererStore], (context) => ({
    postEffectPlugins: context.getStore(RendererStore).getPostEffectPlugins()
}))(class TimelaneClip extends React.Component<Props, State> {
    public state: State = {
        draggedPxX: 0,
        dragStartPosition: null,
        dragStyle: {transform: 'translateX(0)'},

        resizeStartPosition: null,
        resizeMovedX: 0,
    }

    public refs: {
        clipRoot: HTMLDivElement
    }

    public render()
    {
        const {clip, active, postEffectPlugins} = this.props

        return (
            <div className={classnames(s.Clip, {
                    [s['Clip--active']]: active,
                    [s['Clip--video']]: clip.renderer === 'video',
                    [s['Clip--audio']]: clip.renderer === 'audio',
                    [s['Clip--text']]: clip.renderer === 'text',
                    [s['Clip--image']]: clip.renderer === 'image',
                    [s['Clip--adjustment']]: clip.renderer === 'adjustment',
                })}
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
                    <MenuItem label='エフェクト'>
                        {postEffectPlugins.length ? postEffectPlugins.map(entry => (
                            <MenuItem label={entry.name} data-clip-id={clip.id} data-effect-id={entry.id} onClick={this.addEffect} />)
                        ) : (
                            <MenuItem label={t('contextMenu.pluginUnavailable')} enabled={false} />
                        )}
                    </MenuItem>
                    {/* <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, clip.id)} /> */}
                    <MenuItem label={t('contextMenu.remove')} data-clip-id={clip.id} onClick={this.removeClip} />
                    <MenuItem type='separator' />
                </ContextMenu>
                <span className={s.Clip__NameLabel}>{t(['renderers', clip.renderer])}</span>
                <span className={s.Clip__IdLabel}>#{clip.id.substring(0, 4)}</span>
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

    private selectClip = e =>
    {
        this.props.context.executeOperation(AppActions.changeActiveClip, { clipId: this.props.clip.id! })
    }

    private dragStart = e =>
    {
        this.setState({
            dragStartPosition: {
                clientX: e.clientX,
                clientY: e.clientY
            }
        })

        this.props.context.executeOperation(AppActions.setDragEntity, {
            entity: {type: 'clip', clip: this.props.clip}
        })
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
        this.props.context.executeOperation(AppActions.clearDragEntity, {})

        this.setState({
            draggedPxX: 0,
            dragStyle: {transform: 'translateX(0)'}
        })
    }

    private makeAlias = clipId => { return }

    private addEffect = ({dataset}: MenuItemProps<{clipId: string, effectId: string}>) =>
    {
        this.props.context.executeOperation(ProjectModActions.addEffectIntoClip, {
            clipId: dataset.clipId,
            processorId: dataset.effectId
        })
        this.props.context.executeOperation(AppActions.seekPreviewFrame, {})
    }

    private removeClip = ({ dataset }: MenuItemOption<{clipId: string}>) =>
    {
        this.props.context.executeOperation(ProjectModActions.removeClip, { clipId: dataset.clipId })
    }

    private resizeStart = (e: React.DragEvent<HTMLDivElement>) =>
    {
        this.props.context.executeOperation(AppActions.setDragEntity, {
            entity: {type: 'clip-resizing', clip: this.props.clip}
        })

        this.setState({
            resizeStartPosition: {clientX: e.clientX},
        })

        e.stopPropagation()
    }

    private resizeMove = (e: React.DragEvent<HTMLDivElement>) =>
    {
        const {resizeStartPosition} = this.state
        if (!resizeStartPosition) return

        this.setState({
            resizeMovedX: e.clientX - resizeStartPosition.clientX,
        })

        e.stopPropagation()
    }

    private resizeEnd = (e: React.DragEvent<HTMLDivElement>) =>
    {
        e.stopPropagation()
        this.props.context.executeOperation(AppActions.clearDragEntity, {})
        this.setState({resizeStartPosition: null, resizeMovedX: 0})

        const newWidth = this.props.width + this.state.resizeMovedX

        // if handle dropped to out of window, `newWidth` becomes negative value.
        if (newWidth < 0) return

        this.props.onChangeDuration(newWidth)
    }
}))
