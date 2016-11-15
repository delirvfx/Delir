// @flow
import type Keyframe from '../../../../delir-core/src/project/keyframe'

import React, {PropTypes} from 'react'
import TimelaneHelper from '../../helpers/timelane-helper'
import * as d3 from 'd3'

import ProjectModifyStore from '../../stores/project-modify-store'

const attr = (el, name) => el.getAttribute(name)

export default class LaneKeyframes extends React.Component
{
    static propTypes = {
        height: PropTypes.number,
        pxPerSec: PropTypes.number.isRequired,
        framerate: PropTypes.number.isRequired,
        keyframes: PropTypes.object.isRequired,
    }

    static defaultProps = {
        height: 300,
    }

    props: {
        height: number,
        pxPerSec: number,
        framerate: number,
        keyframes: Array<Keyframe>,
    }

    state: {
        dragging: boolean,
        startEvent: ?MouseEvent,
    }

    _dragState: ?{
        dragging: boolean,
        grabbed: 'ease-handle',
        initialEvent: ?MouseEvent,
        relateTarget: ?Element,
        initialTarget: Element,
        initialPosition: {x: number, y: number}
    } = null

    constructor(...args)
    {
        super(...args)

        this.state = {
            dragging: false,
            startEvent: null,
        }

        // this.svgElement = document.createElement('svg')
        // this.svgElement.height = this.props.height
    }

    componentDidMount()
    {
        // this.refs.container.appendChild(this.svgElement)
        // document.body.appendChild(this.svgElement)
        // this.svg = d3.select(this.refs.svg)
        //     .attr('width', 500)
        //     .attr('height', this.props.height)
            // .attr('viewBox', `0 0 500 ${this.props.height}`)

        this.renderKeyframeBody()
    }

    render()
    {
        // this.renderKeyframeBody()

        let paths
        if (this.props.keyframes) {
            const orderedKeyframes = Array.from(this.props.keyframes).slice(0).sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)
            paths = this._buildPaths(orderedKeyframes)
        }

