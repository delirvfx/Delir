import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as mouseWheel from 'mouse-wheel'
import * as React from 'react'
import { MeasurePoint } from '../../utils/TimePixelConversion'

import { ContextMenu, MenuItem, MenuItemProps } from '../components/ContextMenu'
import Pane from '../components/pane'
import Workspace from '../components/workspace'
import DelirValueInput from './_DelirValueInput'
import ExpressionEditor from './ExpressionEditor'
import { default as KeyframeGraph, KeyframePatch } from './KeyframeGraph'

import * as AppActions from '../../actions/App'
import * as ProjectModActions from '../../actions/ProjectMod'

import EditorStateStore, { EditorState } from '../../stores/EditorStateStore'
import ProjectStore, { ProjectStoreState } from '../../stores/ProjectStore'
import RendererStore from '../../stores/RendererStore'

import t from './KeyframeEditor.i18n'
import * as s from './KeyframeEditor.styl'

interface OwnProps {
    activeComposition: Delir.Project.Composition | null
    activeClip: Delir.Project.Clip | null
    scrollLeft: number
    scale: number
    pxPerSec: number
    measures: MeasurePoint[]
    onScroll: (dx: number, dy: number) => void
    onScaled: (scale: number) => void
}

interface ConnectedProps {
    editor: EditorState
    project: ProjectStoreState
}

interface State {
    activePropName: string | null
    activeEntity: { type: 'clip' | 'effect', entityId: string } | null
    graphWidth: number
    graphHeight: number
    keyframeViewViewBox: string | undefined
    editorOpened: boolean
}

type Props = OwnProps & ConnectedProps & ContextProp

