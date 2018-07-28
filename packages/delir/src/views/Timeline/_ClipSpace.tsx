import * as classnames from 'classnames'
import * as Delir from '@ragg/delir-core'
import * as _ from 'lodash'
import * as React from 'react'

import AppActions from '../../actions/App'
import ProjectModActions from '../../actions/ProjectMod'
import RendererService from '../../services/renderer'
import {default as EditorStateStore, EditorState } from '../../stores/EditorStateStore'
import connectToStores from '../../utils/Flux/connectToStores'
import TimePixelConversion from '../../utils/TimePixelConversion'
import { ContextMenu, MenuItem, MenuItemOption } from '../components/ContextMenu'

import Clip from './_Clip'
import t from './_ClipSpace.i18n'

interface TimelaneClipSpaceProps {
    editor: EditorState,
    layer: Delir.Project.Layer,
    activeClip: Delir.Project.Clip | null,
    framerate: number,
    pxPerSec: number,
    scale: number,
}

interface TimelaneClipSpaceState {
    dragovered: boolean,
    pxPerSec: number,
}

/**
 * ClipSpace
 */
@connectToStores([EditorStateStore], context => ({
    editor: EditorStateStore.getState(),
}))
export default class ClipSpace extends React.Component<TimelaneClipSpaceProps, TimelaneClipSpaceState>
{
    public state = {
        dragovered: false,
    }

    public render()
    {
        const {layer, activeClip, framerate, pxPerSec, scale} = this.props
        const keyframes = activeClip ? activeClip.keyframes : {}
        const clips = Array.from<Delir.Project.Clip>(layer.clips)
        const tmpKey = keyframes ? Object.keys(keyframes)[1] : ''

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
            ProjectModActions.createClipWithAsset(this.props.layer, asset, placedFrame)
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
                ProjectModActions.modifyClip(dragEntity.clip.id!, {placedFrame: placedFrame})
            } else {
                ProjectModActions.moveClipToLayer(clip.id!, this.props.layer.id!)
            }
        } else {
            return
        }

        AppActions.clearDragEntity()
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

        ProjectModActions.modifyClip(clip.id, {
            durationFrames: newDurationFrames,
        })
    }

    private addNewClip = ({ dataset }: MenuItemOption<{rendererId: string}>) =>
    {
        ProjectModActions.createClip(this.props.layer.id!, dataset.rendererId, 0, 100)
    }
}
