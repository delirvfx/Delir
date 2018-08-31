import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'

import * as AppActions from '../../actions/App'
import * as ProjectModActions from '../../actions/ProjectMod'

import EditorStateStore, { EditorState } from '../../stores/EditorStateStore'
import RendererStore from '../../stores/RendererStore'
import TimePixelConversion from '../../utils/TimePixelConversion'
import { ContextMenu, MenuItem, MenuItemOption } from '../components/ContextMenu'

import Clip from './_Clip'
import t from './_ClipSpace.i18n'

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
}

type Props = OwnProps & ConnectedProps & ContextProp

interface State {
    dragovered: boolean
}

/**
 * ClipSpace
 */
export default withComponentContext(connectToStores([EditorStateStore, RendererStore], context => ({
    editor: context.getStore(EditorStateStore).getState(),
    postEffectPlugins: context.getStore(RendererStore).getPostEffectPlugins(),
}))(class ClipSpace extends React.Component<Props, State> {
    public state: State = {
        dragovered: false,
    }

    public render()
    {
        const {layer, activeClip, framerate, pxPerSec, scale, postEffectPlugins} = this.props
        const keyframes = activeClip ? activeClip.keyframes : {}
        const clips = Array.from<Delir.Entity.Clip>(layer.clips)
        const convertOption = { pxPerSec, framerate, scale }

        return (
            <li
                key={layer.id}
                className={classnames('timeline-lane', {
                    dragover: this.state.dragovered,
                    '--expand': clips.findIndex(clip => !!(activeClip && clip.id === activeClip.id)) !== -1,
                })}
                onDrop={this.handleOnDrop}
                onMouseUp={this.handleMouseUp}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label={t('contextMenu.createClip')}>
                        {_.map(Delir.Engine.Renderers.RENDERERS, (renderer, idx) =>
                            <MenuItem key={idx} label={t(['renderers', renderer.rendererId])} data-renderer-id={renderer.rendererId} onClick={this.addNewClip} />
                        )}
                    </MenuItem>
                    <MenuItem type='separator' />
                </ContextMenu>

                <div className='timeline-lane-clips'>
                    {clips.map(clip => {
                        const width = TimePixelConversion.framesToPixel({
                            durationFrames: clip.durationFrames | 0,
                            ...convertOption,
                        })
                        const left = TimePixelConversion.framesToPixel({
                            durationFrames: clip.placedFrame | 0,
                            ...convertOption,
                        })

                        return (
                            <Clip
                                key={clip.id!}
                                clip={clip}
                                width={width}
                                left={left}
                                active={clip === activeClip}
                                postEffectPlugins={postEffectPlugins}
                                onChangePlace={this.handleChangeClipPlace}
                                onChangeDuration={this.changeClipDuration}
                            />
                        )
                    })}
                </div>
            </li>
        )
    }

    private handleOnDrop = (e: React.DragEvent<HTMLLIElement>) =>
    {
        const {dragEntity, activeComp} = this.props.editor

        if (!activeComp || !dragEntity) return

        if (dragEntity.type === 'asset') {
            // Drop asset into ClipSpace
            const {asset} = dragEntity
            const {framerate, pxPerSec, scale} = this.props
            const placedFrame = TimePixelConversion.pixelToFrames({pxPerSec, framerate, pixel: ((e.nativeEvent as any).layerX as number), scale})
            this.props.context.executeOperation(ProjectModActions.createClipWithAsset, {
                targetLayer: this.props.layer,
                asset,
                placedFrame
            })
        } else {
            return
        }

        this.props.context.executeOperation(AppActions.clearDragEntity, {})
        this.setState({dragovered: false})

        e.preventDefault()
        e.stopPropagation()
    }

    private handleMouseUp = (e: React.MouseEvent<HTMLLIElement>) => {
        const { editor: { dragEntity }, layer } = this.props

        if (!dragEntity || dragEntity.type !== 'clip') return

        const isChildClip = !!layer.clips.find(clip => clip.id! === dragEntity.clip.id!)

        if (!isChildClip) {
            this.props.context.executeOperation(ProjectModActions.moveClipToLayer, {
                clipId: dragEntity.clip.id!,
                destLayerId: this.props.layer.id!
            })
            this.props.context.executeOperation(AppActions.clearDragEntity, {})
        }
    }

    private handleChangeClipPlace = (clipId: string, newPlacedPx: number) =>
    {
        const newPlacedFrame = TimePixelConversion.pixelToFrames({
            pxPerSec: this.props.pxPerSec,
            framerate: this.props.framerate,
            pixel: newPlacedPx,
            scale: this.props.scale,
        })

        this.props.context.executeOperation(ProjectModActions.modifyClip, {
            clipId,
            props: { placedFrame: newPlacedFrame }
        })
    }

    private changeClipDuration = (clipId: string, newWidth: number) =>
    {
        const newDurationFrames = TimePixelConversion.pixelToFrames({
            pxPerSec: this.props.pxPerSec,
            framerate: this.props.framerate,
            pixel: newWidth,
            scale: this.props.scale,
        })

        this.props.context.executeOperation(ProjectModActions.modifyClip, {
            clipId: clipId,
            props: { durationFrames: newDurationFrames }
        })
    }

    private addNewClip = ({ dataset }: MenuItemOption<{rendererId: string}>) =>
    {
        this.props.context.executeOperation(ProjectModActions.createClip, {
            layerId: this.props.layer.id!,
            clipRendererId: dataset.rendererId,
            placedFrame: 0,
            durationFrames: 100
        })
    }
}))
