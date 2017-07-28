import * as _ from 'lodash'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/Flux/connectToStores'
import {MeasurePoint} from '../../utils/TimePixelConversion'

import Workspace from '../components/workspace'
import Pane from '../components/pane'
import SelectList from '../components/select-list'
import {ContextMenu, MenuItem} from '../components/ContextMenu'
import DelirValueInput from './_DelirValueInput'
import KeyframeGraph from './KeyframeGraph'
import ExpressionEditor from './ExpressionEditor'

import AppActions from '../../actions/App'
import ProjectModActions from '../../actions/ProjectMod'

import {default as EditorStateStore, EditorState} from '../../stores/EditorStateStore'
import {default as ProjectStore, ProjectStoreState} from '../../stores/ProjectStore'
import RendererService from '../../services/renderer'

import t from './KeyframeEditor.i18n'
import * as s from './KeyframeEditor.styl'

interface KeyframeEditorProps {
    activeComposition: Delir.Project.Composition|null
    activeClip: Delir.Project.Clip|null
    editor: EditorState
    project: ProjectStoreState
    scrollLeft: number
    scale: number
    pxPerSec: number
    measures: MeasurePoint[]
}

interface KeyframeEditorState {
    activePropName: string|null
    graphWidth: number
    graphHeight: number
    keyframeViewViewBox: string|undefined
    editorOpened: boolean
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
    project: ProjectStore.getState()
}))
export default class KeyframeEditor extends React.Component<KeyframeEditorProps, KeyframeEditorState> {
    public static propTypes = {
        activeClip: PropTypes.instanceOf(Delir.Project.Clip),
        scrollLeft: PropTypes.number,
        measures: PropTypes.array.isRequired
    }

    public static defaultProps: Partial<KeyframeEditorProps> = {
        scrollLeft: 0
    }

    public state: KeyframeEditorState = {
        activePropName: null,
        graphWidth: 0,
        graphHeight: 0,
        keyframeViewViewBox: undefined,
        editorOpened: false,
    }

    public refs: {
        svgParent: HTMLDivElement
    }

    public componentDidMount()
    {
        this._syncGraphHeight()
        window.addEventListener('resize', _.debounce(this._syncGraphHeight, 1000 / 30))
    }

    public componentWillReceiveProps(nextProps: KeyframeEditorProps)
    {
        if (!nextProps.activeClip) {
            this.setState({activePropName: null, editorOpened: false})
        }
    }

    private onCloseEditor = (result: ExpressionEditor.EditorResult) => {
        if (!result.saved) {
            this.setState({editorOpened: false})
            return
        }

        const {activeClip} = this.props
        const {activePropName} = this.state

        if (!activeClip || !activePropName) return

        try {
            ProjectModActions.modifyClipExpression(activeClip.id, activePropName, {
                language: 'typescript',
                code: result.code,
            })

            this.setState({editorOpened: false})
        } catch (e) {
            console.log(e)
        }
    }

    private _syncGraphHeight = () =>
    {
        const box = this.refs.svgParent.getBoundingClientRect()

        this.setState({
            graphWidth: box.width,
            graphHeight: box.height,
            keyframeViewViewBox: `0 0 ${box.width} ${box.height}`,
        })
    }

    private selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const propName: string = currentTarget.dataset.propName!
        this.setState({activePropName: propName})
    }

    private valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame
        ProjectModActions.createOrModifyKeyframeForClip(activeClip.id!, desc.propName, frameOnClip, {value})
        AppActions.seekPreviewFrame(this.props.editor.currentPreviewFrame)
    }

    private _openExpressionEditor = (propName: string) => {
        const {activeClip} = this.props
        this.setState({editorOpened: true, activePropName: propName})
        this.forceUpdate()
    }

    public render()
    {
        const {activeClip, project: {project}, editor, scrollLeft} = this.props
        const {activePropName, keyframeViewViewBox, graphWidth, graphHeight, editorOpened} = this.state
        const activePropDescriptor = this._getDescriptorByPropName(activePropName)
        const descriptors = activeClip
            ? Delir.Engine.Renderers.getInfo(activeClip.renderer).parameter.properties || []
            : []

        const expressionCode = (!editorOpened && !activePropName) ? null : (
            activeClip.expressions[activePropName]
                ? activeClip.expressions[activePropName].code
                : null
        )

        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.propList}>
                    {descriptors.map(desc => {
                        const value = activeClip
                            ? Delir.KeyframeHelper.calcKeyframeValueAt(editor.currentPreviewFrame, desc, activeClip.keyframes[desc.propName] || [])
                            : undefined

                        const hasKeyframe = desc.animatable && (activeClip.keyframes[desc.propName] || []).length !== 0

                        return (
                            <div
                                key={activeClip!.id + desc.propName}
                                className={classnames(s.propItem, {
                                    [s['propItem--active']]: activePropName === desc.propName,
                                })}
                                data-prop-name={desc.propName}
                                onClick={this.selectProperty}
                            >
                                <ContextMenu>
                                    <MenuItem label={t('contextMenu.expression')} onClick={() => this._openExpressionEditor(desc.propName) } />
                                </ContextMenu>
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
                </Pane>
                <Pane>
                    <div ref='svgParent' className={s.keyframeContainer} tabIndex={-1} onKeyDown={this.onKeydownOnKeyframeGraph}>
                        {editorOpened && <ExpressionEditor className={s.expressionEditor} code={expressionCode} onClose={this.onCloseEditor} />}
                        <div className={s.measureContainer}>
                            <div ref='mesures' className={s.measureLayer} style={{transform: `translateX(-${scrollLeft}px)`}}>
                                {...this._renderMeasure()}
                            </div>
                        </div>
                        {activePropDescriptor && activeClip!.keyframes[activePropName!] && (
                            <KeyframeGraph
                                composition={editor.activeComp!}
                                clip={activeClip!}
                                propName={activePropName!}
                                descriptor={activePropDescriptor}
                                width={graphWidth}
                                height={graphHeight}
                                viewBox={keyframeViewViewBox!}
                                scrollLeft={scrollLeft}
                                pxPerSec={this.props.pxPerSec}
                                zoomScale={this.props.scale}
                                keyframes={activeClip!.keyframes[activePropName!]}
                            />
                        )}
                    </div>
                </Pane>
            </Workspace>
        )
    }

    private _renderMeasure = (): JSX.Element[] =>
    {
        const {activeComposition} = this.props
        if (! activeComposition) return []

        const {measures} = this.props
        const components: JSX.Element[] = []

        for (const point of measures) {
            components.push(
                <div
                    key={point.index}
                    className={classnames(s.measureLine, {
                        [s['--grid']]: point.frameNumber % 10 === 0,
                        [s['--endFrame']]: point.frameNumber === activeComposition.durationFrames,
                    })}
                    style={{left: point.left}}
                >
                    {point.frameNumber}
                </div>
            )
        }

        return components
    }

    private _getDescriptorByPropName(propName: string|null)
    {
        const {activeClip} = this.props
        const descriptors = activeClip
            ? Delir.Engine.Renderers.getInfo(activeClip.renderer)
            : {parameter: {properties: ([] as Delir.AnyParameterTypeDescriptor[])}}

        return descriptors.parameter.properties.find(desc => desc.propName === propName) || null
    }
}
