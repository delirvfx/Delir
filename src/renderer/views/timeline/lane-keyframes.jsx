// @flow
import React, {PropTypes} from 'react'
import TimelaneHelper from '../../helpers/timelane-helper'

export default class LaneKeyframes extends React.Component
{
    static propTypes = {
        pxPerSec: PropTypes.number.isRequired,
        keyframes: PropTypes.object.isRequired,
    }

    constructor(...args)
    {
        super(...args)

        this.svgElement = document.createElement('svg')
    }

    componentDidMount()
    {
        this.refs.container.appendChild(this.svgElement)
    }

    render()
    {
        // this.renderKeyframeBody()

        return (
            <div ref='container' className='timeline-lane-keyframes'>
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
                }) */}
            </div>
        )
    }
}