        return (
            <svg
                className='timeline-lane-keyframes'
                viewBox='-5 0 990 150'
                width='990'
                height='150'
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            >
                {paths}
                {/*
                    <text>keyFrameEditor</text>
                    <path stroke='#fff' fill='none' strokeWidth={2} d={`
                        M 0,300
                        C 50,50 90,0 100,0
                    `}/>
                    this.props.keyframes[tmpKey].map(keyframe => {
                        <path d={`
                            M 0,100%
                            C ${100 * keyframe.easeOutParam[0]},${300 * keyframe.easeOutParam[1]} 200,200 100,0
                        `}/>
                    })
                */}

            </svg>
        )
    }

    onMouseDown = ({nativeEvent: e}) =>
    {
        if (e.target.matches('[data-ease-in-handle],[data-ease-out-handle]')) {
            this._dragState = {
                dragging: true,
                grabbed: 'ease-handle',
                initialEvent: e,
                initialTarget: e.target,
                relateTarget: e.target.parentElement.querySelector(e.target.matches('[data-ease-in-handle]') ? '[data-ease-in-handle-path]' : '[data-ease-out-handle-path]'),
                initialPosition: {
                    x: e.target.getAttribute('cx')|0,
                    y: e.target.getAttribute('cy')|0,
                }
            }
        }
    }

    onMouseUp = () =>
    {
        this._dragState = null
    }

    onMouseMove = ({nativeEvent: e}: {nativeEvent: MouseEvent}) =>
    {
        if (!this._dragState || e.which !== 1) return // not mouse left clicked

        if (this._dragState.grabbed === 'ease-handle') {
            switch (true) {
                case this._dragState.initialTarget.matches('[data-ease-in-handle]'):
                    this.dragEaseInHandle(e)
                    break
                case this._dragState.initialTarget.matches('[data-ease-out-handle]'):
                    this.dragEaseOutHandle(e)
                    break
            }
        }
    }

    dragEaseInHandle = (e: MouseEvent) =>
    {
        const {
            relateTarget,
            initialEvent,
            initialTarget,
            initialPosition,
        } = this._dragState

        const x = initialPosition.x + (e.screenX - initialEvent.screenX)
        const y = initialPosition.y + (e.screenY - initialEvent.screenY)

        initialTarget.setAttribute('cx', x)
        initialTarget.setAttribute('cy', y)
        relateTarget.setAttribute('d', `M ${attr(relateTarget, 'data-baseX')} ${attr(relateTarget, 'data-baseY')} L ${x} ${y}`)
    }

    dragEaseOutHandle = (e: MouseEvent) =>
    {
        const {
            relateTarget,
            initialEvent,
            initialTarget,
            initialPosition,
        } = this._dragState

        const x = initialPosition.x + (e.screenX - initialEvent.screenX)
        const y = initialPosition.y + (e.screenY - initialEvent.screenY)

        initialTarget.setAttribute('cx', x)
        initialTarget.setAttribute('cy', y)
        relateTarget.setAttribute('d', `M ${attr(relateTarget, 'data-baseX')} ${attr(relateTarget, 'data-baseY')} L ${x} ${y}`)
    }

    _buildPaths(orderedKeyframes: Array<Keyframe>)
    {
        const frameToPx = (frame: number) => TimelaneHelper.framesToPixel({
            pxPerSec: this.props.pxPerSec,
            framerate: this.props.framerate,
            durationFrames: frame,
            scale: 1
        })

        const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value), 0) + 10
        const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value), 0) + -10
        const minMaxRange = maxValue - minValue

        // Calc keyframe and handle points
        return orderedKeyframes.map((keyframe, idx) => {
            const nextKeyframe = orderedKeyframes[idx + 1]

            let pathElement,
                valueElement,
                easeOutHandle,
                easeOutLine,
                easeInHandle,
                easeInLine

            const kfp = {}

            const pointX = frameToPx(keyframe.frameOnLayer)
            console.log(pointX, keyframe.frameOnLayer);
            const pointY = this.props.height - this.props.height * ((keyframe.value + minValue) / minMaxRange)
            valueElement = <g transform={`translate(${pointX - 2.5} ${pointY - 2.5})`}><rect transform='rotate(45)' width='5' height='5' /></g>

            if (nextKeyframe) {
                const endPointX = frameToPx(nextKeyframe.frameOnLayer)
                const endPointY = this.props.height - this.props.height * ((nextKeyframe.value + minValue) / minMaxRange)

                const handleEoX = (endPointX - pointX) * keyframe.easeOutParam[0]
                const handleEoY = this.props.height * keyframe.easeOutParam[1]

                const handleEiX = (endPointX - pointX) * nextKeyframe.easeInParam[0]
                const handleEiY = this.props.height * nextKeyframe.easeOutParam[1]

                pathElement = <path
                    stroke='#fff'
                    fill='none'
                    strokeWidth='1'
                    d={`M ${pointX} ${pointY} C ${handleEoX} ${handleEoY} ${handleEiX} ${handleEiY} ${endPointX} ${endPointY}`}
                />
                easeOutHandle = <circle
                    cx={handleEoX}
                    cy={handleEoY}
                    fill='#7100bf'
                    r='6'
                    data-ease-out-handle
                />
                easeOutLine = <path
                    key={`${kfp.key}-handle-eo-path`}
                    stroke='#acacac'
                    fill='none'
                    strokeWidth='1' d={`M ${handleEoX} ${handleEoY} L ${pointX} ${pointY}`}
                    data-baseX={pointX}
                    data-baseY={pointY}
                    data-ease-out-handle-path
                />,
                easeInHandle = <circle
                    cx={handleEiX}
                    cy={handleEiY}
                    fill='#7100bf'
                    r='6'
                    data-ease-in-handle
                />
                easeInLine = <path
                    key={`${kfp.key}-handle-ei-path`}
                    stroke='#acacac'
                    fill='none'
                    strokeWidth='1'
                    d={`M ${handleEiX} ${handleEiY} L ${endPointX} ${endPointY}`}
                    data-baseX={endPointX}
                    data-baseY={endPointY}
                    data-ease-in-handle-path
                />
            } else {
                pathElement = <path stroke='#fff' fill='none' strokeWidth='1' d={`M ${pointX} ${pointY}`} />
            }

            // M beginPathX beginPathY
            // C handle1X handle1Y handle2X handle2Y endPointX endPointY
            // `M ${pointX} ${pointY} C ${handleEoX} ${handleEoY} ${handleEiX} ${handleEiY} ${endPointX} ${endPointY}`,
            // return <path stroke='#fff' fill='none' strokeWidth='1' d={`M ${pointX} ${pointY} C ${handle1X} ${handle1Y} ${handle2X} ${handle2Y} ${endPointX} ${endPointY}`} />

            return (
                <g key={keyframe.id}>
                    {pathElement}
                    {easeInLine}
                    {easeOutLine}
                    {valueElement}
                    {easeInHandle}
                    {easeOutHandle}
                </g>
            )
        })

        // console.log(keyframePoints);
        //
        // return {
        //     path : keyframePoints.map(kfp => <path key={kfp.key} stroke='#fff' fill='none' strokeWidth='1' d={kfp.path} />),
        //     handles : keyframePoints.map(kfp => {
        //         const ret = []
        //
        //         if (kfp.hasPrev && kfp.hasNext) {
        //             ret.push(
        //                 <circle key={`${kfp.key}-handle-ei`} cx={kfp.handleEI.x} cy={kfp.handleEI.y} r='3' />,
        //                 <path key={`${kfp.key}-handle-ei-path`} stroke='#acacac' fill='none' strokeWidth='1' d={`M ${kfp.handleEI.x} ${kfp.handleEI.y} L ${kfp.begin.x} ${kfp.begin.y}`} />,
        //             )
        //         }
        //
        //         if (kfp.hasNext) {
        //             ret.push(
        //                 <circle key={`${kfp.key}-handle-eo`} cx={kfp.handleEO.x} cy={kfp.handleEO.y} r='3' />,
        //                 <path key={`${kfp.key}-handle-eo-path`} stroke='#acacac' fill='none' strokeWidth='1' d={`M ${kfp.handleEO.x} ${kfp.handleEO.y} L ${kfp.begin.x} ${kfp.begin.y}`} />,
        //             )
        //         }
        //     })
        // }
    }

    // _buildHandles(orderedKeyframes: Array<Keyframe>)
    // {
    //     const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value), 0)
    //     const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value), 0)
    //     const minMaxRange = maxValue - minValue
    //
    //     return orderedKeyframes.reduce((memo: Array<any>, keyframe, idx, list) => {
    //         if (list[idx - 1]) {
    //             // Ease-in
    //             const handlePlaceX =
    //         }
    //     }, [])
    // }

    renderKeyframeBody()
    {
        if (!this.svg) return
        if (!this.props.keyframes) return

        const {svg} = this
        const orderedKeyframes = Array.from(this.props.keyframes).slice(0).sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)

        const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value), 0)
        const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value), 0)
        const minMaxRange = maxValue - minValue

        svg.selectAll('path')
            .data(orderedKeyframes, kf => kf.id)
            .enter()
                .append('path')
                .attr('stroke', '#fff')
                .attr('fill', 'none')
                .attr('strokeWidth', 2)
                .attr('d', (keyframe: Keyframe, idx: number) => {
                    if (! orderedKeyframes[idx + 1]) return ''

                    const nextKeyFrame = orderedKeyframes[idx + 1]

                    const pointX = TimelaneHelper.framesToPixel({
                        pxPerSec: this.props.pxPerSec,
                        framerate: this.props.framerate,
                        durationFrames: keyframe.frameOnLayer,
                        scale: 1
                    })
                    const pointY = this.props.height - this.props.height * ((keyframe.value + minValue) / minMaxRange)

                    const endPointX = TimelaneHelper.framesToPixel({
                        pxPerSec: this.props.pxPerSec,
                        framerate: this.props.framerate,
                        durationFrames: nextKeyFrame.frameOnLayer,
                        scale: 1
                    })
                    const endPointY = this.props.height - this.props.height * ((nextKeyFrame.value + minValue) / minMaxRange)

                    const handle1X = (endPointX - pointX) * keyframe.easeOutParam[0]
                    const handle1Y = this.props.height * keyframe.easeOutParam[1]

                    const handle2X = (endPointX - pointX) * nextKeyFrame.easeInParam[0]
                    const handle2Y = this.props.height * nextKeyFrame.easeOutParam[1]

                    // M beginPathX,beginPathY
                    // C handle1X,handle1Y handle2X,handle2Y endPointX,endPointY
                    return `M ${pointX} ${pointY} C ${handle1X} ${handle1Y} ${handle2X} ${handle2Y} ${endPointX} ${endPointY}`
                })
                .exit()
                .remove()
        // svg.selectAll('circle')
        //     .data(orderedKeyframes, kf => kf.id)
        //     .enter()
        //         .append('circle')
        //         .attr('stroke', '#fff')
        //         .attr('fill', '#000')
        //         .attr('strokeWidth')
        //         .attr('r', '5')
        //         .attr('cx', (keyframe: Keyframe, idx: number) => {
        //             const pointX
        //         })
        //         .attr('cy', (keyframe: Keyframe, idx: number) => {
        //             const pointY
        //         })
    }
}
