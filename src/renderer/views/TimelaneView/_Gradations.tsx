import * as React from 'react'
import {Component, PropTypes} from 'react'
import * as Delir from 'delir-core'

import TimelineHelper from '../../helpers/timeline-helper'
import RendererService from '../../services/renderer'

import * as s from './Gradations.styl'

interface GradationsProps {
    activeComposition: Delir.Project.Composition|null,
    cursorHeight: number,
    scale: number
    pxPerSec: number,
    onSeeked: (frame: number) => any
}

interface GradationsState {
    left: number,
    dragSeekEnabled: boolean,
}

export default class Gradations extends Component<GradationsProps, GradationsState>
{
    static propTypes = {
        activeComposition: PropTypes.object.isRequired,
        cursorHeight: PropTypes.number.isRequired,
        scale: PropTypes.number.isRequired,
        pxPerSec: PropTypes.number.isRequired,
        onSeeked: PropTypes.func.isRequired
    }

    intervalId = null

    state = {
        left: 0,
        dragSeekEnabled: false,
    }

    componentDidMount()
    {
        this.intervalId = requestAnimationFrame(this.updateCursor)
    }

    componentWillUnmount()
    {
        cancelAnimationFrame(this.intervalId)
    }

    updateCursor = () =>
    {
        const renderer = RendererService.renderer
        const {activeComposition, scale} = this.props

        if (activeComposition) {
            this.setState({
                left: TimelineHelper.framesToPixel({
                    pxPerSec: 30,
                    framerate: activeComposition.framerate,
                    durationFrames: renderer.session.lastRenderedFrame,
                    scale: scale,
                }),
            })
        }

        this.intervalId = requestAnimationFrame(this.updateCursor)
    }

    seeking = ({nativeEvent: e}: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.type === 'mousedown') {
            this.setState({dragSeekEnabled: true})
        } else if (e.type === 'mouseup') {
            this.setState({dragSeekEnabled: false})
            return
        }

        if (!this.state.dragSeekEnabled) return

        const {activeComposition, pxPerSec, scale} = this.props

        if (! activeComposition) return

        const frame = TimelineHelper.pixelToFrames({
            pxPerSec,
            framerate: activeComposition.framerate,
            scale,
            pixel: (e as MouseEvent).layerX,
        })|0

        this.props.onSeeked(frame)
    }

    render()
    {
        return (
            <div className={s.Gradations} onMouseDown={this.seeking} onMouseMove={this.seeking} onMouseUp={this.seeking}>
                <div className={s.playingCursor} style={{
                    left: this.state.left,
                    height: `calc(100% + ${this.props.cursorHeight}px - 5px)`
                }} />
            </div>
        )
    }
}