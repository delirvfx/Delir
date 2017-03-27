import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'
import parseColor from 'parse-color'
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
        console.log(currentTarget.dataset.frame)
        EditorStateActions.seekPreviewFrame(currentTarget.dataset.frame | 0)
    }

    valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, desc.propName, currentPreviewFrame, {value})
    }

    render()
    {
        const {activeClip, project: {project}, editor} = this.props
        const {activePropName, keyframeViewViewBox, graphWidth, graphHeight} = this.state
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

                            return (
                                <div
                                    key={activeClip!.id + desc.propName}
                                    className={s.propItem}
                                    data-prop-name={desc.propName}
                                    onClick={this.selectProperty}
                                >
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
                            {...this.renderKeyframes()}
                        </svg>
                    </div>
                </Pane>
            </Workspace>
        )
    }

    renderKeyframes()
    {
        const {props: {activeClip}, state: {activePropName}} = this

        if (!activePropName || !activeClip!.keyframes[activePropName]) return []

        const points = this._buildKeyframePoints(activeClip!.keyframes[activePropName])

        return points.map((p, idx) => (
            <g key={p.id} data-index={idx}>
                {/*<path
                    stroke='#fff'
                    fill='none'
                    strokeWidth='1'
                    d={`M ${p.transition.beginX} ${p.transition.beginY} C ${p.transition.handleEoX} ${p.transition.handleEoY} ${p.transition.handleEiX} ${p.transition.handleEiY} ${p.transition.endPointX} ${p.transition.endPointY}`}
                    data-transition-path
                />
                <path
                    stroke='#acacac'
                    fill='none'
                    strokeWidth='1'
                    d={`M ${p.easeInLine.handleEiX} ${p.easeInLine.handleEiY} L ${p.easeInLine.endPointX} ${p.easeInLine.endPointY}`}
                    data-ease-in-handle-path
                />*/}
                {p.hasNextKeyframe && (
                    <path
                        stroke='#acacac'
                        fill='none'
                        strokeWidth='1'
                        d={`M ${p.point.x} ${p.point.y} L ${points[idx + 1].point.x} ${points[idx + 1].point.y}`}
                        data-ease-out-handle-path
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
                {/*{kfp.hasNextKeyFrame && (
                    <circle
                        cx={kfp.easeInHandle.handleEiX}
                        cy={kfp.easeInHandle.handleEiY}
                        fill='#7100bf'
                        r='6'
                        data-ease-in-handle
                    />
                )}*/}
                {/*{kfp.hasNextKeyFrame && (
                    <circle
                        cx={kfp.easeOutHandle.handleEoX}
                        cy={kfp.easeOutHandle.handleEoY}
                        fill='#7100bf'
                        r='6'
                        data-ease-out-handle
                    />
                )}*/}
            </g>
        ))
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
    }[] =>
    {
        const {props: {pxPerSec}, state: {activePropName, graphWidth, graphHeight}} = this
        const framerate = this.props.editor!.activeComp!.framerate

        if (!activePropName) return []

        const baseY = graphHeight / 2
        const descriptor = this._getDescriptorByPropName(activePropName)

        if (!descriptor || descriptor.animatable === false) return []

        const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)

        if (descriptor.type === 'NUMBER') {
            const maxValue = orderedKeyframes.reduce((memo, kf) => Math.max(memo, kf.value as number), 0) + 10
            const minValue = orderedKeyframes.reduce((memo, kf) => Math.min(memo, kf.value as number), 0) + -10
            const absMinValue = Math.abs(minValue)
            const minMaxRange = maxValue - minValue

            // Calc keyframe and handle points
            return orderedKeyframes.map((keyframe, idx) => {
                const nextKeyframe: Delir.Project.Keyframe|undefined = orderedKeyframes[idx + 1]

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

                const beginX = this._frameToPx(keyframe.frameOnClip)
                const beginY = graphHeight - graphHeight * ((keyframe.value + absMinValue) / minMaxRange)

                if (nextKeyframe) {
                    endPointX = this._frameToPx(nextKeyframe.frameOnClip)
                    endPointY = graphHeight - graphHeight * ((nextKeyframe.value + absMinValue) / minMaxRange)

                    handleEoX = (endPointX - beginX) * keyframe.easeOutParam[0]
                    handleEoY = graphHeight * keyframe.easeOutParam[1]

                    handleEiX = (endPointX - beginX) * nextKeyframe.easeInParam[0]
                    handleEiY = graphHeight * nextKeyframe.easeOutParam[1]
                }

                return {
                    id: keyframe.id,
                    frame: keyframe.frameOnClip,
                    point: {x: beginX, y: beginY},
                    hasNextKeyframe: !!nextKeyframe,
                    // transition: {beginX, beginY, handleEoX, handleEoY, handleEiX, handleEiY, endPointX, endPointY},
                    // easeOutHandle: {handleEoX, handleEoY},
                    // easeOutLine: {beginX, beginY, handleEoX, handleEoY},
                    // easeInHandle: {handleEiX, handleEiY},
                    // easeInLine: {handleEiX, handleEiY, endPointX, endPointY},
                }
            })
        }

        return []
    }

    private _getDescriptorByPropName(propName: string)
    {
        const {activeClip} = this.props
        const descriptors = activeClip
            ? RendererService.pluginRegistry!.getParametersById(activeClip.renderer) || []
            : []

        return descriptors.find(desc => desc.propName === propName) || null
    }
}
