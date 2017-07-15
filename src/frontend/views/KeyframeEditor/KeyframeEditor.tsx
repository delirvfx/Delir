import * as _monaco from 'monaco-editor'
import * as _ from 'lodash'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'
import {MeasurePoint} from '../../utils/TimePixelConversion'

import Workspace from '../components/workspace'
import Pane from '../components/pane'
import SelectList from '../components/select-list'
import {ContextMenu, MenuItem} from '../components/ContextMenu'
import DelirValueInput from './_DelirValueInput'
import KeyframeGraph from './KeyframeGraph'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import {default as EditorStateStore, EditorState} from '../../stores/EditorStateStore'
import {default as ProjectStore, ProjectStoreState} from '../../stores/ProjectStore'
import RendererService from '../../services/renderer'

import * as s from './style.styl'

interface KeyframeViewProps {
    activeComposition: Delir.Project.Composition|null
    activeClip: Delir.Project.Clip|null
    editor: EditorState
    project: ProjectStoreState
    scrollLeft: number
    scale: number
    pxPerSec: number
    measures: MeasurePoint[]
}

interface KeyframeViewState {
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
export default class KeyframeView extends React.Component<KeyframeViewProps, KeyframeViewState> {
    public static propTypes = {
        activeClip: PropTypes.instanceOf(Delir.Project.Clip),
        scrollLeft: PropTypes.number,
        measures: PropTypes.array.isRequired
    }

    public static defaultProps: Partial<KeyframeViewProps> = {
        scrollLeft: 0
    }

    public state: KeyframeViewState = {
        activePropName: null,
        graphWidth: 0,
        graphHeight: 0,
        keyframeViewViewBox: undefined,
        editorOpened: false,
    }

    public refs: {
        svgParent: HTMLDivElement
    }

    private _editor: monaco.editor.IStandaloneCodeEditor
    private editorElement: HTMLDivElement

    protected componentDidMount()
    {
        this._syncGraphHeight()
        window.addEventListener('resize', _.debounce(this._syncGraphHeight, 1000 / 30))

        monaco.languages.typescript.typescriptDefaults.addExtraLib(Delir.Renderer.expressionContextTypeDefinition, 'ExpressionAPI.ts')

        this._editor = monaco.editor.create(this.editorElement, {
            language: 'typescript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: {enabled: false},
        })

        this._editor.createContextKey('cond1', true)
        this._editor.createContextKey('cond2', true)
        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.handleEditorSave, 'cond1')
        this._editor.addCommand(monaco.KeyCode.Escape, this.closeEditor, 'cond2')
    }

    private handleEditorSave = () => {
        const {activeClip} = this.props
        const {activePropName} = this.state

        if (!activeClip || !activePropName) return

        try {
            ProjectModifyActions.modifyClipExpression(activeClip.id, activePropName, {
                language: 'typescript',
                code: this._editor.getValue(),
            })

            this.setState({editorOpened: false, activePropName: null})
        } catch (e) {
            console.log(e)
        }
    }

    private closeEditor = () => {
        this._editor.setValue('')
        this.setState({editorOpened: false, activePropName: null})
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
        ProjectModifyActions.createOrModifyKeyframeForClip(activeClip.id!, desc.propName, frameOnClip, {value})
        EditorStateActions.seekPreviewFrame(this.props.editor.currentPreviewFrame)
    }

    private _openExpressionEditor = (propName: string) => {
        const {activeClip} = this.props
        const expression = activeClip!.expressions[propName]

        this._editor.setValue(expression ? expression.code : '')
        this.setState({editorOpened: true, activePropName: propName})
    }

    public render()
    {
        const {activeClip, project: {project}, editor, scrollLeft} = this.props
        const {activePropName, keyframeViewViewBox, graphWidth, graphHeight, editorOpened} = this.state
        const activePropDescriptor = this._getDescriptorByPropName(activePropName)
        const descriptors = activeClip
            ? Delir.Renderer.Renderers.getInfo(activeClip.renderer).parameter.properties || []
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
                                    <ContextMenu>
                                        <MenuItem label='エクスプレッション' onClick={() => this._openExpressionEditor(desc.propName) } />
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
                    </SelectList>
                </Pane>
                <Pane>
                    <div ref='svgParent' className={s.keyframeContainer} tabIndex={-1} onKeyDown={this.onKeydownOnKeyframeGraph}>
                        <div ref={el => { this.editorElement = el }} className={s.expressionEditor} style={{display: editorOpened ? null : 'none'}} />
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
            ? Delir.Renderer.Renderers.getInfo(activeClip.renderer)
            : {parameter: {properties: ([] as Delir.AnyParameterTypeDescriptor[])}}

        return descriptors.parameter.properties.find(desc => desc.propName === propName) || null
    }
}
