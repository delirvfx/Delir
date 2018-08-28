import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'
import { Rnd, RndResizeCallback, RndResizeStartCallback } from 'react-rnd'

import * as AppActions from '../../actions/App'
import * as ProjectModActions from '../../actions/ProjectMod'
import { ContextMenu, MenuItem, MenuItemOption, MenuItemProps } from '../components/ContextMenu'

import { DraggableEventHandler } from 'react-draggable'
import RendererStore from '../../stores/RendererStore'
import t from './_Clip.i18n'
import * as s from './Clip.styl'

interface OwnProps {
    clip: Delir.Project.Clip
    left: number
    width: number
    active: boolean
    postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
    onChangePlace: (clipId: string, newPlacedPx: number) => any
    onChangeDuration: (clipId: string, newDurationPx: number) => any
}

interface ConnectedProps {
    postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
}

type Props = OwnProps  & ConnectedProps & ContextProp

interface State {
}

export default withComponentContext(class TimelaneClip extends React.Component<Props, State> {
    public state: State = {
    }

    public refs: {
        clipRoot: HTMLDivElement
    }

    public render()
    {
        const {clip, active, postEffectPlugins} = this.props

        return (
            <Rnd
                className={classnames(s.Clip, {
                    [s['Clip--active']]: active,
                    [s['Clip--video']]: clip.renderer === 'video',
                    [s['Clip--audio']]: clip.renderer === 'audio',
                    [s['Clip--text']]: clip.renderer === 'text',
                    [s['Clip--image']]: clip.renderer === 'image',
                    [s['Clip--adjustment']]: clip.renderer === 'adjustment',
                })}
                dragAxis='x'
                default={{ x: this.props.left, y: 2, width: this.props.width, height: 'auto' }}
                enableResizing={{ left: true, right: true, top: false, bottom: false }}
                onDragStart={this.handleDragStart}
                onDragStop={this.handleDragEnd}
                onResizeStop={this.handleResizeEnd}
            >
                <div
                    onClick={this.handleClick}
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
                </div>
            </Rnd>
        )
    }

    private handleClick = (e: React.DragEvent<HTMLDivElement>) =>
    {
        this.props.context.executeOperation(AppActions.changeActiveClip, { clipId: this.props.clip.id! })
    }

    private handleDragStart: DraggableEventHandler = (e) =>
    {
        this.props.context.executeOperation(AppActions.setDragEntity, {
            entity: {type: 'clip', clip: this.props.clip}
        })
    }

    private handleDragEnd: DraggableEventHandler = (e, drag) => {
        this.props.onChangePlace(this.props.clip.id, drag.x)
    }

    private handleResizeEnd: RndResizeCallback = (e, direction, ref, delta, pos) => {
        const { clip } = this.props

        if (pos.x !== this.props.left) {
            this.props.onChangePlace(clip.id, pos.x)
        }

        this.props.onChangeDuration(clip.id, this.props.width + delta.width)
    }

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
})
