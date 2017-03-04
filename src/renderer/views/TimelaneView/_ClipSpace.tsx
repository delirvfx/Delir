import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import classnames from 'classnames'
import * as Delir from 'delir-core'

import {ContextMenu, MenuItem} from '../electron/context-menu'
import RendererService from '../../services/renderer'
import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'
import TimelineHelper from '../../helpers/timeline-helper'
import connectToStores from '../../utils/connectToStores'
import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import cancelEvent from '../../utils/cancelEvent'

import Clip from './_Clip'
import LaneKeyframes from '../timeline/lane-keyframes'

interface TimelaneClipSpaceProps {
    editor: EditorState,
    layer: Delir.Project.Layer,
    activeClip: Delir.Project.Clip,
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
    static propTypes = {
        editor: PropTypes.object.isRequired,
        layer: PropTypes.object.isRequired,
        framerate: PropTypes.number.isRequired,
        pxPerSec: PropTypes.number.isRequired,
        scale: PropTypes.number.isRequired,
        activeClip: PropTypes.object.isRequired,
    }

    _plugins: {id: string, packageName: string}[]

    constructor()
    {
        super()

        this._plugins = RendererService.pluginRegistry.getPlugins().map(entry => ({
            id: entry.id,
            packageName: entry.package.name
        }))

        this.state = {
            dragovered: false,
        }
    }

    onDrop = (e: React.DragEvent<HTMLLIElement>) =>
    {
        const {dragEntity, activeComp} = this.props.editor

        if (!activeComp || !dragEntity) return

        if (dragEntity.type === 'asset') {
            // Drop asset into ClipSpace
            const {asset} = dragEntity
            const {props:{framerate, pxPerSec, scale}} = this
            const placedFrame = TimelineHelper.pixelToFrames({pxPerSec, framerate, pixel: ((e.nativeEvent as any).layerX as number), scale})
            ProjectModifyActions.createClipWithAsset(this.props.layer, asset, placedFrame)
        }
        else if (dragEntity.type === 'clip') {
            // Drop Clip into ClipSpace
            const {clip} = dragEntity
            const isChildClip = !! _.find(Array.from(this.props.layer.clips.values()), {id: clip.id})

            if (isChildClip) {
                const placedFrame = TimelineHelper.pixelToFrames({
                    pxPerSec: this.props.pxPerSec,
                    framerate: this.props.framerate,
                    pixel: e.pageX - e.currentTarget.getBoundingClientRect().left - (e.nativeEvent as DragEvent).offsetX,
                    scale: this.props.scale,
                })
                ProjectModifyActions.modifyClip(dragEntity.clip.id!, {placedFrame: placedFrame})
            } else {
                ProjectModifyActions.moveClipToLayer(clip.id!, this.props.layer.id!)
            }
        } else {
            return
        }

        EditorStateActions.clearDragEntity()
        this.setState({dragovered: false})
    }

    onDragLeave(e)
    {
        this.setState({dragovered: false})
    }

    onDragOver(e)
    {
        this.setState({dragovered: true})
    }

    changeClipPlace(clip, movedX)
    {
        console.log(movedX)
    }

    changeClipDuration = (clip: Delir.Project.Clip, newWidth: number) =>
    {
        const newDurationFrames = TimelineHelper.pixelToFrames({
            pxPerSec: this.state.pxPerSec,
            framerate: this.props.framerate,
            pixel: newWidth,
            scale: this.props.scale,
        })

        ProjectModifyActions.modifyClip(clip.id, {
            durationFrames: newDurationFrames,
        })
    }

    addNewClip = (clipRendererId) =>
    {
        ProjectModifyActions.createClip(this.props.layer.id!, clipRendererId, 0, 100)
    }

    render()
    {
        const {layer, activeClip, framerate, scale} = this.props
        const {pxPerSec} = this.state
        const keyframes = activeClip ? activeClip.keyframes : {}
        const clips = Array.from<Delir.Project.Clip>(layer.clips.values())
        const plugins = this._plugins

        const tmpKey = keyframes ? Object.keys(keyframes)[1] : ''

        return (
            <li
                className={classnames('timeline-lane', {
                    dragover: this.state.dragovered,
                    '--expand': clips.findIndex(clip => !!(activeClip && clip.id === activeClip.id)) !== -1,
                })}
                data-lane-id={layer.id}
                onDragOver={this.onDragOver.bind(this)}
                onDragLeave={this.onDragLeave.bind(this)}
                onDrop={this.onDrop}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label='Add new Clip' enabled={!!plugins.length}>
                        {_.map(plugins, p =>
                            <MenuItem label={p.packageName} onClick={this.addNewClip.bind(null, p.id)} />
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
                        };
                        const width = TimelineHelper.framesToPixel({
                            durationFrames: clip.durationFrames|0,
                            ...opt,
                        })
                        const left = TimelineHelper.framesToPixel({
                            durationFrames: clip.placedFrame|0,
                            ...opt,
                        })

                        return (
                            <Clip
                                key={clip.id!}
                                clip={clip}
                                width={width}
                                left={left}
                                onChangePlace={this.changeClipPlace.bind(this, clip)}
                                onChangeDuration={this.changeClipDuration.bind(null, clip)}
                            />
                        )
                    })}
                </div>
                <LaneKeyframes keyframes={keyframes && keyframes[tmpKey] ? keyframes[tmpKey] : []} pxPerSec={pxPerSec} />
            </li>
        )
    }
}