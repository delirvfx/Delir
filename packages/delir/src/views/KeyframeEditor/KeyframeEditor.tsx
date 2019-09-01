import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/react'
import classnames from 'classnames'
import { clipboard } from 'electron'
import _ from 'lodash'
import mouseWheel from 'mouse-wheel'
import React from 'react'
import { SpreadType } from '../../utils/Spread'
import { MeasurePoint } from '../../utils/TimePixelConversion'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import { ParameterTarget } from '../../domain/Editor/types'
import ProjectStore, { ProjectStoreState } from '../../domain/Project/ProjectStore'
import RendererStore from '../../domain/Renderer/RendererStore'

import { Button } from '../../components/Button'
import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu'
import { LabelInput } from '../../components/LabelInput'
import { Pane } from '../../components/Pane'
import { Workspace } from '../../components/Workspace'
import DelirValueInput from './_DelirValueInput'
import { EffectList, EffectListItem, EffectSortHandle } from './EffectList'
import ExpressionEditor from './ExpressionEditor'
import KeyframeGraph, { KeyframePatch } from './KeyframeGraph'
import { KeyframeMediator } from './KeyframeMediator'
import ScriptParamEditor from './ScriptParamEditor'

import { SortEndHandler } from 'react-sortable-hoc'
import { PX_PER_SEC } from '../Timeline/Timeline'
import t from './KeyframeEditor.i18n'
import s from './KeyframeEditor.sass'

export interface EditorResult {
  code: string | null
  target: ParameterTarget
}

interface OwnProps {
  activeComposition: SpreadType<Delir.Entity.Composition> | null
  activeClip: SpreadType<Delir.Entity.Clip> | null
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
  userCodeException: Delir.Exceptions.UserCodeException | null
  postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
}

interface State {
  graphWidth: number
  graphHeight: number
  keyframeViewViewBox: { width: number; height: number } | undefined
  editorOpened: boolean
  scriptParamEditorOpened: boolean
}

type Props = OwnProps & ConnectedProps & ContextProp

