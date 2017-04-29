import * as _ from 'lodash'
import * as React from 'react'
import {Component, PropTypes} from 'react'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'

import {default as TimelineHelper, MeasurePoint} from '../../helpers/timeline-helper'
import RendererService from '../../services/renderer'

import * as s from './Gradations.styl'

interface GradationsProps {
    measures: MeasurePoint[]
    activeComposition: Delir.Project.Composition|null,
    cursorHeight: number,
    scrollLeft: number,
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
    protected static propTypes = {
        measures: PropTypes.array.isRequired,
        activeComposition: PropTypes.object.isRequired,
        cursorHeight: PropTypes.number.isRequired,
        scrollLeft: PropTypes.number,
        scale: PropTypes.number.isRequired,
        pxPerSec: PropTypes.number.isRequired,
        onSeeked: PropTypes.func.isRequired
    }

    protected static defaultProps = {
        scrollLeft: 0,
    }

    private intervalId: number = -1

    private refs: {
        cursor: HTMLDivElement
        measureLayer: HTMLDivElement
    }

    private state = {
        left: 0,
        dragSeekEnabled: false,
    }

    protected componentDidMount()
    {
        this.intervalId = requestAnimationFrame(this._updateCursor)
    }

    protected componentWillUnmount()
    {
        cancelAnimationFrame(this.intervalId)
    }

    private _updateCursor = () =>
    {
        const renderer = RendererService.renderer
        const {activeComposition, scrollLeft, scale} = this.props
        const {cursor, measureLayer} = this.refs

        if (!renderer) return

        if (activeComposition) {
            // Reactの仕組みを使うとrenderMeasureが走りまくってCPUがヤバいので
            // Reactのライフサイクルから外す
            const cursorLeft = TimelineHelper.framesToPixel({
                pxPerSec: 30,
                framerate: activeComposition.framerate,
                durationFrames: renderer.session.lastRenderedFrame || 0,
                scale,
            })

            cursor.style.display = cursorLeft - scrollLeft < 0 ? 'none' : 'block'
            cursor.style.left = `${cursorLeft}px`
            cursor.style.transform = `translateX(-${scrollLeft}px)`
            measureLayer.style.transform = `translateX(-${scrollLeft}px)`
        }

        this.intervalId = requestAnimationFrame(this._updateCursor)
    }

    private _seeking = ({nativeEvent: e}: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.type === 'mousedown') {
            this.setState({dragSeekEnabled: true})
        } else if (e.type === 'mouseup') {
            this.setState({dragSeekEnabled: false})
            return
        }

        if (!this.state.dragSeekEnabled) return

        const {activeComposition, pxPerSec, scale, scrollLeft} = this.props

        if (! activeComposition) return

        const frame = TimelineHelper.pixelToFrames({
            pxPerSec,
            framerate: activeComposition.framerate,
            scale,
            pixel: (e as MouseEvent).layerX + scrollLeft,
        }) | 0

        this.props.onSeeked(frame)
    }

    protected render()
    {
        return (
            <div
                className={s.Gradations}
                onMouseDown={this._seeking}
                onMouseMove={this._seeking}
                onMouseUp={this._seeking}
                onClick={this._seeking}
            >
                <div className={s.measureLayerTrimer}>
                    <div ref='measureLayer' className={s.measureLayer}>
                        {this._renderMeasure()}
                    </div>
                </div>
                <div ref='cursor' className={s.playingCursor} style={{height: `calc(100% + ${this.props.cursorHeight}px - 5px)`}} />
            </div>
        )
    }

    private _renderMeasure = (): JSX.Element[] =>
    {
        const {measures, activeComposition} = this.props
        const components: JSX.Element[] = []

        if (! activeComposition) return []

        for (const point of measures) {
            components.push(
                <div
                    key={point.index}
                    className={classnames(s.measureLine, {
                        [s['--grid']]: point.frameNumber % 10 === 0,
                        [s['--endFrame']]: point.frameNumber === activeComposition.durationFrames,
                    })}
                    style={{left: point.left}}
                >
                    {point.frameNumber}
                </div>
            )
        }

        return components
    }
}
