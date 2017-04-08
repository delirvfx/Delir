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
    activeClip: Delir.Project.Clip|null
    editor: EditorState
    project: ProjectModifyState
    pxPerSec: number
}

interface KeyframeViewState {
    activePropName: string|null
    graphWidth: number
    graphHeight: number
    keyframeViewViewBox: string|undefined
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
    project: ProjectModifyStore.getState()
}))
export default class KeyframeView extends React.Component<KeyframeViewProps, KeyframeViewState> {
    static propTypes = {
        activeClip: PropTypes.instanceOf(Delir.Project.Clip),
    }

    state: KeyframeViewState = {
        activePropName: null,
        graphWidth: 0,
        graphHeight: 0,
        keyframeViewViewBox: undefined,
    }

    refs: {
        svgParent: HTMLDivElement
    }

    componentDidMount()
    {
        const box = this.refs.svgParent.getBoundingClientRect()
        this.setState({
            graphWidth: box.width,
            graphHeight: box.height,
            keyframeViewViewBox: `0 0 ${box.width} ${box.height}`,
        })
    }

    castValue = (desc: Delir.AnyParameterTypeDescriptor, value: string|number) =>
    {
        return value
    }

    // shouldComponentUpdate()
    // {
    //     return this.props.editor.previewPlayed ? false : true
    // }

    selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const propName: string = currentTarget.dataset.propName!
        this.setState({activePropName: propName})
    }

    keyframeDoubleClicked = ({currentTarget}: React.MouseEvent<SVGGElement>) =>
    {
        EditorStateActions.seekPreviewFrame(currentTarget.dataset.frame | 0)
    }

    valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, desc.propName, currentPreviewFrame, {value})
        EditorStateActions.seekPreviewFrame(this.props.editor.currentPreviewFrame)
    }

    render()
    {
        const {activeClip, project: {project}, editor} = this.props
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
                    <div ref='svgParent' className={s.keyframeContainer}>
                        <svg className={s.keyframeGraph} viewBox={keyframeViewViewBox} width={graphWidth} height={graphHeight}>
                            {...((activePropDescriptor && activePropDescriptor.animatable) ? this.renderKeyframes() : [])}
                        </svg>
                    </div>
                </Pane>
            </Workspace>
        )
    }

    renderKeyframes()
    {
        const {props: {activeClip}, state: {activePropName}} = this
        const descriptor = this._getDescriptorByPropName(activePropName)

        if (!activePropName || !activeClip!.keyframes[activePropName] || !descriptor) return []

        switch (descriptor.type) {
            case 'NUMBER':
                return this._renderNumberKeyframes(activeClip!.keyframes[activePropName])

            case 'STRING':
                return this._renderStringKeyframes(activeClip!.keyframes[activePropName])
        }
    }

    private _renderNumberKeyframes(keyframes: Delir.Project.Keyframe[])
    {
        const points = this._buildKeyframePoints(keyframes)

        return points.map((p, idx) => (
            <g key={p.id} data-index={idx}>
                {p.transition && (
                    <path
                        stroke='#fff'
                        fill='none'
                        strokeWidth='1'
                        d={`M ${p.transition.x} ${p.transition.y} C ${p.transition.xh} ${p.transition.yh} ${p.transition.xxh} ${p.transition.yyh} ${p.transition.xx} ${p.transition.yy}`}
                        data-transition-path
                    />
                )}
                {false && p.easeOutLine && (
                    <path
                        className={s.keyframeLineToHandle}
                        strokeWidth='1'
                        d={`M ${p.easeOutLine.x} ${p.easeOutLine.y} L ${p.easeOutLine.xx} ${p.easeOutLine.yy}`}
                        data-ease-in-handle-path
                    />
                )}
                {false && p.easeInLine && (
                    <path
                        className={s.keyframeLineToHandle}
                        strokeWidth='1'
                        d={`M ${p.easeInLine.x} ${p.easeInLine.y} L ${p.easeInLine.xx} ${p.easeInLine.yy}`}
                        data-ease-in-handle-path
                    />
                )}
                <g
                    className={s.keyframe}
                    transform={`translate(${p.point.x - 4} ${p.point.y - 4})`}
                    onDoubleClick={this.keyframeDoubleClicked}
                    data-frame={p.frame}
                >
                    <rect className={s.keyframeInner} width='8' height='8' fill="#fff"  />
                </g>
                {false && p.easeInHandle && (
                    <circle
                        cx={p.easeInHandle.x}
                        cy={p.easeInHandle.y}
                        fill='#7100bf'
                        r='4'
                        data-ease-in-handle
                    />
                )}
                {false && p.easeOutHandle && (
                    <circle
                        cx={p.easeOutHandle.x}
                        cy={p.easeOutHandle.y}
                        fill='#7100bf'
                        r='4'
                        data-ease-out-handle
                    />
                )}
            </g>
        ))
    }

    private _renderStringKeyframes(keyframes: Delir.Project.Keyframe[])
    {
        const {state: {graphHeight}} = this
        const halfHeight = graphHeight / 2

        return keyframes.map(kf => {
            const x = this._frameToPx(kf.frameOnClip)

            return (
                <g
                    className={s.keyframe}
                    transform={`translate(${x - 4} ${halfHeight})`}
                    onDoubleClick={this.keyframeDoubleClicked}
                    data-frame={kf.frameOnClip}
                >
                    <rect className={s.keyframeInner} width='8' height='8' fill="#fff"  />
                </g>
            )
        })
    }

    private _frameToPx(frame: number): number
    {
        const {props: {pxPerSec, editor: {activeComp}}} = this

        return TimelineHelper.framesToPixel({
            pxPerSec: pxPerSec,
            framerate: activeComp!.framerate,
            durationFrames: frame,
            scale: 1
        })
    }

    private _buildKeyframePoints = (keyframes: Delir.Project.Keyframe[]): {
        id: string,
        frame: number,
        point: {x: number, y: number},
        hasNextKeyframe: boolean,
        transition: {x: number, y: number, xh: number, yh: number, xxh: number, yyh: number, xx: number, yy: number}|null,
        easeInLine: {x: number, y: number, xx: number, yy: number}|null,
        easeOutLine: {x: number, y: number, xx: number, yy: number}|null,
        easeInHandle: {x: number, y: number}|null,
        easeOutHandle: {x: number, y: number}|null,
    }[] =>
    {
        const {props: {pxPerSec}, state: {activePropName, graphWidth, graphHeight}} = this
        const framerate = this.props.editor!.activeComp!.framerate

        if (!activePropName) return []

        const descriptor = this._getDescriptorByPropName(activePropName)

        if (!descriptor || descriptor.animatable === false) return []

        const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)

        if (descriptor.type === 'NUMBER' || descriptor.type === 'FLOAT') {
            const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value as number), 0) + 10
            const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value as number), 0) + -10
            const absMinValue = Math.abs(minValue)
            const minMaxRange = maxValue - minValue

            // Calc keyframe and handle points
            return orderedKeyframes.map((keyframe, idx) => {
                const previousKeyframe: Delir.Project.Keyframe|undefined = orderedKeyframes[idx - 1]
                const nextKeyframe: Delir.Project.Keyframe|undefined = orderedKeyframes[idx + 1]

                let previousX = 0,
                    previousY = 0,
                    nextX = 0,
                    nextY = 0,
                    handleEoX = 0,
                    handleEoY = 0,
                    handleEiX = 0,
                    handleEiY = 0,
                    nextHandleEiX = 0,
                    nextHandleEiY = 0

                const beginX = this._frameToPx(keyframe.frameOnClip)
                const beginY = graphHeight - graphHeight * ((keyframe.value + absMinValue) / minMaxRange)

                if (previousKeyframe) {
                    previousX = this._frameToPx(previousKeyframe.frameOnClip)
                    previousY = graphHeight - graphHeight * ((previousKeyframe.value + absMinValue) / minMaxRange)

                    // console.log(previousKeyframe)
                    // Handle of control transition from previous keyframe to next keyframe
                    handleEiX = ((beginX - previousX) * keyframe.easeInParam[0]) + previousX
                    handleEiY = (beginY * (1 - keyframe.easeInParam[1])) + beginY
                }

                if (nextKeyframe) {
                    // Next keyframe position
                    nextX = this._frameToPx(nextKeyframe.frameOnClip)
                    nextY = graphHeight - graphHeight * ((nextKeyframe.value + absMinValue) / minMaxRange)

                    // Handle of control transition to next keyframe
                    handleEoX = ((nextX - beginX) * keyframe.easeOutParam[0]) + beginX
                    handleEoY = (Math.abs(nextY - beginY) * (1 - keyframe.easeOutParam[1])) + Math.min(beginY, nextY) // ((endPointY - beginY) * nextKeyframe.easeOutParam[1]) + beginY

                    nextHandleEiX = ((nextX - beginX) * nextKeyframe.easeInParam[0]) + beginX
                    nextHandleEiY = (nextY * (1 - keyframe.easeInParam[1])) + nextY
                }

                return {
                    id: keyframe.id,
                    frame: keyframe.frameOnClip,
                    point: {x: beginX, y: beginY},
                    hasNextKeyframe: !!nextKeyframe,
                    transition: nextKeyframe ? {x: beginX, y: beginY, xh: handleEoX, yh: handleEoY, xxh: nextHandleEiX, yyh: nextHandleEiY, xx: nextX, yy: nextY} : null,
                    easeInLine: previousKeyframe ? {x: beginX, y: beginY, xx: handleEiX, yy: handleEiY} : null,
                    easeOutLine: nextKeyframe ? {x: beginX, y: beginY, xx: handleEoX, yy: handleEoY} : null,
                    easeInHandle: previousKeyframe ? {x: handleEiX, y: handleEiY} : null,
                    easeOutHandle: nextKeyframe ? {x: handleEoX, y: handleEoY} : null,
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
}
