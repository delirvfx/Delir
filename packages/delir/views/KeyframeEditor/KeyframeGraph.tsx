import * as Delir from '@ragg/delir-core'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'

import TimePixelConversion from '../../utils/TimePixelConversion'

import * as AppActions from '../../actions/App'

import { ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as s from './KeyframeGraph.styl'

interface OwnProps {
    width: number
    height: number
    viewBox: string
    scrollLeft: number
    composition: Delir.Entity.Composition
    parentClip: Delir.Entity.Clip
    entity: Delir.Entity.Clip | Delir.Entity.Effect | null
    paramName: string,
    descriptor: Delir.AnyParameterTypeDescriptor
    keyframes: Delir.Entity.Keyframe[]
    pxPerSec: number
    zoomScale: number
    onKeyframeRemove: (parentClipId: string, keyframeId: string) => void
    onModified: (parentClipId: string, paramName: string, frameOnClip: number, patch: KeyframePatch) => void
}

type Props = OwnProps & ContextProp

interface State {
    activeKeyframeId: string | null
    keyframeMovement: {x: number} | null
    easingHandleMovement: {x: number, y: number} | null
}

export interface KeyframePatch {
    easeInParam?: [number, number]
    easeOutParam?: [number, number]
    frameOnClip?: number
}

export default withComponentContext(class KeyframeGraph extends React.Component<Props, State> {
    public state: State = {
        activeKeyframeId: null,
        keyframeMovement: null,
        easingHandleMovement: null,
    }

    private selectedKeyframeId: string | null = null
    private _initialKeyframePosition: {x: number, y: number} | null = null
    private _keyframeDragged: boolean = false

    private draggedEasingHandler: {
        type: 'ease-in' | 'ease-out',
        keyframeId: string,
        element: SVGCircleElement,
        container: SVGGElement,
        initialPosition: {x: number, y: number},
    } | null = null

    public render()
    {
        const {width, height, viewBox, descriptor, keyframes} = this.props

        return (
            <svg
                className={s.keyframeGraph}
                viewBox={viewBox}
                width={width}
                height={height}
                onMouseMove={this.mouseMoveOnSvg}
                onMouseUp={this.mouseUpOnSvg}
                onKeyDown={this.keydownOnKeyframeGraph}
                tabIndex={-1}
            >
                {descriptor.animatable && (() => {
                    switch (descriptor.type) {
                        case 'COLOR_RGB':
                        case 'COLOR_RGBA':
                            return this._renderColorKeyframes(keyframes)

                        case 'FLOAT':
                        case 'NUMBER':
                            return this._renderNumberKeyframes(keyframes)

                        case 'STRING':
                            return this._renderStringKeyframes(keyframes)
                    }
                })()}
            </svg>
        )
    }

    private mouseMoveOnSvg = (e: React.MouseEvent<SVGElement>) =>
    {
        if (this.selectedKeyframeId) {
            this._keyframeDragged = true

            this.setState({
                keyframeMovement: {
                    x: e.screenX - this._initialKeyframePosition!.x,
                }
            })
        } else if (this.draggedEasingHandler) {
            this.setState({
                easingHandleMovement: {
                    x: e.screenX - this.draggedEasingHandler.initialPosition!.x,
                    y: e.screenY - this.draggedEasingHandler.initialPosition!.y,
                },
            })
        }
    }

    private mouseUpOnSvg = (e: React.MouseEvent<SVGElement>) =>
    {
        e.preventDefault()
        e.stopPropagation()

        const { parentClip, entity, paramName, keyframes, onModified } = this.props

        const {keyframeMovement} = this.state
        if (!parentClip || !paramName || !entity) return

        process: {
            if (this.selectedKeyframeId) {
                // Process for keyframe dragged
                if (!this._keyframeDragged) {
                    this.setState({activeKeyframeId: this.selectedKeyframeId, keyframeMovement: null})
                    break process
                }

                if (!keyframeMovement) break process

                const keyframe = keyframes.find(kf => kf.id === this.selectedKeyframeId)!
                const movedFrame = this.pxToFrame(keyframeMovement.x)

                onModified(parentClip.id, paramName, keyframe.frameOnClip, { frameOnClip: keyframe.frameOnClip + movedFrame })
            } else if (this.draggedEasingHandler) {
                // Process for easing handle dragged

                const data = this.draggedEasingHandler
                const transitionPath = this.draggedEasingHandler.container.querySelector('[data-transition-path]')! as HTMLElement

                const keyframes = entity.keyframes[paramName].slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)
                const keyframeIdx = keyframes.findIndex(kf => kf.id === this.draggedEasingHandler!.keyframeId)!
                if (keyframeIdx === -1) break process

                const {beginX, beginY, endX, endY} = _.mapValues(transitionPath.dataset, val => parseFloat(val!))
                const rect = {width: endX - beginX, height: endY - beginY}
                const position = {x: data.element.cx.baseVal.value, y: data.element.cy.baseVal.value}

                if (data.type === 'ease-in') {
                    const keyframe = keyframes[keyframeIdx + 1]
                    onModified(parentClip.id, paramName, keyframe.frameOnClip, {
                        easeInParam: [(position.x - beginX) / rect.width, (position.y - beginY) / rect.height]
                    })
                } else if (data.type === 'ease-out') {
                    const keyframe = keyframes[keyframeIdx]
                    onModified(parentClip.id, paramName, keyframe.frameOnClip, {
                        easeOutParam: [(position.x - beginX) / rect.width, (position.y - beginY) / rect.height]
                    })
                }
            }
        }

        // Clear dragging state
        this.selectedKeyframeId = null
        this._keyframeDragged = false
        this.draggedEasingHandler = null
        this.setState({
            keyframeMovement: null,
            easingHandleMovement: null,
        })
    }

    private keydownOnKeyframeGraph = (e: React.KeyboardEvent<SVGElement>) =>
    {
        const { parentClip, onKeyframeRemove } = this.props
        const {activeKeyframeId} = this.state

        if ((e.key === 'Delete' || e.key === 'Backspace') && activeKeyframeId) {
            onKeyframeRemove(parentClip.id, activeKeyframeId)
            this.selectedKeyframeId = null
        }
    }

    private mouseDownOnEasingHandle = (e: React.MouseEvent<SVGCircleElement>) =>
    {
        const {dataset} = e.currentTarget as any

        this.draggedEasingHandler = {
            type: dataset.isEaseIn ? 'ease-in' : 'ease-out',
            keyframeId: dataset.keyframeId,
            element: e.currentTarget,
            container: (e.currentTarget.parentElement! as any) as SVGGElement,
            initialPosition: {x: e.screenX, y: e.screenY}
        }
    }

    private mouseDownOnKeyframe = (e: React.MouseEvent<SVGGElement>) =>
    {
        this.selectedKeyframeId = (e.currentTarget as any).dataset.keyframeId
        this._keyframeDragged = false
        this._initialKeyframePosition = {x: e.screenX, y: e.screenY}
    }

    private doubleClickOnKeyframe = ({currentTarget}: React.MouseEvent<SVGGElement>) =>
    {
        const {parentClip} = this.props
        if (!parentClip) return

        this.props.context.executeOperation(AppActions.seekPreviewFrame, {
            frame: parentClip.placedFrame + parseInt(currentTarget.dataset!.frame!, 10)
        })
    }

    private _renderNumberKeyframes(keyframes: Delir.Entity.Keyframe[])
    {
        const {keyframeMovement, easingHandleMovement} = this.state
        const points = this.buildKeyframePoints(keyframes)
        const NO_TRANSFORM = {x: 0, y: 0}
        const selectedEasingHandler = this.draggedEasingHandler

        return points.map((point, idx) => {
            const keyframeDragMovement = (keyframeMovement && point.keyframeId === this.selectedKeyframeId) ? keyframeMovement : NO_TRANSFORM
            const easingHandleDragMovement = (easingHandleMovement && point.keyframeId === this.draggedEasingHandler!.keyframeId) ? easingHandleMovement : NO_TRANSFORM
            const easeOutHandleDragMovement = (selectedEasingHandler && selectedEasingHandler!.type === 'ease-out') ? easingHandleDragMovement : NO_TRANSFORM
            const easeIntHandleDragMovement = (selectedEasingHandler && selectedEasingHandler!.type === 'ease-in') ? easingHandleDragMovement : NO_TRANSFORM

            return (
                <g key={point.keyframeId} data-index={idx}>
                    {point.transitionPath && (
                        <path
                            stroke='#fff'
                            fill='none'
                            strokeWidth='1'
                            d={`
                                M ${point.transitionPath.begin.x} ${point.transitionPath.begin.y}
                                C ${point.transitionPath.begin.handleX + easeOutHandleDragMovement.x} ${point.transitionPath.begin.handleY + easeOutHandleDragMovement.y}
                                  ${point.transitionPath.end.handleX + easeIntHandleDragMovement.x} ${point.transitionPath.end.handleY + easeIntHandleDragMovement.y}
                                  ${point.transitionPath.end.x} ${point.transitionPath.end.y}
                            `}
                            data-begin-x={point.transitionPath.begin.x}
                            data-begin-y={point.transitionPath.begin.y}
                            data-end-x={point.transitionPath.end.x}
                            data-end-y={point.transitionPath.end.y}
                            data-transition-path
                        />
                    )}
                    {point.easeOutLine && (
                        <path
                            className={s.keyframeLineToHandle}
                            strokeWidth='1'
                            d={`
                                M ${point.easeOutLine.x} ${point.easeOutLine.y}
                                L ${point.easeOutLine.endX + easeOutHandleDragMovement.x} ${point.easeOutLine.endY + easeOutHandleDragMovement.y}
                            `}
                            data-ease-out-handle-path
                        />
                    )}
                    {point.nextEaseInLine && (
                        <path
                            className={s.keyframeLineToHandle}
                            strokeWidth='1'
                            d={`
                                M ${point.nextEaseInLine.x} ${point.nextEaseInLine.y}
                                L ${point.nextEaseInLine.endX + easeIntHandleDragMovement.x} ${point.nextEaseInLine.endY + easeIntHandleDragMovement.y}
                            `}
                            data-ease-in-handle-path
                        />
                    )}
                    <g
                        transform={`translate(${point.point.x + keyframeDragMovement.x - 4} ${point.point.y - 4})`}
                        onDoubleClick={this.doubleClickOnKeyframe}
                        onMouseDown={this.mouseDownOnKeyframe}
                        onMouseUp={this.mouseUpOnSvg}
                        data-keyframe-id={point.keyframeId}
                        data-frame={point.frame}
                    >
                        <rect className={classnames(s.keyframeInner, {
                            [s['keyframeInner--selected']]: point.keyframeId === this.state.activeKeyframeId
                        })} width='8' height='8'  />
                    </g>
                    {point.nextEaseInHandle && (
                        <circle
                            cx={point.nextEaseInHandle.x + easeIntHandleDragMovement.x}
                            cy={point.nextEaseInHandle.y + easeIntHandleDragMovement.y}
                            fill='#7100bf'
                            r='4'
                            onMouseDown={this.mouseDownOnEasingHandle}
                            onMouseUp={this.mouseUpOnSvg}
                            data-keyframe-id={point.keyframeId}
                            data-is-ease-in
                        />
                    )}
                    {point.easeOutHandle && (
                        <circle
                            cx={point.easeOutHandle.x + easeOutHandleDragMovement.x}
                            cy={point.easeOutHandle.y + easeOutHandleDragMovement.y}
                            fill='#7100bf'
                            r='4'
                            onMouseDown={this.mouseDownOnEasingHandle}
                            onMouseUp={this.mouseUpOnSvg}
                            data-keyframe-id={point.keyframeId}
                            data-is-ease-out
                        />
                    )}
                </g>
            )
        }).reverse()
    }

    private _renderColorKeyframes(keyframes: Delir.Entity.Keyframe[])
    {
        const { parentClip, height: graphHeight } = this.props
        const {scrollLeft} = this.props
        const halfHeight = graphHeight / 2

        if (!parentClip) return []

        const clipPlacedPositionX = this.frameToPx(parentClip.placedFrame) - scrollLeft
        const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)

        return orderedKeyframes.map((kf, idx) => {
            const x = clipPlacedPositionX + this.frameToPx(kf.frameOnClip)
            const nextX = orderedKeyframes[idx + 1] ? clipPlacedPositionX + this.frameToPx(orderedKeyframes[idx + 1].frameOnClip) : null
            const transform = (this.state.keyframeMovement && kf.id === this.selectedKeyframeId) ? this.state.keyframeMovement : {x: 0}

            return (
                <g ref={kf.id}>
                    {nextX != null && (
                        <path
                            stroke='#fff'
                            fill='none'
                            strokeWidth='1'
                            d={`M ${x + 4} ${halfHeight + 4} L ${nextX - 4} ${halfHeight + 4}`}
                        />
                    )}
                    <g
                        className={classnames(s.keyframe, s['keyframe--color'])}
                        transform={`translate(${x + transform.x - 4} ${halfHeight})`}
                        onDoubleClick={this.doubleClickOnKeyframe}
                        onMouseDown={this.mouseDownOnKeyframe}
                        onMouseUp={this.mouseUpOnSvg}
                        data-keyframe-id={kf.id}
                        data-frame={kf.frameOnClip}
                    >
                        <rect
                            className={classnames(s.keyframeInner, {
                                [s['keyframeInner--selected']]: kf.id === this.state.activeKeyframeId
                            })}
                            width='8'
                            height='8'
                            stroke='#fff'
                            strokeWidth='1'
                            style={{fill: (kf.value as Delir.Values.ColorRGBA).toString()}}
                        />
                    </g>
                </g>
            )
        })
    }

    private _renderStringKeyframes(keyframes: Delir.Entity.Keyframe[])
    {
        const {parentClip, scrollLeft, height} = this.props
        const halfHeight = height / 2

        if (!parentClip) return []
        const clipPlacedPositionX = this.frameToPx(parentClip.placedFrame) - scrollLeft
        const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)

        return orderedKeyframes.map((kf, idx) => {
            const x = clipPlacedPositionX + this.frameToPx(kf.frameOnClip)
            const nextX = orderedKeyframes[idx + 1] ? clipPlacedPositionX + this.frameToPx(orderedKeyframes[idx + 1].frameOnClip) : null
            const transform = (this.state.keyframeMovement && kf.id === this.selectedKeyframeId) ? this.state.keyframeMovement : {x: 0}

            return (
                <g ref={kf.id}>
                    {nextX != null && (
                        <path
                            stroke='#fff'
                            fill='none'
                            strokeWidth='1'
                            d={`M ${x + 4} ${halfHeight + 4} L ${nextX - 4} ${halfHeight + 4}`}
                        />
                    )}
                    <g
                        transform={`translate(${x + transform.x - 4} ${halfHeight})`}
                        onDoubleClick={this.doubleClickOnKeyframe}
                        onMouseDown={this.mouseDownOnKeyframe}
                        onMouseUp={this.mouseUpOnSvg}
                        data-keyframe-id={kf.id}
                        data-frame={kf.frameOnClip}
                    >
                        <rect
                            className={classnames(s.keyframeInner, {
                                [s['keyframeInner--selected']]: kf.id === this.state.activeKeyframeId
                            })}
                            width='8'
                            height='8'
                            fill='#fff'
                        />
                    </g>
                </g>
            )
        })
    }

    private frameToPx(frame: number): number
    {
        const {pxPerSec, zoomScale, composition} = this.props

        return TimePixelConversion.framesToPixel({
            pxPerSec,
            framerate: composition!.framerate,
            durationFrames: frame,
            scale: zoomScale,
        })
    }

    private pxToFrame(x: number): number
    {
        // const {props: {pxPerSec, scale, editor: {activeComp}}} = this
        const {pxPerSec, zoomScale, composition} = this.props

        return TimePixelConversion.pixelToFrames({
            framerate: composition!.framerate,
            pixel: x,
            pxPerSec,
            scale: zoomScale,
        })
    }

    /**
     * Calculate keyframe place points
     */
    private buildKeyframePoints = (keyframes: Delir.Entity.Keyframe[]): {
        keyframeId: string,
        frame: number,
        point: {x: number, y: number},
        transitionPath: {
            begin: {x: number, y: number, handleX: number, handleY: number },
            end: { x: number, y: number, handleX: number, handleY: number }
        } | null,
        easeOutLine: {x: number, y: number, endX: number, endY: number} | null,
        nextEaseInLine: {x: number, y: number, endX: number, endY: number} | null,
        easeOutHandle: {x: number, y: number} | null,
        nextEaseInHandle: {x: number, y: number} | null,
    }[] =>
    {
        const {parentClip, descriptor, height, scrollLeft} = this.props

        if (!descriptor || descriptor.animatable === false) return []

        const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)
        const clipPlacedPositionX = this.frameToPx(parentClip.placedFrame)

        if (descriptor.type === 'NUMBER' || descriptor.type === 'FLOAT') {
            const maxValue = orderedKeyframes.reduce((memo, kf, idx, list) => {
                return Math.max(memo, kf.value as number) // , prevValue, nextValue)
            }, -Infinity) + 10

            const minValue = orderedKeyframes.reduce((memo, kf, idx, list) => {
                return Math.min(memo, kf.value as number) // , prevValue, nextValue)
            }, +Infinity) + -10

            const absMinValue = Math.abs(minValue)
            const minMaxRange = maxValue - minValue

            // Calc keyframe and handle points
            return orderedKeyframes.map((keyframe, idx) => {
                const nextKeyframe: Delir.Entity.Keyframe | undefined = orderedKeyframes[idx + 1]

                let nextX = 0
                let nextY = 0
                let easeOutHandleX = 0
                let easeOutHandleY = 0
                let nextKeyframeEaseInX = 0
                let nextKeyframeEaseInY = 0

                const beginX = clipPlacedPositionX + this.frameToPx(keyframe.frameOnClip) - scrollLeft
                const beginY = height - height * (((keyframe.value as number) - minValue) / minMaxRange)

                if (nextKeyframe) {
                    // Next keyframe position
                    nextX = clipPlacedPositionX + this.frameToPx(nextKeyframe.frameOnClip) - scrollLeft
                    nextY = height - height * (((nextKeyframe.value as number) - minValue) / minMaxRange)

                    // Handle of control transition to next keyframe
                    easeOutHandleX = ((nextX - beginX) * keyframe.easeOutParam[0]) + beginX
                    easeOutHandleY = ((nextY - beginY) * keyframe.easeOutParam[1]) + beginY // ((endPointY - beginY) * nextKeyframe.easeOutParam[1]) + beginY

                    nextKeyframeEaseInX = ((nextX - beginX) * nextKeyframe.easeInParam[0]) + beginX
                    nextKeyframeEaseInY = ((nextY - beginY) * nextKeyframe.easeInParam[1]) + beginY
                }

                return {
                    keyframeId: keyframe.id,
                    frame: keyframe.frameOnClip,
                    point: {x: beginX, y: beginY},
                    transitionPath: nextKeyframe ? {
                        begin: { x: beginX, y: beginY, handleX: easeOutHandleX, handleY: easeOutHandleY },
                        end: { x: nextX, y: nextY, handleX: nextKeyframeEaseInX, handleY: nextKeyframeEaseInY },
                    } : null,
                    easeOutLine: nextKeyframe ? {x: beginX, y: beginY, endX: easeOutHandleX, endY: easeOutHandleY} : null,
                    nextEaseInLine: nextKeyframe ? {x: nextX, y: nextY, endX: nextKeyframeEaseInX, endY: nextKeyframeEaseInY} : null,
                    easeOutHandle: nextKeyframe ? {x: easeOutHandleX, y: easeOutHandleY} : null,
                    nextEaseInHandle: nextKeyframe ? {x: nextKeyframeEaseInX, y: nextKeyframeEaseInY} : null,
                }
            })
        }

        return []
    }
})
