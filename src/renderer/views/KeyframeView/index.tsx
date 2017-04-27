import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'
import TimelineHelper from '../../helpers/timeline-helper'

import Workspace from '../components/workspace'
import Pane from '../components/pane'
import SelectList from '../components/select-list'
import DelirValueInput from './_DelirValueInput'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import {default as ProjectModifyStore, ProjectModifyState} from '../../stores/project-modify-store'
import RendererService from '../../services/renderer'

import * as s from './style.styl'

interface KeyframeViewProps {
    activeComposition: Delir.Project.Composition|null
    activeClip: Delir.Project.Clip|null
    editor: EditorState
    project: ProjectModifyState
    scrollLeft: number
    scale: number
    pxPerSec: number
}

interface KeyframeViewState {
    activePropName: string|null
    graphWidth: number
    graphHeight: number
    keyframeViewViewBox: string|undefined
    activeKeyframeId: string|null
    keyframeMovement: {x: number}|null
    easingHandleMovement: {x: number, y: number}|null
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
    project: ProjectModifyStore.getState()
}))
export default class KeyframeView extends React.Component<KeyframeViewProps, KeyframeViewState> {
    static propTypes = {
        activeClip: PropTypes.instanceOf(Delir.Project.Clip),
        scrollLeft: PropTypes.number,
    }

    protected static defaultProps: Partial<KeyframeViewProps> = {
        scrollLeft: 0
    }

    protected state: KeyframeViewState = {
        activePropName: null,
        graphWidth: 0,
        graphHeight: 0,
        keyframeViewViewBox: undefined,
        activeKeyframeId: null,
        keyframeMovement: null,
        easingHandleMovement: null
    }

    protected refs: {
        svgParent: HTMLDivElement
    }

    private _selectedKeyframeId: string|null = null
    private _initialKeyframePosition: {x: number, y: number}|null = null
    private _keyframeDragged: boolean = false

    private _selectedEasingHandleHolderData: {
        type: 'ease-in'|'ease-out',
        keyframeId: string,
        element: SVGCircleElement,
        container: SVGGElement,
        initialPosition: {x: number, y: number},
    }|null = null

    protected componentDidMount()
    {
        const box = this.refs.svgParent.getBoundingClientRect()
        this.setState({
            graphWidth: box.width,
            graphHeight: box.height,
            keyframeViewViewBox: `0 0 ${box.width} ${box.height}`,
        })
    }

    private castValue = (desc: Delir.AnyParameterTypeDescriptor, value: string|number) =>
    {
        return value
    }

    // shouldComponentUpdate()
    // {
    //     return this.props.editor.previewPlayed ? false : true
    // }

