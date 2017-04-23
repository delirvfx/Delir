import * as _ from 'lodash'
import * as React from 'react'
import {Component, PropTypes} from 'react'
import * as classnames from 'classnames'
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
    protected static propTypes = {
        activeComposition: PropTypes.object.isRequired,
        cursorHeight: PropTypes.number.isRequired,
        scale: PropTypes.number.isRequired,
        pxPerSec: PropTypes.number.isRequired,
        onSeeked: PropTypes.func.isRequired
    }

    private intervalId: number = -1

    private refs: {
        cursor: HTMLDivElement
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
        const {activeComposition, scale} = this.props
        const {cursor} = this.refs

        if (!renderer) return

        if (activeComposition) {
            // Reactの仕組みを使うとrenderMeasureが走りまくってCPUがヤバいので
            // Reactの輪廻 - Life cycle - から外した
            cursor.style.left = TimelineHelper.framesToPixel({
                pxPerSec: 30,
                framerate: activeComposition.framerate,
                durationFrames: renderer.session.lastRenderedFrame,
                scale,
            }) + 'px'
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

        const {activeComposition, pxPerSec, scale} = this.props

        if (! activeComposition) return

        const frame = TimelineHelper.pixelToFrames({
            pxPerSec,
            framerate: activeComposition.framerate,
            scale,
            pixel: (e as MouseEvent).layerX,
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
                <div className={s.measureLayer}>
                    {this._renderMeasure()}
                </div>
                <div ref='cursor' className={s.playingCursor} style={{height: `calc(100% + ${this.props.cursorHeight}px - 5px)`}} />
            </div>
        )
    }

    private _renderMeasure(): JSX.Element[]
    {
        const {activeComposition} = this.props
        if (! activeComposition) {
            return []
        }

        let previousPos = -40
        const components: JSX.Element[] = []
        for (let idx = 0; idx < 300; idx++) {
            let frame = 10 * idx

            if (frame >= activeComposition.durationFrames) {
                const pos = TimelineHelper.framesToPixel({
                    pxPerSec: this.props.pxPerSec,
                    framerate: this.props.activeComposition!.framerate,
                    scale: this.props.scale,
                    durationFrames: activeComposition.durationFrames
                })

                components.push(
                    <div
                        key={idx}
                        className={classnames(s.measureLine, s['--endFrame'])}
                        style={{left: pos}}
                    ></div>
                )
                break
            }

            const pos = TimelineHelper.framesToPixel({
                pxPerSec: this.props.pxPerSec,
                framerate: this.props.activeComposition!.framerate,
                scale: this.props.scale,
                durationFrames: frame
            })

            if (pos - previousPos >= 40/* px */) {
                previousPos = pos
                components.push(<div key={idx} className={s.measureLine} style={{left: pos}}>{frame}</div>)
            }
        }

        return components
    }
}
