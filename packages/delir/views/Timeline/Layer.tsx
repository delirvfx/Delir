import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, StoreGetter, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { SpreadType } from '../../utils/Spread'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import EditorStore from '../../domain/Editor/EditorStore'
import { getSelectedClipIds, getSelectedClips } from '../../domain/Editor/selectors'
import { hasErrorInClip } from '../../domain/Renderer/models'
import RendererStore from '../../domain/Renderer/RendererStore'
import TimePixelConversion from '../../utils/TimePixelConversion'

import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'
import Clip from './Clip'

import t from './Layer.i18n'
import * as s from './Layer.styl'

interface OwnProps {
    layer: SpreadType<Delir.Entity.Layer>
    layerIndex: number
    framerate: number
    pxPerSec: number
    scale: number
    clipOffset: { x: number; width: number }
    scrollLeft: number
    scrollWidth: number
}

type Props = OwnProps & ReturnType<typeof mapStoresToProps> & ContextProp

interface State {
    dragovered: boolean
}

const mapStoresToProps = (getStore: StoreGetter) => ({
    selectedClipIds: getSelectedClipIds()(getStore),
    selectedClips: getSelectedClips()(getStore),
    postEffectPlugins: getStore(RendererStore).getPostEffectPlugins(),
    userCodeException: getStore(RendererStore).getUserCodeException(),
})

export default withComponentContext(
    connectToStores([EditorStore, RendererStore], mapStoresToProps)(
        class Layer extends React.Component<Props, State> {
            public state: State = {
                dragovered: false,
            }

            private root = React.createRef<HTMLDivElement>()

            public render() {
                const {
                    layer,
                    selectedClipIds,
                    framerate,
                    pxPerSec,
                    scale,
                    scrollLeft,
                    clipOffset,
                    scrollWidth,
                    postEffectPlugins,
                    userCodeException,
                } = this.props
                const clips = Array.from(layer.clips)
                const convertOption = { pxPerSec, framerate, scale }

                return (
                    <div
                        ref={this.root}
                        className={classnames(s.Layer, {
                            [s.dragover]: this.state.dragovered,
                        })}
                        onDrop={this.handleOnDrop}
                        onMouseUp={this.handleMouseUp}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        style={{ width: scrollWidth }}
                        tabIndex={-1}
                    >
                        <ContextMenu>
                            <MenuItem type="separator" />
                            <MenuItem label={t(t.k.contextMenu.createClip)}>
                                {_.map(Delir.Engine.Renderers.RENDERERS, (renderer, idx) => (
                                    <MenuItem
                                        key={idx}
                                        label={t(['renderers', renderer.rendererId])}
                                        data-renderer-id={renderer.rendererId}
                                        onClick={this.handleAddNewClip}
                                    />
                                ))}
                            </MenuItem>
                            <MenuItem type="separator" />
                            <MenuItem label={t(t.k.contextMenu.addLayerHere)} onClick={this.handleAddLayer} />
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
                                const active = selectedClipIds.includes(clip.id)

                                return (
                                    <Clip
                                        key={clip.id!}
                                        clip={{ ...clip }}
                                        width={active ? width + clipOffset.width : width}
                                        left={active ? left + clipOffset.x : left}
                                        active={active}
                                        postEffectPlugins={postEffectPlugins}
                                        hasError={hasError}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            }

            private handleFocus = () => {
                GlobalEvents.on(GlobalEvent.pasteViaApplicationMenu, this.handleGlobalPaste)
            }

            private handleBlur = () => {
                GlobalEvents.off(GlobalEvent.pasteViaApplicationMenu, this.handleGlobalPaste)
            }

            private handleOnDrop = (e: React.DragEvent<HTMLDivElement>) => {
                const { dragEntity, activeComp } = this.props.context.getStore(EditorStore)

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

            private handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
                const { layer } = this.props
                const { dragEntity } = this.props.context.getStore(EditorStore)

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

            private handleAddNewClip = ({ dataset }: MenuItemOption<{ rendererId: string }>) => {
                this.props.context.executeOperation(ProjectOps.addClip, {
                    layerId: this.props.layer.id!,
                    clipRendererId: dataset.rendererId,
                    durationFrames: 100,
                })
            }

            private handleAddLayer = () => {
                const { layerIndex } = this.props
                const { activeComp } = this.props.context.getStore(EditorStore)
                if (!activeComp) return

                this.props.context.executeOperation(ProjectOps.addLayer, {
                    targetCompositionId: activeComp.id,
                    index: layerIndex,
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
