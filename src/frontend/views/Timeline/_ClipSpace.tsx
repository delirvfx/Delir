import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import * as _ from 'lodash'
import * as React from 'react'

import * as AppActions from '../../actions/App'
import * as ProjectModActions from '../../actions/ProjectMod'

import RendererService from '../../services/renderer'
import EditorStateStore, { EditorState } from '../../stores/EditorStateStore'
import TimePixelConversion from '../../utils/TimePixelConversion'
import { ContextMenu, MenuItem, MenuItemOption } from '../components/ContextMenu'

import Clip from './_Clip'
import t from './_ClipSpace.i18n'

interface OwnProps {
    layer: Delir.Project.Layer
    activeClip: Delir.Project.Clip | null
    framerate: number
    pxPerSec: number
    scale: number
}

interface ConnectedProps {
    editor: EditorState,
}

type Props = OwnProps & ConnectedProps & ContextProp

interface State {
    dragovered: boolean
}

/**
 * ClipSpace
 */
export default withComponentContext(connectToStores([EditorStateStore], context => ({
    editor: context.getStore(EditorStateStore).getState(),
}))(class ClipSpace extends React.Component<Props, State> {
    public state: State = {
        dragovered: false,
    }

    public render()
    {
        const {layer, activeClip, framerate, pxPerSec, scale} = this.props
        const keyframes = activeClip ? activeClip.keyframes : {}
        const clips = Array.from<Delir.Project.Clip>(layer.clips)

        return (
            <li
                className={classnames('timeline-lane', {
                    dragover: this.state.dragovered,
                    '--expand': clips.findIndex(clip => !!(activeClip && clip.id === activeClip.id)) !== -1,
                })}
                data-lane-id={layer.id}
                onDragOver={this._onDragOver}
                onDragLeave={this._onDragLeave}
                onDrop={this._onDrop}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label={t('contextMenu.createClip')}>
                        {_.map(Delir.Engine.Renderers.RENDERERS, (renderer, idx) =>
                            <MenuItem keys={idx} label={t(['renderers', renderer.rendererId])} data-renderer-id={renderer.rendererId} onClick={this.addNewClip} />
                        )}
                    </MenuItem>
                    <MenuItem type='separator' />
                </ContextMenu>

                <div className='timeline-lane-clips'>
                    {clips.map(clip => {
                        const opt = {
                            pxPerSec: pxPerSec,
                            framerate: framerate,
                            scale: scale,
                        }
                        const width = TimePixelConversion.framesToPixel({
                            durationFrames: clip.durationFrames | 0,
                            ...opt,
                        })
                        const left = TimePixelConversion.framesToPixel({
                            durationFrames: clip.placedFrame | 0,
                            ...opt,
                        })

                        return (
                            <Clip
                                key={clip.id!}
                                clip={clip}
                                width={width}
                                left={left}
                                active={clip === activeClip}
                                onChangePlace={this._changeClipPlace.bind(this, clip)}
                                onChangeDuration={this.changeClipDuration.bind(null, clip)}
                            />
                        )
                    })}
                </div>
            </li>
        )
    }

    private _onDrop = (e: React.DragEvent<HTMLLIElement>) =>
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
        } else if (dragEntity.type === 'clip') {
            // Drop Clip into ClipSpace
            const {clip} = dragEntity
            const isChildClip = !! _.find(this.props.layer.clips, {id: clip.id})

            if (isChildClip) {
                const placedFrame = TimePixelConversion.pixelToFrames({
                    pxPerSec: this.props.pxPerSec,
                    framerate: this.props.framerate,
                    pixel: e.pageX - e.currentTarget.getBoundingClientRect().left - (e.nativeEvent as DragEvent).offsetX,
                    scale: this.props.scale,
                })

                this.props.context.executeOperation(ProjectModActions.modifyClip, {
                    clipId: dragEntity.clip.id!,
                    props: { placedFrame }
                })
            } else {
                this.props.context.executeOperation(ProjectModActions.moveClipToLayer, {
                    clipId: clip.id!,
                    targetLayerId: this.props.layer.id!
                })
            }
        } else {
            return
        }

        this.props.context.executeOperation(AppActions.clearDragEntity, {})
        this.setState({dragovered: false})

        e.preventDefault()
        e.stopPropagation()
    }

    private _onDragLeave = (e: React.DragEvent<HTMLLIElement>) =>
    {
        this.setState({dragovered: false})
    }

    private _onDragOver = (e: React.DragEvent<HTMLLIElement>) =>
    {
        const {editor: {dragEntity}} = this.props
        if (!dragEntity || dragEntity.type !== 'clip') return

        this.setState({dragovered: true})
    }

    private _changeClipPlace = (clip, movedX) =>
    {
        console.log(movedX)
    }

    private changeClipDuration = (clip: Delir.Project.Clip, newWidth: number) =>
    {

        const newDurationFrames = TimePixelConversion.pixelToFrames({
            pxPerSec: this.props.pxPerSec,
            framerate: this.props.framerate,
            pixel: newWidth,
            scale: this.props.scale,
        })

        this.props.context.executeOperation(ProjectModActions.modifyClip, {
            clipId: clip.id,
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
