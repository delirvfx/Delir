import * as React from 'react'
import {Component, PropTypes} from 'react'
import * as Delir from 'delir-core'

import TimelaneHelper from '../../helpers/timelane-helper'
import RendererService from '../../services/renderer'

import s from './Gradations.styl'

interface GradationsProps {
    activeComposition: Delir.Project.Composition|null,
    cursorHeight: number,
    scale: number
}

export default class Gradations extends Component<GradationsProps, any>
{
    static propTypes = {
        activeComposition: PropTypes.object.isRequired,
        cursorHeight: PropTypes.number.isRequired,
        scale: PropTypes.number.isRequired,
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
                left: TimelaneHelper.framesToPixel({
                    pxPerSec: 30,
                    framerate: activeComposition.framerate,
                    durationFrames: renderer.session.lastRenderedFrame,
                    scale: scale,
                }),
            })
        }

        this.intervalId = requestAnimationFrame(this.updateCursor)
    }

    render()
    {
        return (
            <div className={s.Gradations}>
                <div className={s.playingCursor} style={{
                    left: this.state.left,
                    height: `calc(100% + ${this.props.cursorHeight}px - 5px)`
                }} />
            </div>
        )
    }
}