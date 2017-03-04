import * as React from 'react'
import {Component, PropTypes} from 'react'
import * as Delir from 'delir-core'

import TimelineHelper from '../../helpers/timeline-helper'
import RendererService from '../../services/renderer'

import s from './Gradations.styl'

interface GradationsProps {
    activeComposition: Delir.Project.Composition|null,
    cursorHeight: number,
    scale: number
    pxPerSec: number,
    onSeeked: (frame: number) => any
}

export default class Gradations extends Component<GradationsProps, any>
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

        if (activeComposition && renderer.isPlaying) {
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

    clicked = ({nativeEvent: e}: React.MouseEvent<HTMLDivElement>) =>
    {
        const {activeComposition, pxPerSec, scale} = this.props

        if (! activeComposition) return

        const frame = TimelineHelper.pixelToFrames({
            pxPerSec,
            framerate: activeComposition.framerate,
            scale,
            pixel: (e as MouseEvent).layerX,
        })

        this.props.onSeeked(frame)
    }

    render()
    {
        return (
            <div className={s.Gradations} onClick={this.clicked}>
                <div className={s.playingCursor} style={{
                    left: this.state.left,
                    height: `calc(100% + ${this.props.cursorHeight}px - 5px)`
                }} />
            </div>
        )
    }
}