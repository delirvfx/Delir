import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as mouseWheel from 'mouse-wheel'
import * as React from 'react'
import { MeasurePoint } from '../../utils/TimePixelConversion'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import { ParameterTarget } from '../../domain/Editor/types'
import ProjectStore, { ProjectStoreState } from '../../domain/Project/ProjectStore'
import RendererStore from '../../domain/Renderer/RendererStore'

import Button from '../../components/Button'
import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu'
import LabelInput from '../../components/label-input'
import Pane from '../../components/pane'
import Workspace from '../../components/workspace'
import DelirValueInput from './_DelirValueInput'
import ExpressionEditor from './ExpressionEditor'
import KeyframeGraph, { KeyframePatch } from './KeyframeGraph'
import ScriptParamEditor from './ScriptParamEditor'

import t from './KeyframeEditor.i18n'
import * as s from './KeyframeEditor.styl'

export interface EditorResult {
    saved: boolean
    code: string | null
    target: ParameterTarget
}

interface OwnProps {
    activeComposition: Delir.Entity.Composition | null
    activeClip: Delir.Entity.Clip | null
    scrollLeft: number
    scale: number
    pxPerSec: number
    measures: MeasurePoint[]
    onScroll: (dx: number, dy: number) => void
    onScaled: (scale: number) => void
}

interface ConnectedProps {
    editor: EditorState
    activeParam: ParameterTarget | null
    project: ProjectStoreState
}

interface State {
    graphWidth: number
    graphHeight: number
    keyframeViewViewBox: string | undefined
    editorOpened: boolean
    scriptParamEditorOpened: boolean
}

type Props = OwnProps & ConnectedProps & ContextProp