export const KeyframeEditor = withFleurContext(
  connectToStores(
    [EditorStore, ProjectStore, RendererStore],
    (getStore): ConnectedProps => ({
      editor: getStore(EditorStore).getState(),
      activeParam: getStore(EditorStore).getActiveParam(),
      project: getStore(ProjectStore).getState(),
      userCodeException: getStore(RendererStore).getUserCodeException(),
      postEffectPlugins: getStore(RendererStore).getPostEffectPlugins(),
    }),
  )(
    class KeyframeEditor extends React.Component<Props, State> {
      public static defaultProps: Partial<Props> = {
        scrollLeft: 0,
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

      public componentDidMount() {
        this._syncGraphHeight()
        window.addEventListener('resize', _.debounce(this._syncGraphHeight, 1000 / 30))
        mouseWheel(this.refs.svgParent, this.handleScrolling)
      }

      public componentDidUpdate(prevProps: Props) {
        if (this.props.activeClip && prevProps.activeClip && this.props.activeClip.id !== prevProps.activeClip.id) {
          this.setState({
            editorOpened: false,
            scriptParamEditorOpened: false,
          })
        }
      }

      public render() {
        const { activeClip, editor, activeParam, scrollLeft, postEffectPlugins, scale } = this.props
        const { keyframeViewViewBox, graphWidth, graphHeight, editorOpened, scriptParamEditorOpened } = this.state
        const activeEntityObject = this.activeEntityObject

        const activeParamDescriptor = activeParam ? this._getDescriptorByParamName(activeParam.paramName) : null

        const expressionCode =
          !activeEntityObject || !activeParam
            ? null
            : activeEntityObject.expressions[activeParam.paramName]
            ? activeEntityObject.expressions[activeParam.paramName].code
            : null

        let keyframes: ReadonlyArray<Delir.Entity.Keyframe> | null = null

        if (activeClip && activeParam) {
          if (activeParam.type === 'effect') {
            const activeEffect = activeClip.effects.find(e => e.id === activeParam.entityId)
            keyframes = activeEffect ? activeEffect.keyframes[activeParam.paramName] : null
          } else {
            keyframes = activeClip.keyframes[activeParam.paramName]
          }
        }

        return (
          <Workspace direction="horizontal" className={s.keyframeView}>
            <Pane className={s.paramList}>
              {activeClip && (
                <ContextMenu>
                  <MenuItem label={t(t.k.contextMenu.effect)}>
                    {postEffectPlugins.length ? (
                      postEffectPlugins.map(entry => (
                        <MenuItem
                          key={entry.id}
                          label={entry.name}
                          data-clip-id={activeClip.id}
                          data-effect-id={entry.id}
                          onClick={this.handleAddEffect}
                        />
                      ))
                    ) : (
                      <MenuItem label={t(t.k.contextMenu.pluginUnavailable)} enabled={false} />
                    )}
                  </MenuItem>
                </ContextMenu>
              )}
              {this.renderProperties()}
              <EffectList useDragHandle onSortEnd={this.handleSortEffect}>
                {this.renderEffectProperties()}
              </EffectList>
            </Pane>
            <Pane>
              <div ref="svgParent" className={s.keyframeContainer} tabIndex={-1} onWheel={this._scaleTimeline}>
                {activeParam && editorOpened && activeParamDescriptor && (
                  <ExpressionEditor
                    title={activeParamDescriptor.label}
                    target={activeParam}
                    code={expressionCode}
                    onClose={this.handleCloseExpressionEditor}
                  />
                )}
                {scriptParamEditorOpened &&
                  activeParam &&
                  activeParamDescriptor &&
                  activeParamDescriptor.type === 'CODE' &&
                  (() => {
                    const value = activeClip
                      ? Delir.KeyframeCalcurator.calcKeyframeValueAt(
                          editor.currentPreviewFrame,
                          activeClip.placedFrame,
                          activeParamDescriptor,
                          activeClip.keyframes[activeParam.paramName] || [],
                        )
                      : new Delir.Values.Expression('javascript', '')

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
                  <div
                    ref="mesures"
                    className={s.measureLayer}
                    style={{
                      transform: `translateX(-${scrollLeft}px)`,
                    }}
                  >
                    {...this._renderMeasure()}
                  </div>
                </div>
                {activeClip && activeParamDescriptor && activeParam && keyframes && (
                  <KeyframeMediator
                    activeClip={activeClip}
                    paramName={activeParam.paramName}
                    descriptor={activeParamDescriptor}
                    entity={activeEntityObject}
                    keyframeViewViewBox={keyframeViewViewBox}
                    graphWidth={graphWidth}
                    graphHeight={graphHeight}
                    scrollLeft={scrollLeft}
                    pxPerSec={PX_PER_SEC}
                    keyframes={keyframes}
                    scale={scale}
                    onRemoveKeyframe={this.handleRemoveKeyframe}
                    onModifyKeyframe={this.handleModifyKeyframe}
                  />
                )}
              </div>
            </Pane>
          </Workspace>
        )
      }

      private renderProperties = () => {
        const {
          activeClip,
          activeParam,
          project: { project },
          editor,
          userCodeException,
        } = this.props

        if (!activeClip) return null

        return this.clipParamDescriptors.map(desc => {
          const value = activeClip
            ? Delir.KeyframeCalcurator.calcKeyframeValueAt(
                editor.currentPreviewFrame,
                activeClip.placedFrame,
                desc,
                activeClip.keyframes[desc.paramName] || [],
              )
            : undefined

          const isSelected = activeParam && activeParam.type === 'clip' && activeParam.paramName === desc.paramName

          const hasKeyframe = desc.animatable && (activeClip.keyframes[desc.paramName] || []).length !== 0

          const hasExpression =
            activeClip.expressions[desc.paramName] && activeClip.expressions[desc.paramName].code !== ''
          const hasError =
            userCodeException &&
            userCodeException.location.type === 'clip' &&
            userCodeException.location.entityId === activeClip.id &&
            userCodeException.location.paramName === desc.paramName

          return (
            <div
              key={activeClip.id + desc.paramName}
              className={classnames(s.paramItem, {
                [s.paramItemActive]: isSelected,
                [s.paramItemError]: hasError,
              })}
              data-entity-type="clip"
              data-entity-id={activeClip.id}
              data-param-name={desc.paramName}
              onClick={this.selectProperty}
            >
              <ContextMenu>
                <MenuItem
                  label={t(t.k.contextMenu.expression)}
                  data-entity-type="clip"
                  data-entity-id={activeClip.id}
                  data-param-name={desc.paramName}
                  enabled={desc.animatable}
                  onClick={this.openExpressionEditor}
                />
                <MenuItem type="separator" />
                <MenuItem
                  label={t(t.k.contextMenu.copyParamName)}
                  data-param-name={desc.paramName}
                  onClick={this.handleCopyParamName}
                />
              </ContextMenu>
              <span
                className={classnames(s.paramIndicator, {
                  [s['paramIndicator--active']]: hasExpression,
                })}
                data-entity-type="clip"
                data-entity-id={activeClip.id}
                data-param-name={desc.paramName}
                onClick={this.handleClickExpressionIndicator}
              >
                {desc.animatable && <i className="twa twa-abcd" />}
              </span>
              <span
                className={classnames(s.paramIndicator, {
                  [s['paramIndicator--active']]: hasKeyframe,
                })}
              >
                {desc.animatable && <i className="twa twa-clock12" />}
              </span>
              <span className={s.paramItemName}>{desc.label}</span>
              <div className={s.paramItemInput}>
                {desc.type === 'CODE' ? (
                  <Button type="normal" onClick={this.handleOpenScriptParamEditor}>
                    {t(t.k.editScriptParam)}
                  </Button>
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
        })
      }

      private renderEffectProperties = () => {
        const rendererStore = this.props.getStore(RendererStore)

        const {
          activeClip,
          activeParam,
          editor,
          project: { project },
          userCodeException,
        } = this.props

        if (!activeClip) return null

        return activeClip.effects.map((effect, idx) => {
          const processorInfo = rendererStore.getPostEffectPlugins().find(entry => entry.id === effect.processor)!

          if (!processorInfo) {
            return (
              <EffectListItem index={idx}>
                <div
                  key={effect.id}
                  className={classnames(s.paramItem, s.paramItemEffectContainer)}
                  title={t(t.k.pluginMissing, {
                    processorId: effect.processor,
                  })}
                >
                  <div key={effect.id} className={classnames(s.paramItem, s.paramItemHeader, s.paramItemPluginMissing)}>
                    <ContextMenu>
                      <MenuItem
                        label={t(t.k.contextMenu.removeEffect)}
                        data-clip-id={activeClip.id}
                        data-effect-id={effect.id}
                        onClick={this.removeEffect}
                      />
                    </ContextMenu>
                    <i className="fa fa-exclamation" />
                    {effect.processor}
                  </div>
                </div>
              </EffectListItem>
            )
          }

          const descriptors: Delir.AnyParameterTypeDescriptor[] | null = rendererStore.getPostEffectParametersById(
            effect.processor,
          )!

          return (
            <EffectListItem key={effect.id} index={idx} className={classnames(s.paramItem, s.paramItemEffectContainer)}>
              <div className={classnames(s.paramItem, s.paramItemHeader)}>
                <ContextMenu>
                  <MenuItem
                    label={t(t.k.contextMenu.removeEffect)}
                    data-clip-id={activeClip.id}
                    data-effect-id={effect.id}
                    onClick={this.removeEffect}
                  />
                  <MenuItem type="separator" />
                  {effect.referenceName != null && (
                    <MenuItem
                      label={t(t.k.contextMenu.copyReferenceName)}
                      data-reference-name={effect.referenceName}
                      onClick={this.handleCopyReferenceName}
                    />
                  )}
                </ContextMenu>
                <EffectSortHandle />
                <i className="fa fa-magic" />
                <LabelInput
                  className={s.referenceNameInput}
                  doubleClickToEdit
                  placeholder={processorInfo.name}
                  defaultValue={effect.referenceName || ''}
                  onChange={this.handleChangeEffectReferenceName}
                  data-effect-id={effect.id}
                />
                {effect.referenceName != null && <span className={s.processorName}>{processorInfo.name}</span>}
              </div>

              {descriptors.map(desc => {
                const isSelected =
                  activeParam &&
                  activeParam.type === 'effect' &&
                  activeParam.entityId === effect.id &&
                  activeParam.paramName === desc.paramName

                const hasKeyframe = desc.animatable && (effect.keyframes[desc.paramName] || []).length !== 0

                const hasError =
                  userCodeException &&
                  userCodeException.location.type === 'effect' &&
                  userCodeException.location.entityId === effect.id &&
                  userCodeException.location.paramName === desc.paramName

                const hasExpression =
                  effect.expressions[desc.paramName] && effect.expressions[desc.paramName].code !== ''

                const value = activeClip
                  ? Delir.KeyframeCalcurator.calcKeyframeValueAt(
                      editor.currentPreviewFrame,
                      activeClip.placedFrame,
                      desc,
                      effect.keyframes[desc.paramName] || [],
                    )
                  : undefined

                return (
                  <div
                    key={`${activeClip.id}-${effect.id}-${desc.paramName}`}
                    className={classnames(s.paramItem, {
                      [s.paramItemActive]: isSelected,
                      [s.paramItemError]: hasError,
                    })}
                    data-entity-type="effect"
                    data-entity-id={effect.id}
                    data-param-name={desc.paramName}
                    onClick={this.selectProperty}
                  >
                    <ContextMenu>
                      <MenuItem
                        label={t(t.k.contextMenu.expression)}
                        data-entity-type="effect"
                        data-entity-id={effect.id}
                        data-param-name={desc.paramName}
                        onClick={this.openExpressionEditor}
                      />
                      <MenuItem type="separator" />
                      <MenuItem
                        label={t(t.k.contextMenu.copyParamName)}
                        data-param-name={desc.paramName}
                        onClick={this.handleCopyParamName}
                      />
                    </ContextMenu>
                    <span
                      className={classnames(s.paramIndicator, {
                        [s['paramIndicator--active']]: hasExpression,
                      })}
                      data-entity-type="effect"
                      data-entity-id={effect.id}
                      data-param-name={desc.paramName}
                      onDoubleClick={this.handleClickExpressionIndicator}
                    >
                      {desc.animatable && <i className="twa twa-abcd" />}
                    </span>
                    <span
                      className={classnames(s.paramIndicator, {
                        [s['paramIndicator--active']]: hasKeyframe,
                      })}
                    >
                      {desc.animatable && <i className="twa twa-clock12" />}
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
            </EffectListItem>
          )
        })
      }

      private _renderMeasure = (): JSX.Element[] => {
        const { activeComposition } = this.props
        if (!activeComposition) return []

        const { measures } = this.props
        const components: JSX.Element[] = []

        for (const point of measures) {
          components.push(
            <div
              key={point.index}
              className={classnames(s.measureLine, {
                [s['--grid']]: point.frameNumber % 10 === 0,
                [s['--endFrame']]: point.frameNumber === activeComposition.durationFrames,
              })}
              style={{ left: point.left }}
            >
              {point.frameNumber}
            </div>,
          )
        }

        return components
      }

      private get clipParamDescriptors() {
        const { activeClip } = this.props
        return activeClip ? Delir.Engine.Renderers.getInfo(activeClip.renderer).parameter.properties || [] : []
      }

      private get activeEntityObject(): SpreadType<Delir.Entity.Clip> | SpreadType<Delir.Entity.Effect> | null {
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

      private handleClickExpressionIndicator = ({ currentTarget }: React.MouseEvent<HTMLSpanElement>) => {
        const { entityType, entityId, paramName } = currentTarget.dataset

        this.props.executeOperation(EditorOps.changeActiveParam, {
          target: {
            type: entityType as 'clip' | 'effect',
            entityId: entityId!,
            paramName: paramName!,
          },
        })

        this.setState({ editorOpened: true })
      }

      private handleSortEffect: SortEndHandler = ({ oldIndex, newIndex }) => {
        const { activeClip } = this.props
        if (!activeClip) return

        const effectId = activeClip.effects[oldIndex].id
        this.props.executeOperation(ProjectOps.moveEffectOrder, { effectId, newIndex })
      }

      private handleCopyReferenceName = ({ dataset: { referenceName } }: MenuItemOption<{ referenceName: string }>) => {
        clipboard.writeText(referenceName)
      }

      private handleCopyParamName = ({ dataset: { paramName } }: MenuItemOption<{ paramName: string }>) => {
        clipboard.writeText(paramName)
      }

      private handleOpenScriptParamEditor = () => {
        this.setState({ scriptParamEditorOpened: true })
      }

      private handleCloseScriptParamEditor = (result: EditorResult) => {
        const { activeClip } = this.props
        if (!activeClip) return

        this.props.executeOperation(ProjectOps.createOrModifyClipKeyframe, {
          clipId: activeClip.id,
          frameOnClip: 0,
          paramName: result.target.paramName,
          patch: {
            value: new Delir.Values.Expression('javascript', result.code!),
          },
        })

        this.setState({ scriptParamEditorOpened: false })
      }

      private handleCloseExpressionEditor = (result: EditorResult) => {
        const { activeClip } = this.props
        if (!activeClip) return

        if (result.target.type === 'clip') {
          this.props.executeOperation(ProjectOps.modifyClipExpression, {
            clipId: activeClip.id,
            paramName: result.target.paramName,
            expr: {
              language: 'typescript',
              code: result.code!,
            },
          })
        } else {
          this.props.executeOperation(ProjectOps.modifyEffectExpression, {
            clipId: activeClip.id,
            effectId: result.target.entityId,
            paramName: result.target.paramName,
            expr: {
              language: 'typescript',
              code: result.code!,
            },
          })
        }

        this.setState({ editorOpened: false })
      }

      private handleAddEffect = ({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
        this.props.executeOperation(ProjectOps.addEffectIntoClip, {
          clipId: dataset.clipId,
          processorId: dataset.effectId,
        })
      }

      private _syncGraphHeight = () => {
        const box = this.refs.svgParent.getBoundingClientRect()

        this.setState({
          graphWidth: box.width,
          graphHeight: box.height,
          keyframeViewViewBox: { width: box.width, height: box.height },
        })
      }

      private _scaleTimeline = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
          const newScale = this.props.scale + e.deltaY * 0.05
          this.props.onScaled(Math.max(newScale, 0.1))
          e.preventDefault()
        }
      }

      private handleScrolling = (dx: number, dy: number) => {
        this.props.onScroll(dx, dy)
      }

      private selectProperty = ({ currentTarget }: React.MouseEvent<HTMLDivElement>) => {
        const { entityType, entityId, paramName } = currentTarget.dataset as {
          [_: string]: string
        }

        this.props.executeOperation(EditorOps.changeActiveParam, {
          target: {
            type: entityType as 'clip' | 'effect',
            entityId,
            paramName,
          },
        })
      }

      private valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) => {
        const {
          activeClip,
          editor: { currentPreviewFrame },
        } = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame

        this.props.executeOperation(ProjectOps.createOrModifyClipKeyframe, {
          clipId: activeClip.id!,
          paramName: desc.paramName,
          frameOnClip,
          patch: { value },
        })
      }

      private effectValueChanged = (effectId: string, desc: Delir.AnyParameterTypeDescriptor, value: any) => {
        const {
          activeClip,
          editor: { currentPreviewFrame },
        } = this.props
        if (!activeClip) return

        const frameOnClip = currentPreviewFrame - activeClip.placedFrame
        this.props.executeOperation(ProjectOps.createOrModifyKeyframeForEffect, {
          clipId: activeClip.id,
          effectId,
          paramName: desc.paramName,
          frameOnClip,
          patch: { value },
        })
      }

      private handleModifyKeyframe = (
        parentClipId: string,
        paramName: string,
        frameOnClip: number,
        patch: KeyframePatch,
      ) => {
        const { activeParam } = this.props
        if (!activeParam) return

        switch (activeParam.type) {
          case 'clip': {
            this.props.executeOperation(ProjectOps.createOrModifyClipKeyframe, {
              clipId: parentClipId,
              paramName,
              frameOnClip,
              patch,
            })
            break
          }

          case 'effect': {
            this.props.executeOperation(ProjectOps.createOrModifyKeyframeForEffect, {
              clipId: parentClipId,
              effectId: activeParam.entityId,
              paramName,
              frameOnClip,
              patch,
            })
            break
          }

          default: {
            throw new Error('unreachable')
          }
        }
      }

      private handleRemoveKeyframe = (parentClipId: string, keyframeId: string) => {
        const { activeParam } = this.props
        if (!activeParam) return

        if (activeParam.type === 'clip') {
          this.props.executeOperation(ProjectOps.removeKeyframe, {
            clipId: parentClipId,
            paramName: activeParam.paramName,
            keyframeId,
          })
        } else {
          this.props.executeOperation(ProjectOps.removeEffectKeyframe, {
            clipId: parentClipId,
            effectId: activeParam.entityId,
            paramName: activeParam.paramName,
            keyframeId,
          })
        }
      }

      private openExpressionEditor = ({
        dataset,
      }: MenuItemOption<{
        entityType: 'clip' | 'effect'
        entityId: string
        paramName: string
      }>) => {
        const { entityType, entityId, paramName } = dataset

        this.props.executeOperation(EditorOps.changeActiveParam, {
          target: { type: entityType, entityId, paramName },
        })

        this.setState({ editorOpened: true })
      }

      private removeEffect = ({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
        this.setState({ editorOpened: false }, () => {
          this.props.executeOperation(ProjectOps.removeEffect, {
            holderClipId: dataset.clipId,
            effectId: dataset.effectId,
          })
        })
      }

      private handleChangeEffectReferenceName = (referenceName: string, { effectId }: { effectId: string }) => {
        this.props.executeOperation(ProjectOps.modifyEffect, {
          clipId: this.props.activeClip!.id,
          effectId,
          patch: { referenceName: referenceName !== '' ? referenceName : null },
        })
      }

      private _getDescriptorByParamName(paramName: string | null) {
        const rendererStore = this.props.getStore(RendererStore)
        const { activeParam } = this.props
        const activeEntityObject = this.activeEntityObject

        if (!activeEntityObject || !activeParam) return null

        let parameters: Delir.AnyParameterTypeDescriptor[]

        if (activeParam.type === 'clip') {
          const info = Delir.Engine.Renderers.getInfo((activeEntityObject as Delir.Entity.Clip).renderer)
          parameters = info ? info.parameter.properties : []
        } else if (activeParam.type === 'effect') {
          parameters =
            rendererStore.getPostEffectParametersById((activeEntityObject as Delir.Entity.Effect).processor) || []
        } else {
          throw new Error('Unexpected entity type')
        }

        return parameters.find(desc => desc.paramName === paramName) || null
      }
    },
  ),
)