    private selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const propName: string = currentTarget.dataset.propName!
        this.setState({activePropName: propName})
    }

    private keyframeDoubleClicked = ({currentTarget}: React.MouseEvent<SVGGElement>) =>
    {
        const {activeClip} = this.props
        if (!activeClip) return

        EditorStateActions.seekPreviewFrame(activeClip.placedFrame + (currentTarget.dataset.frame | 0))
    }

    private valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame
        ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, desc.propName, frameOnClip, {value})
        EditorStateActions.seekPreviewFrame(this.props.editor.currentPreviewFrame)
    }

    private onKeydownOnKeyframeGraph = (e: React.KeyboardEvent<HTMLDivElement>) =>
    {
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.state.activeKeyframeId) {
            ProjectModifyActions.removeKeyframe(this.state.activeKeyframeId)
            this._selectedKeyframeId = null
        }
    }

    private mouseDownOnKeyframe = (e: React.MouseEvent<SVGGElement>) =>
    {
        this._selectedKeyframeId = e.currentTarget.dataset.keyframeId
        this._keyframeDragged = false
        this._initialKeyframePosition = {x: e.screenX, y: e.screenY}
    }

    private mouseDonwOnEasingHandle = (e: React.MouseEvent<SVGCircleElement>) =>
    {
        const {dataset} = e.currentTarget
        this._selectedEasingHandleHolderData = {
            type: dataset.isEaseIn ? 'ease-in' : 'ease-out',
            keyframeId: dataset.keyframeId,
            element: e.currentTarget,
            container: (e.currentTarget.parentElement! as any) as SVGGElement,
            initialPosition: {x: e.screenX, y: e.screenY}
        }
    }

    private onMouseMoveOnSvg = (e: React.MouseEvent<SVGElement>) =>
    {
        if (this._selectedKeyframeId) {
            this._keyframeDragged = true

            this.setState({
                keyframeMovement: {
                    x: e.screenX - this._initialKeyframePosition!.x,
                }
            })
        } else if (this._selectedEasingHandleHolderData) {
            this.setState({
                easingHandleMovement: {
                    x: e.screenX - this._selectedEasingHandleHolderData.initialPosition!.x,
                    y: e.screenY - this._selectedEasingHandleHolderData.initialPosition!.y,
                },
            })
        }
    }

    private mouseUpOnSvg = (e: React.MouseEvent<SVGElement>) =>
    {
        e.preventDefault()
        e.stopPropagation()

        const {props: {activeClip}, state: {activePropName, keyframeMovement, easingHandleMovement}} = this
        if (!activeClip || !activePropName) return

        console.log('up')

        process: {
            if (this._selectedKeyframeId) {
                // Process for keyframe dragged
                if (!this._keyframeDragged) {
                    this.setState({activeKeyframeId: this._selectedKeyframeId, keyframeMovement: null})
                    break process
                }

                if (!keyframeMovement) break process

                const keyframe = activeClip.keyframes[activePropName].find(kf => kf.id === this._selectedKeyframeId)!
                const movedFrame = this._pxToFrame(keyframeMovement.x)

                ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, activePropName, keyframe.frameOnClip, {
                    frameOnClip: keyframe.frameOnClip + movedFrame
                })

            } else if (this._selectedEasingHandleHolderData) {
                // Process for easing handle dragged

                const data = this._selectedEasingHandleHolderData
                const transitionPath = this._selectedEasingHandleHolderData.container.querySelector('[data-transition-path]')

                const keyframes = activeClip.keyframes[activePropName].slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)
                const keyframeIdx = keyframes.findIndex(kf => kf.id === this._selectedEasingHandleHolderData!.keyframeId)!
                if (keyframeIdx === -1) break process

                const {beginX, beginY, endX, endY} = _.mapValues<string, number>(transitionPath.dataset, val => parseFloat(val))
                const rect = {width: endX - beginX, height: endY - beginY}
                const position = {x: data.element.cx.baseVal.value, y: data.element.cy.baseVal.value}

                if (data.type === 'ease-in') {
                    ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, activePropName, keyframes[keyframeIdx + 1].frameOnClip, {
                        easeInParam: [(position.x - beginX) / rect.width, (position.y - beginY) / rect.height]
                    })
                } else if (data.type === 'ease-out') {
                    ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, activePropName, keyframes[keyframeIdx].frameOnClip, {
                        easeOutParam: [(position.x - beginX) / rect.width, (position.y - beginY) / rect.height]
                    })
                }
            }
        }

        // Clear dragging state
        this._selectedKeyframeId = null
        this._keyframeDragged = false
        this._selectedEasingHandleHolderData = null
        this.setState({
            keyframeMovement: null,
            easingHandleMovement: null,
        })
    }

    public render()
    {
        const {activeClip, project: {project}, editor, scrollLeft} = this.props
        const {activePropName, keyframeViewViewBox, graphWidth, graphHeight} = this.state
        const activePropDescriptor = this._getDescriptorByPropName(activePropName)
        const descriptors = activeClip
            ? RendererService.pluginRegistry!.getParametersById(activeClip.renderer) || []
            : []

        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.propList}>
                    <SelectList>
                        {descriptors.map(desc => {
                            const value = activeClip
                                ? Delir.KeyframeHelper.calcKeyframeValueAt(editor.currentPreviewFrame, desc, activeClip.keyframes[desc.propName] || [])
                                : undefined

                            const hasKeyframe = desc.animatable && (activeClip.keyframes[desc.propName] || []).length !== 0

                            return (
                                <div
                                    key={activeClip!.id + desc.propName}
                                    className={s.propItem}
                                    data-prop-name={desc.propName}
                                    onClick={this.selectProperty}
                                >
                                    <span className={classnames(
                                            s.propKeyframeIndicator,
                                            {
                                                [s['propKeyframeIndicator--hasKeyframe']]: hasKeyframe,
                                                [s['propKeyframeIndicator--nonAnimatable']]: !desc.animatable,
                                            })
                                        }
                                    >
                                        {desc.animatable && (<i className='twa twa-clock12'></i>)}
                                    </span>
                                    <span className={s.propItemName}>{desc.label}</span>
                                    <div className={s.propItemInput}>
                                        <DelirValueInput key={desc.propName} assets={project ? project.assets : null} descriptor={desc} value={value} onChange={this.valueChanged} />
                                    </div>
                                </div>
                            )
                        })}
                    </SelectList>
                </Pane>
                <Pane>
                    <div ref='svgParent' className={s.keyframeContainer} tabIndex={-1} onKeyDown={this.onKeydownOnKeyframeGraph}>
                        <div className={s.measureContainer}>
                            <div ref='mesures' className={s.measureLayer} style={{transform: `translateX(-${scrollLeft}px)`}}>
                                {...this._renderMeasure()}
                            </div>
                        </div>
                        <svg
                            className={s.keyframeGraph}
                            viewBox={keyframeViewViewBox}
                            width={graphWidth}
                            height={graphHeight}
                            onMouseMove={this.onMouseMoveOnSvg}
                            onMouseUp={this.mouseUpOnSvg}
                        >
                            {...((activePropDescriptor && activePropDescriptor.animatable) ? this.renderKeyframes() : [])}
                        </svg>
                    </div>
                </Pane>
            </Workspace>
        )
    }

    private renderKeyframes()
    {
        const {props: {activeClip}, state: {activePropName}} = this
        const descriptor = this._getDescriptorByPropName(activePropName)

        if (!activeClip || !activePropName || !activeClip!.keyframes[activePropName] || !descriptor) return []

        switch (descriptor.type) {
            case 'COLOR_RGB':
            case 'COLOR_RGBA':
                return this._renderColorKeyframes(activeClip!.keyframes[activePropName])

            case 'NUMBER':
                return this._renderNumberKeyframes(activeClip!.keyframes[activePropName])

            case 'STRING':
                return this._renderStringKeyframes(activeClip!.keyframes[activePropName])
        }
    }

    private _renderNumberKeyframes(keyframes: Delir.Project.Keyframe[])
    {
        const {state: {keyframeMovement, easingHandleMovement}} = this
        const points = this._buildKeyframePoints(keyframes)
        const NO_TRANSFORM = {x: 0, y: 0}
        const easingHandleHolderData = this._selectedEasingHandleHolderData

        return points.map((p, idx) => {
            const transform = (keyframeMovement && p.id === this._selectedKeyframeId) ? keyframeMovement : NO_TRANSFORM
            const easingHandleTransform = (easingHandleMovement && p.id === this._selectedEasingHandleHolderData!.keyframeId) ? easingHandleMovement : NO_TRANSFORM
            const easeOutHandleTransform = (easingHandleHolderData && easingHandleHolderData!.type === 'ease-out') ? easingHandleTransform : NO_TRANSFORM
            const easeInHandleTransform = (easingHandleHolderData && easingHandleHolderData!.type === 'ease-in') ? easingHandleTransform : NO_TRANSFORM

            return (
                <g key={p.id} data-index={idx}>
                    {p.transition && (
                        <path
                            stroke='#fff'
                            fill='none'
                            strokeWidth='1'
                            d={`
                                M ${p.transition.x} ${p.transition.y}
                                C ${p.transition.xh + easeOutHandleTransform.x} ${p.transition.yh + easeOutHandleTransform.y}
                                  ${p.transition.xxh + easeInHandleTransform.x} ${p.transition.yyh + easeInHandleTransform.y}
                                  ${p.transition.xx} ${p.transition.yy}
                            `}
                            data-begin-x={p.transition.x}
                            data-begin-y={p.transition.y}
                            data-end-x={p.transition.xx}
                            data-end-y={p.transition.yy}
                            data-transition-path
                        />
                    )}
                    {p.easeOutLine && (
                        <path
                            className={s.keyframeLineToHandle}
                            strokeWidth='1'
                            d={`
                                M ${p.easeOutLine.x} ${p.easeOutLine.y}
                                L ${p.easeOutLine.xx + easeOutHandleTransform.x} ${p.easeOutLine.yy + easeOutHandleTransform.y}
                            `}
                            data-ease-out-handle-path
                        />
                    )}
                    {p.nextEaseInLine && (
                        <path
                            className={s.keyframeLineToHandle}
                            strokeWidth='1'
                            d={`
                                M ${p.nextEaseInLine.x} ${p.nextEaseInLine.y}
                                L ${p.nextEaseInLine.xx + easeInHandleTransform.x} ${p.nextEaseInLine.yy + easeInHandleTransform.y}
                            `}
                            data-ease-in-handle-path
                        />
                    )}
                    <g
                        className={s.keyframe}
                        transform={`translate(${p.point.x + transform.x - 4} ${p.point.y - 4})`}
                        onDoubleClick={this.keyframeDoubleClicked}
                        onMouseDown={this.mouseDownOnKeyframe}
                        onMouseUp={this.mouseUpOnSvg}
                        data-keyframe-id={p.id}
                        data-frame={p.frame}
                    >
                        <rect className={classnames(s.keyframeInner, {
                            [s['keyframeInner--selected']]: p.id === this.state.activeKeyframeId
                        })} width='8' height='8'  />
                    </g>
                    {p.nextEaseInHandle && (
                        <circle
                            cx={p.nextEaseInHandle.x + easeInHandleTransform.x}
                            cy={p.nextEaseInHandle.y + easeInHandleTransform.y}
                            fill='#7100bf'
                            r='4'
                            onMouseDown={this.mouseDonwOnEasingHandle}
                            onMouseUp={this.mouseUpOnSvg}
                            data-keyframe-id={p.id}
                            data-is-ease-in
                        />
                    )}
                    {p.easeOutHandle && (
                        <circle
                            cx={p.easeOutHandle.x + easeOutHandleTransform.x}
                            cy={p.easeOutHandle.y + easeOutHandleTransform.y}
                            fill='#7100bf'
                            r='4'
                            onMouseDown={this.mouseDonwOnEasingHandle}
                            onMouseUp={this.mouseUpOnSvg}
                            data-keyframe-id={p.id}
                            data-is-ease-out
                        />
                    )}
                </g>
            )
        }).reverse()
    }

    private _renderColorKeyframes(keyframes: Delir.Project.Keyframe[])
    {
        const {props:{activeClip, scrollLeft}, state: {graphHeight}} = this
        const halfHeight = graphHeight / 2

        if (!activeClip) return []

        const clipPlacedPositionX = this._frameToPx(activeClip.placedFrame) - scrollLeft

        return keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip).map((kf, idx) => {
            const x = clipPlacedPositionX + this._frameToPx(kf.frameOnClip)
            const nextX = keyframes[idx + 1] ? clipPlacedPositionX + this._frameToPx(keyframes[idx + 1].frameOnClip) : null
            const transform = (this.state.keyframeMovement && kf.id === this._selectedKeyframeId) ? this.state.keyframeMovement : {x: 0}

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
                        onDoubleClick={this.keyframeDoubleClicked}
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
                            style={{fill: (kf.value as Delir.ColorRGBA).toString()}}
                        />
                    </g>
                </g>
            )
        })
    }

    private _renderStringKeyframes(keyframes: Delir.Project.Keyframe[])
    {
        const {props: {activeClip, scrollLeft}, state: {graphHeight}} = this
        const halfHeight = graphHeight / 2

        if (!activeClip) return []
        const clipPlacedPositionX = this._frameToPx(activeClip.placedFrame) - scrollLeft

        return keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip).map((kf, idx) => {
            const x = clipPlacedPositionX + this._frameToPx(kf.frameOnClip)
            const nextX = keyframes[idx + 1] ? clipPlacedPositionX + this._frameToPx(keyframes[idx + 1].frameOnClip) : null
            const transform = (this.state.keyframeMovement && kf.id === this._selectedKeyframeId) ? this.state.keyframeMovement : {x: 0}

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
                        className={s.keyframe}
                        transform={`translate(${x + transform.x - 4} ${halfHeight})`}
                        onDoubleClick={this.keyframeDoubleClicked}
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
                            fill="#fff"
                        />
                    </g>
                </g>
            )
        })
    }

    private _frameToPx(frame: number): number
    {
        const {props: {pxPerSec, scale, editor: {activeComp}}} = this

        return TimelineHelper.framesToPixel({
            pxPerSec: pxPerSec,
            framerate: activeComp!.framerate,
            durationFrames: frame,
            scale,
        })
    }

    private _pxToFrame(x: number): number
    {
        const {props: {pxPerSec, scale, editor: {activeComp}}} = this

        return TimelineHelper.pixelToFrames({
            framerate: activeComp!.framerate,
            pixel: x,
            pxPerSec,
            scale,
        })
    }

    private _buildKeyframePoints = (keyframes: Delir.Project.Keyframe[]): {
        id: string,
        frame: number,
        point: {x: number, y: number},
        hasNextKeyframe: boolean,
        transition: {x: number, y: number, xh: number, yh: number, xxh: number, yyh: number, xx: number, yy: number}|null,
        easeOutLine: {x: number, y: number, xx: number, yy: number}|null,
        nextEaseInLine: {x: number, y: number, xx: number, yy: number}|null,
        easeOutHandle: {x: number, y: number}|null,
        nextEaseInHandle: {x: number, y: number}|null,
    }[] =>
    {
        const {props: {pxPerSec, activeClip, scrollLeft}, state: {activePropName, graphWidth, graphHeight}} = this
        const framerate = this.props.editor!.activeComp!.framerate

        if (!activePropName || !activeClip) return []

        const descriptor = this._getDescriptorByPropName(activePropName)

        if (!descriptor || descriptor.animatable === false) return []

        const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)
        const clipPlacedPositionX = this._frameToPx(activeClip.placedFrame)

        if (descriptor.type === 'NUMBER' || descriptor.type === 'FLOAT') {
            const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value as number), 0) + 10
            const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value as number), 0) + -10
            const absMinValue = Math.abs(minValue)
            const minMaxRange = maxValue - minValue

            // Calc keyframe and handle points
            return orderedKeyframes.map((keyframe, idx) => {
                const previousKeyframe: Delir.Project.Keyframe|undefined = orderedKeyframes[idx - 1]
                const nextKeyframe: Delir.Project.Keyframe|undefined = orderedKeyframes[idx + 1]

                // let previousX = 0
                // let previousY = 0
                let nextX = 0
                let nextY = 0
                let handleEoX = 0
                let handleEoY = 0
                // let handleEiX = 0
                // let handleEiY = 0
                let nextKeyframeEiX = 0
                let nextKeyframeEiY = 0

                const beginX = clipPlacedPositionX + this._frameToPx(keyframe.frameOnClip) - scrollLeft
                const beginY = graphHeight - graphHeight * ((keyframe.value + absMinValue) / minMaxRange)

                if (nextKeyframe) {
                    // Next keyframe position
                    nextX = clipPlacedPositionX + this._frameToPx(nextKeyframe.frameOnClip) - scrollLeft
                    nextY = graphHeight - graphHeight * ((nextKeyframe.value + absMinValue) / minMaxRange)

                    // Handle of control transition to next keyframe
                    handleEoX = ((nextX - beginX) * keyframe.easeOutParam[0]) + beginX
                    handleEoY = ((nextY - beginY) * keyframe.easeOutParam[1]) + beginY // ((endPointY - beginY) * nextKeyframe.easeOutParam[1]) + beginY

                    nextKeyframeEiX = ((nextX - beginX) * nextKeyframe.easeInParam[0]) + beginX
                    nextKeyframeEiY = ((nextY - beginY) * nextKeyframe.easeInParam[1]) + beginY
                }

                return {
                    id: keyframe.id,
                    frame: keyframe.frameOnClip,
                    point: {x: beginX, y: beginY},
                    hasNextKeyframe: !!nextKeyframe,
                    transition: nextKeyframe ? {x: beginX, y: beginY, xh: handleEoX, yh: handleEoY, xxh: nextKeyframeEiX, yyh: nextKeyframeEiY, xx: nextX, yy: nextY} : null,
                    easeOutLine: nextKeyframe ? {x: beginX, y: beginY, xx: handleEoX, yy: handleEoY} : null,
                    nextEaseInLine: nextKeyframe ? {x: nextX, y: nextY, xx: nextKeyframeEiX, yy: nextKeyframeEiY} : null,
                    easeOutHandle: nextKeyframe ? {x: handleEoX, y: handleEoY} : null,
                    nextEaseInHandle: nextKeyframe ? {x: nextKeyframeEiX, y: nextKeyframeEiY} : null,
                }
            })
        }

        return []
    }

    private _getDescriptorByPropName(propName: string|null)
    {
        const {activeClip} = this.props
        const descriptors = activeClip
            ? RendererService.pluginRegistry!.getParametersById(activeClip.renderer) || []
            : []

        return descriptors.find(desc => desc.propName === propName) || null
    }

    private _renderMeasure(): JSX.Element[]
    {
        const {activeComposition} = this.props
        if (! activeComposition) return []

        let created = 0
        let frame = -1
        let previousPos = -40
        const components: JSX.Element[] = []
        while (true) {
            frame++

            if (components.length >= 300) {
                break
            }

            if (frame >= activeComposition.durationFrames) {
                // Hit last frame marker
                const pos = TimelineHelper.framesToPixel({
                    pxPerSec: this.props.pxPerSec,
                    framerate: this.props.activeComposition!.framerate,
                    scale: this.props.scale,
                    durationFrames: activeComposition.durationFrames
                })

                components.push(
                    <div
                        key={created++}
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

            if (pos - previousPos >= 20/* px */) {
                previousPos = pos
                components.push(
                    <div
                        key={created++}
                        className={classnames(s.measureLine, {
                            [s['--grid']]: frame % 10 === 0,
                        })}
                        style={{left: pos}}
                    >
                        {frame}
                    </div>
                )
            }
        }

        return components
    }
}