export default withComponentContext(connectToStores([EditorStore], (context) => ({
    editor: context.getStore(EditorStore).getState(),
    activeParam: context.getStore(EditorStore).getActiveParam(),
    project: context.getStore(ProjectStore).getState()
}))(class KeyframeEditor extends React.Component<Props, State> {
    public static defaultProps: Partial<Props> = {
        scrollLeft: 0
    }

    public state: State = {
        graphWidth: 0,
        graphHeight: 0,
        keyframeViewViewBox: undefined,
        editorOpened: false,
        scriptParamEditorOpened: false,
    }

    public refs: {
        svgParent: HTMLDivElement
    }

    public componentDidMount()
    {
        this._syncGraphHeight()
        window.addEventListener('resize', _.debounce(this._syncGraphHeight, 1000 / 30))
        mouseWheel(this.refs.svgParent, this.handleScrolling)
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.activeClip && prevProps.activeClip && this.props.activeClip.id !== prevProps.activeClip.id) {
            this.setState({editorOpened: false, scriptParamEditorOpened: false})
        }
    }

    public render()
    {
        const {activeClip, project: {project}, editor, activeParam, scrollLeft} = this.props
        const {keyframeViewViewBox, graphWidth, graphHeight, editorOpened, scriptParamEditorOpened} = this.state
        const activeEntityObject = this.activeEntityObject

        const activeParamDescriptor = activeParam ? this._getDescriptorByParamName(activeParam.paramName) : null
        const descriptors = activeClip
            ? Delir.Engine.Renderers.getInfo(activeClip.renderer).parameter.properties || []
            : []

        const expressionCode = (!activeEntityObject || !activeParam) ? null : (
            activeEntityObject.expressions[activeParam.paramName]
                ? activeEntityObject.expressions[activeParam.paramName].code
                : null
        )

        let keyframes: Delir.Entity.Keyframe[] | null = null

        if (activeClip && activeParam) {
            if (activeParam.type === 'effect') {
                const activeEffect = activeClip.effects.find(e => e.id === activeParam.entityId)
                keyframes = activeEffect ? activeEffect.keyframes[activeParam.paramName] : null
            } else {
                keyframes = activeClip.keyframes[activeParam.paramName]
            }
        }

        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.paramList}>
                    {activeClip && descriptors.map(desc => {
                        const value = activeClip
                            ? Delir.KeyframeCalcurator.calcKeyframeValueAt(editor.currentPreviewFrame, activeClip.placedFrame, desc, activeClip.keyframes[desc.paramName] || [])
                            : undefined

                        const hasKeyframe = desc.animatable && (activeClip.keyframes[desc.paramName] || []).length !== 0

                        return (
                            <div
                                key={activeClip.id + desc.paramName}
                                className={classnames(s.paramItem, {
                                    [s.paramItemActive]: activeParam && activeParam.type === 'clip' && activeParam.paramName === desc.paramName,
                                })}
                                data-entity-type='clip'
                                data-entity-id={activeClip.id}
                                data-param-name={desc.paramName}
                                onClick={this.selectProperty}
                            >
                                <ContextMenu>
                                    <MenuItem
                                        label={t('contextMenu.expression')}
                                        data-entity-type='clip'
                                        data-entity-id={activeClip.id}
                                        data-param-name={desc.paramName}
                                        enabled={desc.animatable}
                                        onClick={this.openExpressionEditor}
                                    />
                                </ContextMenu>
                                <span className={classnames(
                                        s.paramKeyframeIndicator,
                                        {
                                            [s['paramKeyframeIndicator--hasKeyframe']]: hasKeyframe,
                                            [s['paramKeyframeIndicator--nonAnimatable']]: !desc.animatable,
                                        })
                                    }
                                >
                                    {desc.animatable && (<i className='twa twa-clock12'></i>)}
                                </span>
                                <span className={s.paramItemName}>{desc.label}</span>
                                <div className={s.paramItemInput}>
                                    {desc.type === 'CODE' ? (
                                        <Button type='normal' onClick={this.handleOpenScriptParamEditor}>{t('editScriptParam')}</Button>
                                    ) : (
                                        <DelirValueInput
                                            assets={project ? project.assets : null}
                                            descriptor={desc}
                                            value={value!}
                                            onChange={this.valueChanged}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {this.renderEffectProperties()}
                </Pane>
                <Pane>
                    <div
                        ref='svgParent'
                        className={s.keyframeContainer}
                        tabIndex={-1}
                        onWheel={this._scaleTimeline}
                    >
                        {activeParam && editorOpened && (
                            <ExpressionEditor
                                title={activeParamDescriptor!.label}
                                code={expressionCode}
                                target={activeParam}
                                onClose={this.onCloseEditor}
                            />
                        )}
                        {scriptParamEditorOpened && activeParam && activeParamDescriptor && activeParamDescriptor.type === 'CODE' && (() => {
                            const value = activeClip
                                ? Delir.KeyframeCalcurator.calcKeyframeValueAt(
                                    editor.currentPreviewFrame,
                                    activeClip.placedFrame,
                                    activeParamDescriptor,
                                    activeClip.keyframes[activeParam.paramName] || []
                                ) : new Delir.Values.Expression('javascript', '')

                            return (
                                <ScriptParamEditor
                                    title={activeParamDescriptor.label}
                                    target={activeParam}
                                    code={(value as Delir.Values.Expression).code}
                                    onClose={this.handleCloseScriptParamEditor}
                                />
                            )
                        })()}
                        <div className={s.measureContainer}>
                            <div ref='mesures' className={s.measureLayer} style={{transform: `translateX(-${scrollLeft}px)`}}>
                                {...this._renderMeasure()}
                            </div>
                        </div>
                        {activeClip && activeParamDescriptor && activeParam && keyframes && (
                            <KeyframeGraph
                                composition={editor.activeComp!}
                                parentClip={activeClip}
                                entity={activeEntityObject}
                                paramName={activeParam.paramName!}
                                descriptor={activeParamDescriptor}
                                width={graphWidth}
                                height={graphHeight}
                                viewBox={keyframeViewViewBox!}
                                scrollLeft={scrollLeft}
                                pxPerSec={this.props.pxPerSec}
                                zoomScale={this.props.scale}
                                keyframes={keyframes}
                                onKeyframeRemove={this.keyframeRemoved}
                                onModified={this.keyframeModified}
                            />
                        )}
                    </div>
                </Pane>
            </Workspace>
        )
    }

    private get activeEntityObject(): Delir.Entity.Clip | Delir.Entity.Effect | null {
        const { activeClip, activeParam } = this.props

        if (activeClip) {
            if (activeParam && activeParam.type === 'effect') {
                return activeClip.effects.find(e => e.id === activeParam.entityId)!
            } else {
                return activeClip
            }
        }

        return null
    }

    private renderEffectProperties = () =>
    {
        const rendererStore = this.props.context.getStore(RendererStore)
        const { activeClip, activeParam, editor, project: { project } } = this.props

        if (!activeClip) return null

        return activeClip.effects.map(effect => {
            const processorInfo = rendererStore.getPostEffectPlugins().find(entry => entry.id === effect.processor)!
            let descriptors: Delir.AnyParameterTypeDescriptor[] | null = []

            try {
                descriptors = rendererStore.getPostEffectParametersById(effect.processor)!
            } catch (e) {
                if (!(e instanceof Delir.Exceptions.UnknownPluginReferenceException)) {
                    throw e
                }
            }

            if (!processorInfo) {
                return (
                    <div key={effect.id} className={classnames(s.paramItem, s.paramItemEffectContainer)}　title={t('pluginMissing', {processorId: effect.processor})}>
                        <div key={effect.id} className={classnames(s.paramItem, s.paramItemHeader, s.paramItemPluginMissing)}>
                            <ContextMenu>
                                <MenuItem label={t('contextMenu.removeEffect')} data-clip-id={activeClip.id} data-effect-id={effect.id} onClick={this.removeEffect} />
                            </ContextMenu>
                            <i className='fa fa-exclamation' />
                            {effect.processor}
                        </div>
                    </div>
                )
            }

            return (
                <div key={effect.id} className={classnames(s.paramItem, s.paramItemEffectContainer)}>
                    <div key={effect.id} className={classnames(s.paramItem, s.paramItemHeader)}>
                        <ContextMenu>
                            <MenuItem label={t('contextMenu.removeEffect')} data-clip-id={activeClip.id} data-effect-id={effect.id} onClick={this.removeEffect} />
                        </ContextMenu>
                        <i className='fa fa-magic' />
                        <LabelInput doubleClickToEdit={true} placeholder={processorInfo.name} defaultValue={effect.referenceName || ''} />
                        {effect.referenceName != null && (<span>{processorInfo.name}</span>)}
                    </div>

                    {descriptors.map(desc => {
                        const hasKeyframe = desc.animatable && (effect.keyframes[desc.paramName] || []).length !== 0

                        const value = activeClip
                            ? Delir.KeyframeCalcurator.calcKeyframeValueAt(editor.currentPreviewFrame, activeClip.placedFrame, desc, effect.keyframes[desc.paramName] || [])
                            : undefined

                        return (
                            <div
                                key={`${activeClip.id}-${effect.id}-${desc.paramName}`}
                                className={classnames(s.paramItem, {
                                    [s.paramItemActive]: activeParam && activeParam.type === 'effect' && activeParam.entityId === effect.id && activeParam.paramName === desc.paramName,
                                })}
                                data-entity-type='effect'
                                data-entity-id={effect.id}
                                data-param-name={desc.paramName}
                                onClick={this.selectProperty}
                            >
                                <ContextMenu>
                                    <MenuItem
                                        label={t('contextMenu.expression')}
                                        data-entity-type='effect'
                                        data-entity-id={effect.id}
                                        data-param-name={desc.paramName}
                                        onClick={this.openExpressionEditor}
                                    />
                                </ContextMenu>
                                <span className={classnames(
                                        s.paramKeyframeIndicator,
                                        {
                                            [s['paramKeyframeIndicator--hasKeyframe']]: hasKeyframe,
                                            [s['paramKeyframeIndicator--nonAnimatable']]: !desc.animatable,
                                        })
                                    }
                                >
                                    {desc.animatable && (<i className='twa twa-clock12'></i>)}
                                </span>
                                <span className={s.paramItemName}>{desc.label}</span>
                                <div className={s.paramItemInput}>
                                    <DelirValueInput
                                        key={desc.paramName}
                                        assets={project ? project.assets : null}
                                        descriptor={desc}
                                        value={value!}
                                        onChange={this.effectValueChanged.bind(null, effect.id)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        })
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

    private handleOpenScriptParamEditor = () => {
        this.setState({ scriptParamEditorOpened: true })
    }

    private handleCloseScriptParamEditor = (result: EditorResult) => {
        if (!result.saved) {
            this.setState({ scriptParamEditorOpened: false })
            return
        }

        const { activeClip } = this.props
        if (!activeClip) return

        this.setState({ scriptParamEditorOpened: false })

        this.props.context.executeOperation(ProjectOps.createOrModifyClipKeyframe, {
            clipId: activeClip.id,
            frameOnClip: 0,
            paramName: result.target.paramName,
            patch: { value: new Delir.Values.Expression('javascript', result.code!) }
        })
    }

    private onCloseEditor = (result: EditorResult) => {
        if (!result.saved) {
            this.setState({ editorOpened: false })
            return
        }

        const { activeClip } = this.props
        if (!activeClip) return

        if (result.target.type === 'clip') {
            this.props.context.executeOperation(ProjectOps.modifyClipExpression, {
                clipId: activeClip.id,
                paramName: result.target.paramName,
                expr: {
                    language: 'typescript',
                    code: result.code!,
                }
            })
        } else {
            this.props.context.executeOperation(ProjectOps.modifyEffectExpression, {
                clipId: activeClip.id,
                effectId: result.target.entityId,
                paramName: result.target.paramName,
                expr: {
                    language: 'typescript',
                    code: result.code!,
                }
            })
        }

        this.setState({editorOpened: false})
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

    private _scaleTimeline = (e: React.WheelEvent<HTMLDivElement>) =>
    {
        if (e.altKey) {
            const newScale = this.props.scale + (e.deltaY * .05)
            this.props.onScaled(Math.max(newScale, .1))
            e.preventDefault()
        }
    }

    private handleScrolling = (dx: number, dy: number) =>
    {
        this.props.onScroll(dx, dy)
    }

    private selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const { entityType, entityId, paramName } = currentTarget.dataset as {[_: string]: string}

        this.props.context.executeOperation(EditorOps.changeActiveParam, {
            target: {
                type: entityType as 'clip' | 'effect',
                entityId,
                paramName,
            }
        })
    }

    private valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame

        this.props.context.executeOperation(ProjectOps.createOrModifyClipKeyframe, {
            clipId: activeClip.id!,
            paramName: desc.paramName,
            frameOnClip,
            patch: { value }
        })

        this.props.context.executeOperation(EditorOps.seekPreviewFrame, { frame: this.props.editor.currentPreviewFrame })
    }

    private effectValueChanged = (effectId: string, desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame
        this.props.context.executeOperation(ProjectOps.createOrModifyKeyframeForEffect, {
            clipId: activeClip.id,
            effectId,
            paramName: desc.paramName,
            frameOnClip,
            patch: {value}
        })

        this.props.context.executeOperation(EditorOps.seekPreviewFrame, { frame: currentPreviewFrame })
    }

    private keyframeModified = (parentClipId: string, paramName: string, frameOnClip: number, patch: KeyframePatch) =>
    {
        const { activeParam } = this.props
        if (!activeParam) return

        switch (activeParam.type) {
            case 'clip': {
                this.props.context.executeOperation(ProjectOps.createOrModifyClipKeyframe, {
                    clipId: parentClipId,
                    paramName,
                    frameOnClip,
                    patch
                })
                break
            }

            case 'effect': {
                this.props.context.executeOperation(ProjectOps.createOrModifyKeyframeForEffect, {
                    clipId: parentClipId,
                    effectId: activeParam.entityId,
                    paramName,
                    frameOnClip,
                    patch
                })
                break
            }

            default: {
                throw new Error('unreachable')
            }
        }
    }

    private keyframeRemoved = (parentClipId: string, keyframeId: string) =>
    {
        const { activeParam } = this.props
        if (!activeParam) return

        if (activeParam.type === 'clip') {
            this.props.context.executeOperation(ProjectOps.removeKeyframe, { keyframeId })
        } else {
            this.props.context.executeOperation(ProjectOps.removeEffectKeyframe, {
                clipId: parentClipId,
                effectId: activeParam.entityId,
                keyframeId
            })
        }
    }

    private openExpressionEditor = ({ dataset }: MenuItemOption<{ entityType: 'clip' | 'effect', entityId: string, paramName: string }>) => {
        const { entityType, entityId, paramName } = dataset

        this.props.context.executeOperation(EditorOps.changeActiveParam, {
            target: { type: entityType, entityId, paramName }
        })

        this.setState({editorOpened: true})
        this.forceUpdate()
    }

    private removeEffect = ({dataset}: MenuItemOption<{clipId: string, effectId: string}>) =>
    {
        this.setState({ editorOpened: false }, () => {
            this.props.context.executeOperation(ProjectOps.removeEffect, {
                holderClipId: dataset.clipId,
                effectId: dataset.effectId
            })

            this.props.context.executeOperation(EditorOps.seekPreviewFrame, {
                frame: this.props.editor.currentPreviewFrame
            })
        })
    }

    private _getDescriptorByParamName(paramName: string | null)
    {
        const rendererStore = this.props.context.getStore(RendererStore)
        const activeEntityObject = this.activeEntityObject

        if (!activeEntityObject) return null

        let parameters: Delir.AnyParameterTypeDescriptor[]

        if (activeEntityObject instanceof Delir.Entity.Clip) {
            const info = Delir.Engine.Renderers.getInfo(activeEntityObject.renderer)
            parameters = info ? info.parameter.properties : []
        } else if (activeEntityObject instanceof Delir.Entity.Effect) {
            parameters = rendererStore.getPostEffectParametersById(activeEntityObject.processor) || []
        } else {
            throw new Error('Unexpected entity type')
        }

        return parameters.find(desc => desc.paramName === paramName) || null
    }
}))
