// @flow
import type Keyframe from '../../../../delir-core/src/project/keyframe'

import _ from 'lodash'
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
        keyframePoints: Array<{
            id: ?string,
            value: {
                beginX: number,
                beginY: number,
            },
            hasNextKeyFrame: boolean,
            transition: ?{
                beginX: number,
                beginY: number,
                handleEoX: number,
                handleEoY: number,
                handleEiX: number,
                handleEiY: number,
                endPointX: number,
                endPointY: number,
            },
            easeOutHandle: ?{
                handleEoX: number,
                handleEoY: number,
            },
            easeOutLine: ?{
                beginX: number,
                beginY: number,
                handleEoX: number,
                handleEoY: number,
            },
            easeInHandle: ?{
                handleEiX: number,
                handleEiY: number,
            },
            easeInLine: ?{
                handleEiX: number,
                handleEiY: number,
                endPointX: number,
                endPointY: number,
            },
        }>
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

        const orderedKeyframes = Array.from(this.props.keyframes).slice(0).sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)
        this.state = {
            keyframePoints: this._buildKeyframePoints(orderedKeyframes)
        }

        console.log(this.props.keyframes, orderedKeyframes, this.state.keyframePoints);
    }

    componentWillReceiveProps(nextProps)
    {
        const orderedKeyframes = Array.from(nextProps.keyframes).slice(0).sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)
        this.setState({
            keyframePoints: this._buildKeyframePoints(orderedKeyframes)
        })
    }

    render()
    {
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
                {this.state.keyframePoints.map((kfp, idx) => (
                    <g key={kfp.id} data-index={idx}>
                        <path
                            stroke='#fff'
                            fill='none'
                            strokeWidth='1'
                            d={`M ${kfp.transition.beginX} ${kfp.transition.beginY} C ${kfp.transition.handleEoX} ${kfp.transition.handleEoY} ${kfp.transition.handleEiX} ${kfp.transition.handleEiY} ${kfp.transition.endPointX} ${kfp.transition.endPointY}`}
                        />
                        <path
                            stroke='#acacac'
                            fill='none'
                            strokeWidth='1'
                            d={`M ${kfp.easeInLine.handleEiX} ${kfp.easeInLine.handleEiY} L ${kfp.easeInLine.endPointX} ${kfp.easeInLine.endPointY}`}
                            data-baseX={kfp.easeInLine.endPointX}
                            data-baseY={kfp.easeInLine.endPointY}
                            data-ease-in-handle-path
                        />
                        {kfp.hasNextKeyFrame && (
                            <path
                                stroke='#acacac'
                                fill='none'
                                strokeWidth='1' d={`M ${kfp.easeOutLine.handleEoX} ${kfp.easeOutLine.handleEoY} L ${kfp.easeOutLine.beginX} ${kfp.easeOutLine.beginY}`}
                                data-baseX={kfp.easeOutLine.beginX}
                                data-baseY={kfp.easeOutLine.beginY}
                                data-ease-out-handle-path
                            />
                        )}
                        <g transform={`translate(${kfp.value.beginX - 2.5} ${kfp.value.beginY - 2.5})`}>
                            <rect transform='rotate(45)' width='5' height='5' />
                        </g>
                        {kfp.hasNextKeyFrame && (
                            <circle
                                cx={kfp.easeInHandle.handleEiX}
                                cy={kfp.easeInHandle.handleEiY}
                                fill='#7100bf'
                                r='6'
                                data-ease-in-handle
                            />
                        )}
                        {kfp.hasNextKeyFrame && (
                            <circle
                                cx={kfp.easeOutHandle.handleEoX}
                                cy={kfp.easeOutHandle.handleEoY}
                                fill='#7100bf'
                                r='6'
                                data-ease-out-handle
                            />
                        )}
                    </g>
                ))}
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
                keyframePointIndex: attr(e.target.parentElement, 'data-index'),
                handleElement: e.target.parentElement.querySelector(e.target.matches('[data-ease-in-handle]') ? '[data-ease-in-handle-path]' : '[data-ease-out-handle-path]'),
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
            handleElement,
            initialEvent,
            initialTarget,
            initialPosition,
            keyframePointIndex,
        } = this._dragState

        const kfp = this.state.keyframePoints[keyframePointIndex|0]
        const movedX = e.screenX - initialEvent.screenX
        const movedY = e.screenY - initialEvent.screenY

        const x = initialPosition.x + (e.screenX - initialEvent.screenX)
        const y = initialPosition.y + (e.screenY - initialEvent.screenY)

        initialTarget.setAttribute('cx', x)
        initialTarget.setAttribute('cy', y)
        handleElement.setAttribute('d', `M ${attr(handleElement, 'data-baseX')} ${attr(handleElement, 'data-baseY')} L ${x} ${y}`)
        const easeInPath = e.target.parentElement.querySelector('[data-ease-in-handle-path]')

        console.log(easeInPath, kfp);
        easeInPath.setAttribute('d', `M ${x} ${y} L ${kfp.easeInLine.endPointX} ${kfp.easeInLine.endPointY}`)

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

    _buildKeyframePoints(orderedKeyframes: Array<Keyframe>)
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
                easeInLine,
                endPointX,
                endPointY,
                handleEoX,
                handleEoY,
                handleEiX,
                handleEiY

            const kfp = {}

            const beginX = frameToPx(keyframe.frameOnLayer)
            const beginY = this.props.height - this.props.height * ((keyframe.value + minValue) / minMaxRange)
            // valueElement = <g transform={`translate(${beginX - 2.5} ${beginY - 2.5})`}><rect transform='rotate(45)' width='5' height='5' /></g>
            // valueElement = <g transform={`translate(${beginX - 2.5} ${beginY - 2.5})`}><rect transform='rotate(45)' width='5' height='5' /></g>

            if (nextKeyframe) {
                endPointX = frameToPx(nextKeyframe.frameOnLayer)
                endPointY = this.props.height - this.props.height * ((nextKeyframe.value + minValue) / minMaxRange)

                handleEoX = (endPointX - beginX) * keyframe.easeOutParam[0]
                handleEoY = this.props.height * keyframe.easeOutParam[1]

                handleEiX = (endPointX - beginX) * nextKeyframe.easeInParam[0]
                handleEiY = this.props.height * nextKeyframe.easeOutParam[1]

                // pathElement = <path
                //     stroke='#fff'
                //     fill='none'
                //     strokeWidth='1'
                //     d={`M ${beginX} ${beginY} C ${handleEoX} ${handleEoY} ${handleEiX} ${handleEiY} ${endPointX} ${endPointY}`}
                // />
                // easeOutHandle = <circle
                //     cx={handleEoX}
                //     cy={handleEoY}
                //     fill='#7100bf'
                //     r='6'
                //     data-ease-out-handle
                // />
                // easeOutLine = <path
                //     key={`${kfp.key}-handle-eo-path`}
                //     stroke='#acacac'
                //     fill='none'
                //     strokeWidth='1' d={`M ${handleEoX} ${handleEoY} L ${beginX} ${beginY}`}
                //     data-baseX={beginX}
                //     data-baseY={beginY}
                //     data-ease-out-handle-path
                // />,
                // easeInHandle = <circle
                //     cx={handleEiX}
                //     cy={handleEiY}
                //     fill='#7100bf'
                //     r='6'
                //     data-ease-in-handle
                // />
                // easeInLine = <path
                //     key={`${kfp.key}-handle-ei-path`}
                //     stroke='#acacac'
                //     fill='none'
                //     strokeWidth='1'
                //     d={`M ${handleEiX} ${handleEiY} L ${endPointX} ${endPointY}`}
                //     data-baseX={endPointX}
                //     data-baseY={endPointY}
                //     data-ease-in-handle-path
                // />
            } else {
                // pathElement = <path stroke='#fff' fill='none' strokeWidth='1' d={`M ${beginX} ${beginY}`} />
            }

            // M beginPathX beginPathY
            // C handle1X handle1Y handle2X handle2Y endPointX endPointY
            // `M ${beginX} ${beginY} C ${handleEoX} ${handleEoY} ${handleEiX} ${handleEiY} ${endPointX} ${endPointY}`,
            // return <path stroke='#fff' fill='none' strokeWidth='1' d={`M ${beginX} ${beginY} C ${handle1X} ${handle1Y} ${handle2X} ${handle2Y} ${endPointX} ${endPointY}`} />

            return {
                id: keyframe.id,
                value: {beginX, beginY},
                hasNextKeyFrame: !!nextKeyframe,
                transition: {beginX, beginY, handleEoX, handleEoY, handleEiX, handleEiY, endPointX, endPointY},
                easeOutHandle: {handleEoX, handleEoY},
                easeOutLine: {beginX, beginY, handleEoX, handleEoY},
                easeInHandle: {handleEiX, handleEiY},
                easeInLine: {handleEiX, handleEiY, endPointX, endPointY},
            }

            // return (
            //     <g key={keyframe.id}>
            //         {pathElement}
            //         {easeInLine}
            //         {easeOutLine}
            //         {valueElement}
            //         {easeInHandle}
            //         {easeOutHandle}
            //     </g>
            // )
        })
    }
}
