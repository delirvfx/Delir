// @flow
import type Keyframe from '../../../../delir-core/src/project/keyframe'

import _ from 'lodash'
import React, {PropTypes} from 'react'
import TimelaneHelper from '../../helpers/timelane-helper'

import ProjectModifyActions from '../../actions/project-modify-actions'
import ProjectModifyStore from '../../stores/project-modify-store'

const attr = (el, name) => el.getAttribute(name)

type HandlerDraggingSession = {
    grabbed: 'ease-handle',
    grabbedHandle: 'ease-in' | 'ease-out',
    initialEvent: MouseEvent,
    initialTarget: Element,
    group: SVGGElement,
    keyframePointIndex: number,
    handleElement: Element,
    initialPosition: {
        x: number,
        y: number,
    },
}

type KeyframePoint = {
    id: ?string,
    nextId: ?string,
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
}

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
        keyframePoints: Array<KeyframePoint>
    }

    _dragState: ?HandlerDraggingSession = null

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

    onMouseDown = ({nativeEvent: e}) =>
    {
        if (e.target.matches('[data-ease-in-handle],[data-ease-out-handle]')) {
            console.log(e.target, e.target.parentElement);
            const isEaseInGrabbed = e.target.matches('[data-ease-in-handle]')
            this._dragState = {
                grabbed: 'ease-handle',
                grabbedHandle: isEaseInGrabbed ? 'ease-in' : 'ease-out',
                initialEvent: e,
                initialTarget: e.target,
                group: e.target.parentElement,
                keyframePointIndex: attr(e.target.parentElement, 'data-index')|0,
                handleElement: e.target.parentElement.querySelector(isEaseInGrabbed ? '[data-ease-in-handle-path]' : '[data-ease-out-handle-path]'),
                initialPosition: {
                    x: e.target.getAttribute('cx')|0,
                    y: e.target.getAttribute('cy')|0,
                }
            }
        }
    }

    onMouseUp = () =>
    {
        if (!this._dragState) return

        if (this._dragState.grabbed === 'ease-handle') {
            switch (true) {
                case this._dragState.grabbedHandle === 'ease-in':
                    this.onReleaseEaseInHandle()
                    break
                case this._dragState.grabbedHandle === 'ease-out':
                    // this.onReleaseEaseOutHandle(e)
                    break
            }
        }

        this._dragState = null
    }

    onMouseMove = ({nativeEvent: e}: {nativeEvent: MouseEvent}) =>
    {
        if (!this._dragState || e.which !== 1) return // not mouse left clicked

        if (this._dragState.grabbed === 'ease-handle') {
            switch (true) {
                case this._dragState.grabbedHandle === 'ease-in':
                    this.dragEaseInHandle(e)
                    break
                case this._dragState.grabbedHandle === 'ease-out':
                    this.dragEaseOutHandle(e)
                    break
            }
        }
    }

    dragEaseInHandle = (e: MouseEvent) =>
    {
        const {
            initialEvent,
            initialTarget,
            initialPosition,
            handleElement,
            group,
            keyframePointIndex,
        } = (this._dragState: HandlerDraggingSession)

        const kfp = this.state.keyframePoints[keyframePointIndex|0]
        const movedX = e.screenX - initialEvent.screenX
        const movedY = e.screenY - initialEvent.screenY

        const x = initialPosition.x + (e.screenX - initialEvent.screenX)
        const y = initialPosition.y + (e.screenY - initialEvent.screenY)

        initialTarget.setAttribute('cx', x)
        initialTarget.setAttribute('cy', y)
        handleElement.setAttribute('d', `M ${attr(handleElement, 'data-baseX')} ${attr(handleElement, 'data-baseY')} L ${x} ${y}`)

        const easeInPath = group.querySelector('[data-ease-in-handle-path]')
        easeInPath.setAttribute('d', `M ${x} ${y} L ${kfp.easeInLine.endPointX} ${kfp.easeInLine.endPointY}`)

        const transitionPath = group.querySelector('[data-transition-path]')
        transitionPath.setAttribute('d', `M ${kfp.transition.beginX} ${kfp.transition.beginY} C ${kfp.transition.handleEoX} ${kfp.transition.handleEoY} ${x} ${y} ${kfp.transition.endPointX} ${kfp.transition.endPointY}`)
    }

    dragEaseOutHandle = (e: MouseEvent) =>
    {
        const {
            initialEvent,
            initialTarget,
            initialPosition,
            handleElement,
            group,
            keyframePointIndex,
        } = (this._dragState: HandlerDraggingSession)

        const kfp = this.state.keyframePoints[keyframePointIndex|0]
        const movedX = e.screenX - initialEvent.screenX
        const movedY = e.screenY - initialEvent.screenY

        const x = initialPosition.x + (e.screenX - initialEvent.screenX)
        const y = initialPosition.y + (e.screenY - initialEvent.screenY)

        initialTarget.setAttribute('cx', x)
        initialTarget.setAttribute('cy', y)
        handleElement.setAttribute('d', `M ${attr(handleElement, 'data-baseX')} ${attr(handleElement, 'data-baseY')} L ${x} ${y}`)

        const easeOutPath = group.querySelector('[data-ease-out-handle-path]')
        easeOutPath.setAttribute('d', `M ${kfp.easeOutLine.beginX} ${kfp.easeOutLine.beginY} L ${x} ${y}`)

        const transitionPath = group.querySelector('[data-transition-path]')
        transitionPath.setAttribute('d', `M ${kfp.transition.beginX} ${kfp.transition.beginY} C ${x} ${y} ${kfp.transition.handleEiX} ${kfp.transition.handleEiY} ${kfp.transition.endPointX} ${kfp.transition.endPointY}`)
    }

    onReleaseEaseInHandle()
    {
        if (! this._dragState) return

        const {
            handleElement,
            initialPosition,
            group,
        } = (this._dragState: HandlerDraggingSession)

        const keyframePoint = this.state.keyframePoints[this._dragState.keyframePointIndex]
        const handle = group.querySelector('[data-ease-in-handle]')
        const groupBounding = group.getBBox()
        const x: number = ((attr(handle, 'cx')|0) - groupBounding.x) / groupBounding.width
        const y: number = ((attr(handle, 'cy')|0) - groupBounding.y) / groupBounding.height

        console.log(this._dragState);
        ProjectModifyActions.modifyKeyFrame(keyframePoint.nextId, {
            easeInParam: [x, y]
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
                            data-transition-path
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

            if (nextKeyframe) {
                endPointX = frameToPx(nextKeyframe.frameOnLayer)
                endPointY = this.props.height - this.props.height * ((nextKeyframe.value + minValue) / minMaxRange)

                handleEoX = (endPointX - beginX) * keyframe.easeOutParam[0]
                handleEoY = this.props.height * keyframe.easeOutParam[1]

                handleEiX = (endPointX - beginX) * nextKeyframe.easeInParam[0]
                handleEiY = this.props.height * nextKeyframe.easeOutParam[1]
            }

            return {
                id: keyframe.id,
                nextId: nextKeyframe ? nextKeyframe.id : null,
                value: {beginX, beginY},
                hasNextKeyFrame: !!nextKeyframe,
                transition: {beginX, beginY, handleEoX, handleEoY, handleEiX, handleEiY, endPointX, endPointY},
                easeOutHandle: {handleEoX, handleEoY},
                easeOutLine: {beginX, beginY, handleEoX, handleEoY},
                easeInHandle: {handleEiX, handleEiY},
                easeInLine: {handleEiX, handleEiY, endPointX, endPointY},
            }
        })
    }
}
