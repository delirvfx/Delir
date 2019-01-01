import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import { hasErrorInClip } from '../../domain/Renderer/models'
import RendererStore from '../../domain/Renderer/RendererStore'
import TimePixelConversion from '../../utils/TimePixelConversion'

import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'
import Clip from './Clip'

import t from './Layer.i18n'
import * as s from './Layer.styl'

interface OwnProps {
    layer: Delir.Entity.Layer
    activeClip: Delir.Entity.Clip | null
    framerate: number
    pxPerSec: number
    scale: number
}

interface ConnectedProps {
    editor: EditorState
    postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
    userCodeException: Delir.Exceptions.UserCodeException | null
}

type Props = OwnProps & ConnectedProps & ContextProp

interface State {
    dragovered: boolean
}

/**
 * ClipSpace
 */
export default withComponentContext(
    connectToStores([EditorStore, RendererStore], context => ({
        editor: context.getStore(EditorStore).getState(),
        postEffectPlugins: context.getStore(RendererStore).getPostEffectPlugins(),
        userCodeException: context.getStore(RendererStore).getUserCodeException(),
    }))(
        class Layer extends React.Component<Props, State> {
            public state: State = {
                dragovered: false,
            }

            private root = React.createRef<HTMLLIElement>()

            public render() {
                const {
                    layer,
                    activeClip,
                    framerate,
                    pxPerSec,
                    scale,
                    postEffectPlugins,
                    userCodeException,
                } = this.props
                const clips = Array.from(layer.clips)
                const convertOption = { pxPerSec, framerate, scale }

                return (
                    <li
                        ref={this.root}
                        className={classnames(s.Layer, {
                            [s.dragover]: this.state.dragovered,
                        })}
                        onDrop={this.handleOnDrop}
                        onMouseUp={this.handleMouseUp}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        tabIndex={-1}
                    >
                        <ContextMenu>
                            <MenuItem type="separator" />
                            <MenuItem label={t('contextMenu.createClip')}>
                                {_.map(Delir.Engine.Renderers.RENDERERS, (renderer, idx) => (
                                    <MenuItem
                                        key={idx}
                                        label={t(['renderers', renderer.rendererId])}
                                        data-renderer-id={renderer.rendererId}
                                        onClick={this.addNewClip}
                                    />
                                ))}
                            </MenuItem>
                            <MenuItem type="separator" />
                        </ContextMenu>

                        <div className={s.clipsContainer}>
                            {clips.map(clip => {
                                const width = TimePixelConversion.framesToPixel({
                                    durationFrames: clip.durationFrames | 0,
                                    ...convertOption,
                                })

                                const left = TimePixelConversion.framesToPixel({
                                    durationFrames: clip.placedFrame | 0,
                                    ...convertOption,
                                })

                                const hasError = hasErrorInClip(clip, userCodeException)

                                return (
                                    <Clip
                                        key={clip.id!}
                                        clip={clip}
                                        width={width}
                                        left={left}
                                        active={clip === activeClip}
                                        postEffectPlugins={postEffectPlugins}
                                        hasError={hasError}
                                        onChangePlace={this.handleChangeClipPlace}
                                        onChangeDuration={this.changeClipDuration}
                                    />
                                )
                            })}
                        </div>
                    </li>
                )
            }

            private handleFocus = () => {
                GlobalEvents.on(GlobalEvent.pasteViaApplicationMenu, this.handleGlobalPaste)
            }

            private handleBlur = () => {
                GlobalEvents.off(GlobalEvent.pasteViaApplicationMenu, this.handleGlobalPaste)
            }

            private handleOnDrop = (e: React.DragEvent<HTMLLIElement>) => {
                const { dragEntity, activeComp } = this.props.editor

                if (!activeComp || !dragEntity) return

                if (dragEntity.type === 'asset') {
                    // Drop asset into ClipSpace
                    const { asset } = dragEntity
                    const { framerate, pxPerSec, scale } = this.props
                    const placedFrame = TimePixelConversion.pixelToFrames({
                        pxPerSec,
                        framerate,
                        pixel: (e.nativeEvent as any).layerX as number,
                        scale,
                    })
                    this.props.context.executeOperation(ProjectOps.addClipWithAsset, {
                        targetLayerId: this.props.layer.id,
                        asset,
                        placedFrame,
                    })
                } else {
                    return
                }

                this.props.context.executeOperation(EditorOps.clearDragEntity, {})
                this.setState({ dragovered: false })

                e.preventDefault()
                e.stopPropagation()
            }

            private handleMouseUp = (e: React.MouseEvent<HTMLLIElement>) => {
                const {
                    editor: { dragEntity },
                    layer,
                } = this.props

                if (!dragEntity || dragEntity.type !== 'clip') return

                const isChildClip = !!layer.clips.find(clip => clip.id! === dragEntity.clip.id!)

                if (isChildClip) {
                    this.props.context.executeOperation(EditorOps.clearDragEntity, {})
                } else {
                    this.props.context.executeOperation(ProjectOps.moveClipToLayer, {
                        clipId: dragEntity.clip.id!,
                        destLayerId: this.props.layer.id!,
                    })
                    this.props.context.executeOperation(EditorOps.clearDragEntity, {})
                }
            }

            private handleChangeClipPlace = (clipId: string, newPlacedPx: number) => {
                const newPlacedFrame = TimePixelConversion.pixelToFrames({
                    pxPerSec: this.props.pxPerSec,
                    framerate: this.props.framerate,
                    pixel: newPlacedPx,
                    scale: this.props.scale,
                })

                this.props.context.executeOperation(ProjectOps.modifyClip, {
                    clipId,
                    patch: { placedFrame: newPlacedFrame },
                })
            }

            private changeClipDuration = (clipId: string, newWidth: number) => {
                const newDurationFrames = TimePixelConversion.pixelToFrames({
                    pxPerSec: this.props.pxPerSec,
                    framerate: this.props.framerate,
                    pixel: newWidth,
                    scale: this.props.scale,
                })

                this.props.context.executeOperation(ProjectOps.modifyClip, {
                    clipId: clipId,
                    patch: { durationFrames: newDurationFrames },
                })
            }

            private addNewClip = ({ dataset }: MenuItemOption<{ rendererId: string }>) => {
                this.props.context.executeOperation(ProjectOps.addClip, {
                    layerId: this.props.layer.id!,
                    clipRendererId: dataset.rendererId,
                    placedFrame: 0,
                    durationFrames: 100,
                })
            }

            private handleGlobalPaste = () => {
                this.props.context.executeOperation(ProjectOps.pasteClipEntityIntoLayer, {
                    layerId: this.props.layer.id,
                })
            }
        },
    ),
)
