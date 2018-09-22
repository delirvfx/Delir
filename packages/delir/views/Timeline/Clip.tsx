import * as Delir from '@ragg/delir-core'
import { ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'
import { DraggableEventHandler } from 'react-draggable'
import { Rnd, RndResizeCallback } from 'react-rnd'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'
import t from './Clip.i18n'
import * as s from './Clip.styl'

interface OwnProps {
    clip: Delir.Entity.Clip
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

type Props = OwnProps & ConnectedProps & ContextProp

export default withComponentContext(class Clip extends React.Component<Props> {
    private clipRoot = React.createRef<HTMLDivElement>()

    public render()
    {
        const {clip, active, postEffectPlugins, width, left} = this.props

        return (
            <Rnd
                className={classnames(s.Clip, {
                    [s['Clip--active']]: active,
                    [s['Clip--video']]: clip.renderer === 'video',
                    [s['Clip--audio']]: clip.renderer === 'audio',
                    [s['Clip--text']]: clip.renderer === 'text',
                    [s['Clip--image']]: clip.renderer === 'image',
                    [s['Clip--adjustment']]: clip.renderer === 'adjustment',
                    [s['Clip--p5js']]: clip.renderer === 'p5js',
                })}
                dragAxis='x'
                position={{ x: left, y: 2 }}
                size={{ width: width, height: 'auto' }}
                enableResizing={{ left: true, right: true, top: false, bottom: false }}
                onDragStart={this.handleDragStart}
                onDragStop={this.handleDragEnd}
                onResizeStop={this.handleResizeEnd}
                onMouseDown={this.handleClick}
                tabIndex={-1}
            >
                <div ref={this.clipRoot}>
                    <ContextMenu>
                        <MenuItem label={t('contextMenu.seekToHeadOfClip')} onClick={this.handleSeekToHeadOfClip} />
                        <MenuItem label={t('contextMenu.effect')}>
                            {postEffectPlugins.length ? postEffectPlugins.map(entry => (
                                <MenuItem key={entry.id} label={entry.name} data-clip-id={clip.id} data-effect-id={entry.id} onClick={this.handleAddEffect} />
                            )) : (
                                <MenuItem label={t('contextMenu.pluginUnavailable')} enabled={false} />
                            )}
                        </MenuItem>
                        {/* <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, clip.id)} /> */}
                        <MenuItem type='separator' />
                        <MenuItem label={t('contextMenu.remove')} data-clip-id={clip.id} onClick={this.handleRemoveClip} />
                        <MenuItem type='separator' />
                    </ContextMenu>
                    <span className={s.Clip__NameLabel}>{t(['renderers', clip.renderer])}</span>
                    <span className={s.Clip__IdLabel}>#{clip.id.substring(0, 4)}</span>
                </div>
            </Rnd>
        )
    }

    private handleClick = () =>
    {
        GlobalEvents.on(GlobalEvent.copyViaApplicationMenu, this.handleGlobalCopy)
        GlobalEvents.on(GlobalEvent.cutViaApplicationMenu, this.handleGlobalCut)
        this.props.context.executeOperation(EditorOps.changeActiveClip, { clipId: this.props.clip.id! })
    }

    private handleDragStart: DraggableEventHandler = (e) =>
    {
        this.props.context.executeOperation(EditorOps.setDragEntity, {
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

    private handleAddEffect = ({dataset}: MenuItemOption<{clipId: string, effectId: string}>) =>
    {
        this.props.context.executeOperation(ProjectOps.addEffectIntoClip, {
            clipId: dataset.clipId,
            processorId: dataset.effectId
        })
        this.props.context.executeOperation(EditorOps.seekPreviewFrame, {})
    }

    private handleRemoveClip = ({ dataset }: MenuItemOption<{clipId: string}>) =>
    {
        this.props.context.executeOperation(ProjectOps.removeClip, { clipId: dataset.clipId })
    }

    private handleSeekToHeadOfClip = () => {
        const { clip } = this.props
        this.props.context.executeOperation(EditorOps.seekPreviewFrame, { frame: clip.placedFrame })
    }

    private handleGlobalCopy = () => {
        this.props.context.executeOperation(EditorOps.copyEntity, {
            type: 'clip',
            entity: this.props.clip,
        })
    }

    private handleGlobalCut = () => {
        this.props.context.executeOperation(EditorOps.copyEntity, { type: 'clip', entity: this.props.clip })
        this.props.context.executeOperation(ProjectOps.removeClip, { clipId: this.props.clip.id })
    }
})