export default withComponentContext(connectToStores([EditorStateStore], (context) => ({
    editor: context.getStore(EditorStateStore).getState(),
    project: context.getStore(ProjectStore).getState()
}))(class KeyframeEditor extends React.Component<Props, State> {

    private get activeEntityObject(): Delir.Project.Clip | Delir.Project.Effect | null {
        const { activeClip } = this.props
        const { activeEntity } = this.state

        if (activeClip) {
            if (activeEntity && activeEntity.type === 'effect') {
                return activeClip.effects.find(e => e.id === activeEntity.entityId)!
            } else {
                return activeClip
            }
        }

        return null
    }
    public static defaultProps: Partial<Props> = {
        scrollLeft: 0
    }

    public state: State = {
        activePropName: null,
        activeEntity: null,
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
        mouseWheel(this.refs.svgParent, this.handleScrolling)
    }

    public componentWillReceiveProps(nextProps: Props)
    {
        if (!nextProps.activeClip) {
            this.setState({activePropName: null, editorOpened: false})
        }
    }

    public render()
    {
        const {activeClip, project: {project}, editor, scrollLeft} = this.props
        const {activePropName, activeEntity, keyframeViewViewBox, graphWidth, graphHeight, editorOpened} = this.state
        const activeEntityObject = this.activeEntityObject

        const activePropDescriptor = this._getDescriptorByPropId(activePropName)
        const descriptors = activeClip
            ? Delir.Engine.Renderers.getInfo(activeClip.renderer).parameter.properties || []
            : []

        const expressionCode = (!activeEntityObject || !activePropName) ? null : (
            activeEntityObject.expressions[activePropName]
                ? activeEntityObject.expressions[activePropName].code
                : null
        )

        let keyframes: Delir.Project.Keyframe[] | null = null
        if (activeClip && activeEntity) {
            if (activePropName) {
                if (activeEntity.type === 'effect') {
                    const activeEffect = activeClip.effects.find(e => e.id === activeEntity.entityId)
                    keyframes = activeEffect ? activeEffect.keyframes[activePropName] : null
                } else {
                    keyframes = activeClip.keyframes[activePropName]
                }
            }
        }

        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.propList}>
                    {activeClip && descriptors.map(desc => {
                        const value = activeClip
                            ? Delir.KeyframeHelper.calcKeyframeValueAt(editor.currentPreviewFrame, activeClip.placedFrame, desc, activeClip.keyframes[desc.paramName] || [])
                            : undefined

                        const hasKeyframe = desc.animatable && (activeClip.keyframes[desc.paramName] || []).length !== 0

                        return (
                            <div
                                key={activeClip!.id + desc.paramName}
                                className={classnames(s.propItem, {
                                    [s['propItem--active']]: activeEntity && activeEntity.type === 'clip' && activePropName === desc.paramName,
                                })}
                                data-entity-type='clip'
                                data-entity-id={activeClip.id}
                                data-prop-name={desc.paramName}
                                onClick={this.selectProperty}
                            >
                                <ContextMenu>
                                    <MenuItem label={t('contextMenu.expression')} onClick={() => this._openExpressionEditor(desc.paramName) } />
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
                                    <DelirValueInput
                                        key={desc.paramName}
                                        assets={project ? project.assets : null}
                                        descriptor={desc}
                                        value={value!}
                                        onChange={this.valueChanged}
                                    />
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
                        {editorOpened && (
                            <ExpressionEditor
                                entityId={`${activeEntityObject!.id}-${activePropName}`}
                                title={activePropDescriptor!.label}
                                code={expressionCode}
                                onClose={this.onCloseEditor}
                            />
                        )}
                        <div className={s.measureContainer}>
                            <div ref='mesures' className={s.measureLayer} style={{transform: `translateX(-${scrollLeft}px)`}}>
                                {...this._renderMeasure()}
                            </div>
                        </div>
                        {activePropDescriptor && activeClip && keyframes && (
                            <KeyframeGraph
                                composition={editor.activeComp!}
                                parentClip={activeClip}
                                entity={activeEntityObject}
                                paramName={activePropName!}
                                descriptor={activePropDescriptor}
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

    private onCloseEditor = async (result: ExpressionEditor.EditorResult) => {
        if (!result.saved) {
            this.setState({editorOpened: false})
            return
        }

        const { activeClip } = this.props
        const { activeEntity, activePropName } = this.state

        if (!activeClip || !activeEntity || !activePropName) return

        if (activeEntity.type === 'clip') {
            this.props.context.executeOperation(ProjectModActions.modifyClipExpression, {
                clipId: activeClip.id,
                property: activePropName,
                expr: {
                language: 'typescript',
                code: result.code,
                }
            })
        } else {
            this.props.context.executeOperation(ProjectModActions.modifyEffectExpression, {
                clipId: activeClip.id,
                effectId: activeEntity.entityId,
                property: activePropName,
                expr: {
                    language: 'typescript',
                    code: result.code,
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

        this.setState({
            activeEntity: {
                type: entityType as 'clip' | 'effect',
                entityId,
            },
            activePropName: paramName,
        })
    }

    private valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame

        this.props.context.executeOperation(ProjectModActions.createOrModifyKeyframeForClip, {
            clipId: activeClip.id!,
            paramName: desc.paramName,
            frameOnClip,
            patch: { value }
        })

        this.props.context.executeOperation(AppActions.seekPreviewFrame, { frame: this.props.editor.currentPreviewFrame })
    }

    private effectValueChanged = (effectId: string, desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        const { activeEntity } = this.state
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame
        this.props.context.executeOperation(ProjectModActions.createOrModifyKeyframeForEffect, {
            clipId: activeClip.id,
            effectId,
            paramName: desc.paramName,
            frameOnClip,
            patch: {value}
        })

        this.props.context.executeOperation(AppActions.seekPreviewFrame, { frame: currentPreviewFrame })
    }

    private keyframeModified = (parentClipId: string, paramName: string, frameOnClip: number, patch: KeyframePatch) =>
    {
        const { activeEntity } = this.state
        if (!activeEntity) return

        if (activeEntity.type === 'clip') {
            this.props.context.executeOperation(ProjectModActions.createOrModifyKeyframeForClip, {
                clipId: parentClipId,
                paramName,
                frameOnClip,
                patch
            })
        } else {
            this.props.context.executeOperation(ProjectModActions.createOrModifyKeyframeForEffect, {
                clipId: parentClipId,
                effectId: activeEntity.entityId,
                paramName,
                frameOnClip,
                patch
            })
        }
    }

    private keyframeRemoved = (parentClipId: string, keyframeId: string) =>
    {
        const { activeEntity } = this.state
        if (!activeEntity) return

        if (activeEntity.type === 'clip') {
            this.props.context.executeOperation(ProjectModActions.removeKeyframe, { keyframeId: activeEntity.entityId })
        } else {
            this.props.context.executeOperation(ProjectModActions.removeKeyframeForEffect, {
                clipId: parentClipId,
                effectId: activeEntity.entityId,
                keyframeId
            })
        }
    }

    private _openExpressionEditor = (paramName: string) => {
        const {activeClip} = this.props
        this.setState({editorOpened: true, activePropName: paramName})
        this.forceUpdate()
    }

    private removeEffect = ({dataset}: MenuItemProps<{clipId: string, effectId: string}>) =>
    {
        this.setState({ editorOpened: false, activePropName: null, activeEntity: null }, () => {
            this.props.context.executeOperation(ProjectModActions.removeEffect, {
                holderClipId: dataset.clipId,
                effectId: dataset.effectId
            })
            this.props.context.executeOperation(AppActions.seekPreviewFrame, {
                frame: this.props.editor.currentPreviewFrame
            })
        })
    }

    private renderEffectProperties = () =>
    {
        const rendererStore = this.props.context.getStore(RendererStore)
        const { activeClip, editor, project: { project } } = this.props
        const { activeEntity, activePropName } = this.state
        const elements: React.ReactElement<any>[] = []

        if (!activeClip) return null

        activeClip.effects.forEach(effect => {
            try {
                const processorInfo = rendererStore.getPostEffectPlugins().find(entry => entry.id === effect.processor)!
                const descriptors = rendererStore.getPostEffectParametersById(effect.processor)!
                const propElements: React.ReactElement<any>[] = []

                descriptors.forEach(desc => {
                    const hasKeyframe = desc.animatable && (effect.keyframes[desc.paramName] || []).length !== 0

                    const value = activeClip
                        ? Delir.KeyframeHelper.calcKeyframeValueAt(editor.currentPreviewFrame, activeClip.placedFrame, desc, effect.keyframes[desc.paramName] || [])
                        : undefined

                    propElements.push((
                        <div
                            key={activeClip!.id + desc.paramName}
                            className={classnames(s.propItem, {
                                [s['propItem--active']]: activeEntity && activeEntity.type === 'effect' && activeEntity.entityId === effect.id && activePropName === desc.paramName,
                            })}
                            data-prop-name={desc.paramName}
                            data-entity-type='effect'
                            data-entity-id={effect.id}
                            onClick={this.selectProperty}
                        >
                            <ContextMenu>
                                <MenuItem label={t('contextMenu.expression')} onClick={() => this._openExpressionEditor(desc.paramName) } />
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
                                <DelirValueInput
                                    key={desc.paramName}
                                    assets={project ? project.assets : null}
                                    descriptor={desc}
                                    value={value!}
                                    onChange={this.effectValueChanged.bind(null, effect.id)}
                                />
                            </div>
                        </div>
                    ))
                })

                elements.push((
                    <div className={classnames(s.propItem, s['propItem--effectContainer'])}>
                        <div key={effect.id} className={classnames(s.propItem, s['propItem--header'])}>
                            <ContextMenu>
                                <MenuItem label={t('contextMenu.removeEffect')} data-clip-id={activeClip.id} data-effect-id={effect.id} onClick={this.removeEffect} />
                            </ContextMenu>
                            <i className='fa fa-magic' />
                            {`${processorInfo.name}`}
                        </div>
                        {...propElements}
                    </div>
                ))
            } catch (e) {
                if (e instanceof Delir.Exceptions.UnknownPluginReferenceException) {
                    elements.push((
                        <div className={classnames(s.propItem, s['propItem--effectContainer'])}　title={t('pluginMissing', {processorId: effect.processor})}>
                            <div key={effect.id} className={classnames(s.propItem, s['propItem--header'], s['propItem--pluginMissing'])}>
                                <ContextMenu>
                                    <MenuItem label={t('contextMenu.removeEffect')} data-clip-id={activeClip.id} data-effect-id={effect.id} onClick={this.removeEffect} />
                                </ContextMenu>
                                <i className='fa fa-exclamation' />
                                {`${effect.processor}`}
                            </div>
                        </div>
                    ))
                } else {
                    throw e
                }
            }
        })

        return elements
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

    private _getDescriptorByPropId(paramName: string | null)
    {
        const rendererStore = this.props.context.getStore(RendererStore)
        const activeEntityObject = this.activeEntityObject

        if (!activeEntityObject) return null

        let parameters: Delir.AnyParameterTypeDescriptor[]

        if (activeEntityObject instanceof Delir.Project.Clip) {
            const info = Delir.Engine.Renderers.getInfo(activeEntityObject.renderer)
            parameters = info ? info.parameter.properties : []
        } else if (activeEntityObject instanceof Delir.Project.Effect) {
            parameters = rendererStore.getPostEffectParametersById(activeEntityObject.processor) || []
        } else {
            throw new Error('Unexpected entity type')
        }

        return parameters.find(desc => desc.paramName === paramName) || null
    }
}))
