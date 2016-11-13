// @flow
import type Keyframe from '../../../../delir-core/src/project/keyframe'

import React, {PropTypes} from 'react'
import TimelaneHelper from '../../helpers/timelane-helper'
import * as d3 from 'd3'

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

    constructor(...args)
    {
        super(...args)

        // this.svgElement = document.createElement('svg')
        // this.svgElement.height = this.props.height
    }

    componentDidMount()
    {
        // this.refs.container.appendChild(this.svgElement)
        // document.body.appendChild(this.svgElement)
        this.svg = d3.select(this.refs.svg)
            .attr('width', 500)
            .attr('height', this.props.height)
            // .attr('viewBox', `0 0 500 ${this.props.height}`)

        this.renderKeyframeBody()
    }

    render()
    {
        this.renderKeyframeBody()

        return (
            <svg ref='svg' className='timeline-lane-keyframes'>
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

    renderKeyframeBody()
    {
        if (!this.svg) return
        if (!this.props.keyframes) return

        const {svg} = this
        const orderedKeyframes = Array.from(this.props.keyframes).slice(0).sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)

        const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value), 0)
        const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value), 0)
        const minMaxRange = maxValue - minValue

        const ret = svg.selectAll('path')
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
    }
}
