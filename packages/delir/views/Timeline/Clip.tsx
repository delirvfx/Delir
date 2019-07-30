import * as Delir from '@delirvfx/core'
import { ContextProp, withFleurContext } from '@fleur/fleur-react'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { DraggableEventHandler } from 'react-draggable'
import { Rnd, RndResizeCallback } from 'react-rnd'
import { animated } from 'react-spring'
import { decorate } from '../../utils/decorate'
import { SpreadType } from '../../utils/Spread'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import { MountTransition } from '../../components/MountTransition'
import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'
import t from './Clip.i18n'
import * as s from './Clip.styl'
import { ClipDragProps, withClipDragContext } from './ClipDragContext'

interface OwnProps {
    clip: SpreadType<Delir.Entity.Clip>
    left: number
    width: number
    active: boolean
    postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
    hasError: boolean
}

interface ConnectedProps {
    postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
}

type Props = OwnProps & ConnectedProps & ContextProp & ClipDragProps

export default decorate<OwnProps>(
    [withFleurContext, withClipDragContext],
    class Clip extends React.Component<Props> {
        public shouldComponentUpdate(nextProps: Props) {
            const { props } = this
            return !_.isEqual(props, nextProps)
        }

        public render() {
            const { clip, active, postEffectPlugins, width, left, hasError } = this.props

            return (
                <MountTransition
                    from={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
                    enter={{ transform: 'scaleX(1)' }}
                >
                    {style => (
                        <Rnd
                            className={s.clip}
                            dragAxis="x"
                            position={{ x: left, y: 2 }}
                            size={{ width, height: 'auto' }}
                            enableResizing={{
                                left: true,
                                right: true,
                                top: false,
                                bottom: false,
                            }}
                            onDragStart={this.handleDragStart}
                            onDragStop={this.handleDragEnd}
                            onResize={this.handleResize}
                            onResizeStop={this.handleResizeEnd}
                            onMouseDown={this.handleClick}
                            tabIndex={-1}
                            data-clip-id={clip.id}
                        >
                            <animated.div
                                className={classnames(s.inner, {
                                    [s.active]: active,
                                    [s.video]: clip.renderer === 'video',
                                    [s.audio]: clip.renderer === 'audio',
                                    [s.text]: clip.renderer === 'text',
                                    [s.image]: clip.renderer === 'image',
                                    [s.adjustment]: clip.renderer === 'adjustment',
                                    [s.p5js]: clip.renderer === 'p5js',
                                    [s.hasError]: hasError,
                                })}
                                style={style}
                                onMouseUp={this.handleMouseUp}
                            >
                                <ContextMenu>
                                    <MenuItem
                                        label={t(t.k.contextMenu.seekToHeadOfClip)}
                                        onClick={this.handleSeekToHeadOfClip}
                                    />
                                    <MenuItem label={t(t.k.contextMenu.effect)}>
                                        {postEffectPlugins.length ? (
                                            postEffectPlugins.map(entry => (
                                                <MenuItem
                                                    key={entry.id}
                                                    label={entry.name}
                                                    data-clip-id={clip.id}
                                                    data-effect-id={entry.id}
                                                    onClick={this.handleAddEffect}
                                                />
                                            ))
                                        ) : (
                                            <MenuItem label={t(t.k.contextMenu.pluginUnavailable)} enabled={false} />
                                        )}
                                    </MenuItem>
                                    {/* <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, clip.id)} /> */}
                                    <MenuItem type="separator" />
                                    <MenuItem
                                        label={t(t.k.contextMenu.remove)}
                                        data-clip-id={clip.id}
                                        onClick={this.handleRemoveClip}
                                    />
                                    <MenuItem type="separator" />
                                </ContextMenu>
                                <span className={s.nameLabel}>{t(['renderers', clip.renderer])}</span>
                                <span className={s.idLabel}>#{clip.id.substring(0, 4)}</span>
                            </animated.div>
                        </Rnd>
                    )}
                </MountTransition>
            )
        }

        private handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
            if (this.props.active) return
            e.preventDefault()
            e.stopPropagation()

            GlobalEvents.on(GlobalEvent.copyViaApplicationMenu, this.handleGlobalCopy)
            GlobalEvents.on(GlobalEvent.cutViaApplicationMenu, this.handleGlobalCut)

            if (e.shiftKey) {
                this.props.executeOperation(EditorOps.addOrRemoveSelectClip, {
                    clipIds: [this.props.clip.id],
                })
            } else {
                this.props.executeOperation(EditorOps.changeSelectClip, {
                    clipIds: [this.props.clip.id!],
                })
            }
        }

        private handleDragStart: DraggableEventHandler = e => {
            this.props.executeOperation(EditorOps.setDragEntity, {
                entity: { type: 'clip', clip: this.props.clip },
            })
        }

        private handleDrag: DraggableEventHandler = (e, drag) => {
            const { clip } = this.props

            this.props.emitClipDrag({
                nextX: drag.x,
                originalPlacedFrame: clip.placedFrame,
            })
        }

        private handleDragEnd: DraggableEventHandler = (e, drag) => {
            const { clip } = this.props
            this.props.emitClipDragEnd({
                nextX: drag.x,
                originalPlacedFrame: clip.placedFrame,
            })
        }

        private handleResize: RndResizeCallback = (e, dir, ref, delta, pos) => {
            const { clip, width } = this.props

            this.props.emitClipResize({
                nextX: pos.x,
                originalPlacedFrame: clip.placedFrame,
                deltaWidth: delta.width,
            })
        }

        private handleResizeEnd: RndResizeCallback = (e, direction, ref, delta, pos) => {
            const { clip, width } = this.props

            this.props.emitClipResizeEnd({
                nextX: pos.x,
                originalPlacedFrame: clip.placedFrame,
                deltaWidth: delta.width,
            })
        }

        private handleAddEffect = ({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
            this.props.executeOperation(ProjectOps.addEffectIntoClip, {
                clipId: dataset.clipId,
                processorId: dataset.effectId,
            })
            this.props.executeOperation(EditorOps.seekPreviewFrame, {})
        }

        private handleRemoveClip = ({ dataset }: MenuItemOption<{ clipId: string }>) => {
            this.props.executeOperation(ProjectOps.removeClip, {
                clipId: dataset.clipId,
            })
        }

        private handleSeekToHeadOfClip = () => {
            const { clip } = this.props
            this.props.executeOperation(EditorOps.seekPreviewFrame, {
                frame: clip.placedFrame,
            })
        }

        private handleGlobalCopy = () => {
            this.props.executeOperation(EditorOps.copyEntity, {
                type: 'clip',
                entity: this.props.clip,
            })
        }

        private handleGlobalCut = () => {
            this.props.executeOperation(EditorOps.copyEntity, {
                type: 'clip',
                entity: this.props.clip,
            })
            this.props.executeOperation(ProjectOps.removeClip, {
                clipId: this.props.clip.id,
            })
        }
    },
)
