import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, useFleurContext, useStore, withFleurContext } from '@fleur/react'
import classnames from 'classnames'
import { clipboard } from 'electron'
import _ from 'lodash'
import mouseWheel from 'mouse-wheel'
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform } from 'utils/platform'
import { SpreadType } from '../../utils/Spread'
import { MeasurePoint } from '../../utils/TimePixelConversion'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { useChangedEffect } from '@hanakla/arma'
import { PropertyInput } from 'components/PropertyInput/PropertyInput'
import { getActiveComp } from 'domain/Editor/selectors'
import { memo } from 'react'
import { useCallback } from 'react'
import { SortEndHandler } from 'react-sortable-hoc'
import { useObjectState } from 'utils/hooks'
import { Button } from '../../components/Button'
import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu'
import { LabelInput } from '../../components/LabelInput'
import { Pane } from '../../components/Pane'
import { Workspace } from '../../components/Workspace'
import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import { ParameterTarget } from '../../domain/Editor/types'
import ProjectStore, { ProjectStoreState } from '../../domain/Project/ProjectStore'
import RendererStore from '../../domain/Renderer/RendererStore'
import { PX_PER_SEC } from '../Timeline/Timeline'
import { EffectList, EffectListItem, EffectSortHandle } from './EffectList'
import ExpressionEditor from './ExpressionEditor'
import t from './KeyframeEditor.i18n'
import s from './KeyframeEditor.sass'
import { KeyframePatch } from './KeyframeGraph'
import { KeyframeMediator } from './KeyframeMediator'
import { ScriptParamEditor } from './ScriptParamEditor'

export interface EditorResult {
  code: string | null
  target: ParameterTarget
}

interface Props {
  activeClip: SpreadType<Delir.Entity.Clip> | null
  scrollLeft: number
  scale: number
  measures: MeasurePoint[]
  onScroll: (dx: number, dy: number) => void
  onScaled: (scale: number) => void
}
interface State {
  graphWidth: number
  graphHeight: number
  keyframeViewViewBox: { width: number; height: number } | undefined
  editorOpened: boolean
  scriptParamEditorOpened: boolean
}

const Measures = memo(({ measures }: { measures: MeasurePoint[] }) => {
  const { activeComp } = useStore((getStore) => ({
    activeComp: getActiveComp(getStore),
  }))

  if (!activeComp) return null

  return (
    <>
      {measures.map((point) => (
        <div
          key={point.index}
          className={classnames(s.measureLine, {
            [s['--grid']]: point.frameNumber % 10 === 0,
            [s['--endFrame']]: point.frameNumber === activeComp.durationFrames,
          })}
          style={{ left: point.left }}
        >
          {point.frameNumber}
        </div>
      ))}
    </>
  )
})

// const EffectList = styled.div<{ opened: boolean }>`
//   position: absolute;
//   bottom: calc(100% + 4px);
//   z-index: 1;
//   width: 100%;
//   background-color: ${cssVars.colors.popupBg};
//   visibility: hidden;
//   pointer-events: none;
//   transition-property: visibility ${cssVars.animate.bgColorDuration} ${cssVars.animate.function};
//   border-radius: ${cssVars.size.radius};
//   box-shadow: ${cssVars.style.popupDropshadow};

//   ${({ opened }) =>
//     opened &&
//     `
//       visibility: visible;
//       pointer-events: all;
//   `}
// `

// const EffectEntry = styled.div`
//   padding: 4px;
//   transition: background-color ${cssVars.animate.bgColorDuration} ${cssVars.animate.function};

//   &:hover {
//     background-color: ${cssVars.colors.listItemHovered};
//   }
// `

// const AddEffectButton = ({ clipId }: { clipId: string }) => {
//   const { executeOperation } = useFleurContext()
//   const [opened, setOpened] = useState(false)
//   const effects = useStore(getStore => getStore(RendererStore).getPostEffectPlugins())

//   const handleClickOpen = useCallback(() => {
//     setOpened(opened => !opened)
//   }, [])

//   const handleClickEntry = useCallback(({ currentTarget }: MouseEvent<HTMLDivElement>) => {
//     setOpened(false)
//     executeOperation(ProjectOps.addEffectIntoClip, { clipId, processorId: currentTarget.dataset.processorId! })
//   }, [])

//   return (
//     <div style={{ position: 'relative' }}>
//       <Button blocked style={{ margin: '8px 0' }} onClick={handleClickOpen}>
//         <span style={{ marginRight: '8px' }}>
//           <Icon kind="plus" />
//         </span>
//         Add Effect
//       </Button>
//       <EffectList opened={opened}>
//         {effects.map(entry => (
//           <EffectEntry data-processor-id={entry.id} onClick={handleClickEntry}>
//             {entry.name}
//           </EffectEntry>
//         ))}
//       </EffectList>
//     </div>
//   )
// }

export function KeyframeEditor({ activeClip, measures, onScaled, onScroll, scale, scrollLeft = 0 }: Props) {
  const { getStore, executeOperation } = useFleurContext()

  const svgParent = useRef<HTMLDivElement | null>(null)
  const { editor, activeParam, project, userCodeException, postEffectPlugins } = useStore((get) => ({
    editor: get(EditorStore).getState(),
    activeParam: get(EditorStore).getActiveParam() as ParameterTarget | null,
    project: get(ProjectStore).getState().project,
    userCodeException: get(RendererStore).getUserCodeException(),
    postEffectPlugins: get(RendererStore).getPostEffectPlugins(),
  }))

  const [
    { graphWidth, graphHeight, keyframeViewViewBox, editorOpened, scriptParamEditorOpened },
    setState,
  ] = useObjectState<State>({
    graphWidth: 0,
    graphHeight: 0,
    keyframeViewViewBox: undefined,
    editorOpened: false,
    scriptParamEditorOpened: false,
  })

  useEffect(() => {
    _syncGraphHeight()
    window.addEventListener('resize', _.debounce(_syncGraphHeight, 1000 / 30))

    mouseWheel(svgParent.current!, (dx: number, dy: number) => {
      onScroll(dx, dy)
    })
  }, [])

  useChangedEffect(() => {
    if (!activeClip) return

    setState({
      editorOpened: false,
      scriptParamEditorOpened: false,
    })
  }, [activeClip?.id])

  const activeEntityObject = useMemo(() => {
    if (!activeClip) return null

    if (activeParam?.type === 'effect') {
      return activeClip.effects.find((e) => e.id === activeParam.entityId)!
    } else {
      return activeClip
    }
  }, [activeClip])

  const activeParamDescriptor = useMemo(() => {
    if (!activeEntityObject || !activeParam) return null

    const rendererStore = getStore(RendererStore)
    let parameters: Delir.AnyParameterTypeDescriptor[]

    if (activeParam.type === 'clip') {
      const info = Delir.Engine.Renderers.getInfo((activeEntityObject as Delir.Entity.Clip).renderer)
      parameters = info?.parameter.properties ?? []
    } else if (activeParam.type === 'effect') {
      parameters =
        rendererStore.getPostEffectParametersById((activeEntityObject as Delir.Entity.Effect).processor) ?? []
    } else {
      throw new Error('Unexpected entity type')
    }

    return parameters.find((desc) => desc.paramName === activeParam.paramName) ?? null
  }, [activeEntityObject, activeParam])

  // prettier-ignore
  const expressionCode = !activeEntityObject || !activeParam ? null
    : activeEntityObject.expressions[activeParam.paramName]?.code ??  null

  const keyframes: ReadonlyArray<Delir.Entity.Keyframe> | null = useMemo(() => {
    if (!activeClip || !activeParam) return null

    if (activeParam.type === 'effect') {
      const activeEffect = activeClip.effects.find((e) => e.id === activeParam.entityId)
      return activeEffect?.keyframes[activeParam.paramName] ?? null
    } else {
      return activeClip.keyframes[activeParam.paramName]
    }
  }, [activeParam, activeClip])

  const clipParamDescriptors = useMemo(() => {
    return activeClip ? Delir.Engine.Renderers.getInfo(activeClip.renderer).parameter.properties || [] : []
  }, [activeClip])

  const _syncGraphHeight = useCallback(() => {
    const box = svgParent.current!.getBoundingClientRect()

    setState({
      graphWidth: box.width,
      graphHeight: box.height,
      keyframeViewViewBox: { width: box.width, height: box.height },
    })
  }, [])

  const selectProperty = useCallback(({ currentTarget }: React.MouseEvent<HTMLDivElement>) => {
    const { entityType, entityId, paramName } = currentTarget.dataset as {
      [_: string]: string
    }

    executeOperation(EditorOps.changeActiveParam, {
      target: {
        type: entityType as 'clip' | 'effect',
        entityId,
        paramName,
      },
    })
  }, [])

  const openExpressionEditor = useCallback(
    ({
      dataset,
    }: MenuItemOption<{
      entityType: 'clip' | 'effect'
      entityId: string
      paramName: string
    }>) => {
      const { entityType, entityId, paramName } = dataset

      executeOperation(EditorOps.changeActiveParam, {
        target: { type: entityType, entityId, paramName },
      })

      setState({ editorOpened: true })
    },
    [],
  )

  const handleCopyParamName = useCallback(({ dataset: { paramName } }: MenuItemOption<{ paramName: string }>) => {
    clipboard.writeText(paramName)
  }, [])

  const handleClickExpressionIndicator = useCallback(({ currentTarget }: React.MouseEvent<HTMLSpanElement>) => {
    const { entityType, entityId, paramName } = currentTarget.dataset

    executeOperation(EditorOps.changeActiveParam, {
      target: {
        type: entityType as 'clip' | 'effect',
        entityId: entityId!,
        paramName: paramName!,
      },
    })

    setState({ editorOpened: true })
  }, [])

  const handleOpenScriptParamEditor = useCallback(() => {
    setState({ scriptParamEditorOpened: true })
  }, [])

  const handleParamValueChanged = useCallback(
    (desc: Delir.AnyParameterTypeDescriptor, value: any) => {
      if (!activeClip) return

      const { currentPreviewFrame } = getStore(EditorStore).getState()
      const frameOnClip = currentPreviewFrame - activeClip.placedFrame

      executeOperation(ProjectOps.createOrModifyClipKeyframe, {
        clipId: activeClip.id!,
        paramName: desc.paramName,
        frameOnClip,
        patch: { value },
      })
    },
    [activeClip],
  )

  const handleSortEffect: SortEndHandler = useCallback(
    ({ oldIndex, newIndex }) => {
      if (!activeClip) return

      const effectId = activeClip.effects[oldIndex].id
      executeOperation(ProjectOps.moveEffectOrder, { effectId, newIndex })
    },
    [activeClip],
  )

  const handleAddEffect = useCallback(({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
    executeOperation(ProjectOps.addEffectIntoClip, {
      clipId: dataset.clipId,
      processorId: dataset.effectId,
    })
  }, [])

  const removeEffect = useCallback(({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
    setState({ editorOpened: false })

    executeOperation(ProjectOps.removeEffect, {
      holderClipId: dataset.clipId,
      effectId: dataset.effectId,
    })
  }, [])

  const handleCopyReferenceName = useCallback(
    ({ dataset: { referenceName } }: MenuItemOption<{ referenceName: string }>) => {
      clipboard.writeText(referenceName)
    },
    [],
  )

  const handleChangeEffectReferenceName = useCallback(
    (referenceName: string, { effectId }: { effectId: string }) => {
      executeOperation(ProjectOps.modifyEffect, {
        clipId: activeClip!.id,
        effectId,
        patch: { referenceName: referenceName !== '' ? referenceName : null },
      })
    },
    [activeClip],
  )

  const effectValueChanged = useCallback(
    (effectId: string, desc: Delir.AnyParameterTypeDescriptor, value: any) => {
      if (!activeClip) return

      const { currentPreviewFrame } = getStore(EditorStore).getState()
      const frameOnClip = currentPreviewFrame - activeClip.placedFrame
      executeOperation(ProjectOps.createOrModifyEffectKeyframe, {
        clipId: activeClip.id,
        effectId,
        paramName: desc.paramName,
        frameOnClip,
        patch: { value },
      })
    },
    [activeClip],
  )

  const _scaleTimeline = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (Platform.isMacOS && e.ctrlKey) {
        onScaled(Math.max(scale - e.deltaY * 0.1, 0.1))
        return
      }

      if (e.altKey) {
        const newScale = scale + e.deltaY * 0.05
        onScaled(Math.max(newScale, 0.1))
        e.preventDefault()
      }
    },
    [scale, onScaled],
  )

  const handleCloseScriptParamEditor = useCallback(
    (result: EditorResult) => {
      if (!activeClip) return

      if (result.target.type === 'clip') {
        executeOperation(ProjectOps.createOrModifyClipKeyframe, {
          clipId: result.target.entityId,
          frameOnClip: 0,
          paramName: result.target.paramName,
          patch: {
            value: new Delir.Values.Expression('javascript', result.code!),
          },
        })
      } else if (result.target.type === 'effect') {
        executeOperation(ProjectOps.createOrModifyEffectKeyframe, {
          clipId: activeClip.id,
          effectId: result.target.entityId,
          frameOnClip: 0,
          paramName: result.target.paramName,
          patch: {
            value: new Delir.Values.Expression('javascript', result.code!),
          },
        })
      }

      setState({ scriptParamEditorOpened: false })
    },
    [activeClip],
  )

  const handleCloseExpressionEditor = useCallback(
    (result: EditorResult) => {
      if (!activeClip) return

      if (result.target.type === 'clip') {
        executeOperation(ProjectOps.modifyClipExpression, {
          clipId: activeClip.id,
          paramName: result.target.paramName,
          expr: {
            language: 'typescript',
            code: result.code!,
          },
        })
      } else {
        executeOperation(ProjectOps.modifyEffectExpression, {
          clipId: activeClip.id,
          effectId: result.target.entityId,
          paramName: result.target.paramName,
          expr: {
            language: 'typescript',
            code: result.code!,
          },
        })
      }

      setState({ editorOpened: false })
    },
    [activeClip],
  )

  const handleModifyKeyframe = useCallback(
    (parentClipId: string, paramName: string, frameOnClip: number, patch: KeyframePatch) => {
      if (!activeParam) return

      switch (activeParam.type) {
        case 'clip': {
          executeOperation(ProjectOps.createOrModifyClipKeyframe, {
            clipId: parentClipId,
            paramName,
            frameOnClip,
            patch,
          })
          break
        }

        case 'effect': {
          executeOperation(ProjectOps.createOrModifyEffectKeyframe, {
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
    },
    [activeParam],
  )

  const handleRemoveKeyframe = useCallback(
    (parentClipId: string, keyframeId: string) => {
      if (!activeParam) return

      if (activeParam.type === 'clip') {
        executeOperation(ProjectOps.removeKeyframe, {
          clipId: parentClipId,
          paramName: activeParam.paramName,
          keyframeId,
        })
      } else {
        executeOperation(ProjectOps.removeEffectKeyframe, {
          clipId: parentClipId,
          effectId: activeParam.entityId,
          paramName: activeParam.paramName,
          keyframeId,
        })
      }
    },
    [activeParam],
  )

  const renderProperties = () => {
    if (!activeClip) return null

    return clipParamDescriptors.map((desc) => {
      const value = activeClip
        ? Delir.KeyframeCalcurator.calcKeyframeAt(
            editor.currentPreviewFrame,
            activeClip.placedFrame,
            desc,
            activeClip.keyframes[desc.paramName] || [],
          )
        : undefined

      const isSelected = activeParam?.type === 'clip' && activeParam?.paramName === desc.paramName

      const hasKeyframe = desc.animatable && (activeClip.keyframes[desc.paramName] || []).length !== 0

      const hasExpression = activeClip.expressions[desc.paramName]?.code !== ''
      const hasError =
        userCodeException?.location.type === 'clip' &&
        userCodeException?.location.entityId === activeClip.id &&
        userCodeException?.location.paramName === desc.paramName

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
          onClick={selectProperty}
        >
          <ContextMenu>
            <MenuItem
              label={t(t.k.contextMenu.expression)}
              data-entity-type="clip"
              data-entity-id={activeClip.id}
              data-param-name={desc.paramName}
              enabled={desc.animatable}
              onClick={openExpressionEditor}
            />
            <MenuItem type="separator" />
            <MenuItem
              label={t(t.k.contextMenu.copyParamName)}
              data-param-name={desc.paramName}
              onClick={handleCopyParamName}
            />
          </ContextMenu>
          <span
            className={classnames(s.paramIndicator, {
              [s['paramIndicator--active']]: hasExpression,
            })}
            data-entity-type="clip"
            data-entity-id={activeClip.id}
            data-param-name={desc.paramName}
            onClick={handleClickExpressionIndicator}
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
              <div>
                <Button kind="normal" onClick={handleOpenScriptParamEditor}>
                  {t(t.k.editScriptParam)}
                </Button>
              </div>
            ) : (
              <PropertyInput
                assets={project?.assets ?? null}
                descriptor={desc}
                value={value!}
                onChange={handleParamValueChanged}
              />
            )}
          </div>
        </div>
      )
    })
  }

  const renderEffectProperties = () => {
    if (!activeClip) return null

    const rendererStore = getStore(RendererStore)

    return activeClip.effects.map((effect, idx) => {
      const processorInfo = rendererStore.getPostEffectPlugins().find((entry) => entry.id === effect.processor)!

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
                    onClick={removeEffect}
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
                onClick={removeEffect}
              />
              <MenuItem type="separator" />
              {effect.referenceName != null && (
                <MenuItem
                  label={t(t.k.contextMenu.copyReferenceName)}
                  data-reference-name={effect.referenceName}
                  onClick={handleCopyReferenceName}
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
              onChange={handleChangeEffectReferenceName}
              data-effect-id={effect.id}
            />
            {effect.referenceName != null && <span className={s.processorName}>{processorInfo.name}</span>}
          </div>

          {descriptors.map((desc) => {
            const isSelected =
              activeParam?.type === 'effect' &&
              activeParam?.entityId === effect.id &&
              activeParam?.paramName === desc.paramName

            const hasKeyframe = desc.animatable && (effect.keyframes[desc.paramName] || []).length !== 0

            const hasError =
              userCodeException?.location.type === 'effect' &&
              userCodeException?.location.entityId === effect.id &&
              userCodeException?.location.paramName === desc.paramName

            const hasExpression = effect.expressions[desc.paramName]?.code !== ''

            const value = activeClip
              ? Delir.KeyframeCalcurator.calcKeyframeAt(
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
                onClick={selectProperty}
              >
                <ContextMenu>
                  <MenuItem
                    label={t(t.k.contextMenu.expression)}
                    data-entity-type="effect"
                    data-entity-id={effect.id}
                    data-param-name={desc.paramName}
                    onClick={openExpressionEditor}
                  />
                  <MenuItem type="separator" />
                  <MenuItem
                    label={t(t.k.contextMenu.copyParamName)}
                    data-param-name={desc.paramName}
                    onClick={handleCopyParamName}
                  />
                </ContextMenu>
                <span
                  className={classnames(s.paramIndicator, {
                    [s['paramIndicator--active']]: hasExpression,
                  })}
                  data-entity-type="effect"
                  data-entity-id={effect.id}
                  data-param-name={desc.paramName}
                  onDoubleClick={handleClickExpressionIndicator}
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
                    <div>
                      <Button kind="normal" onClick={handleOpenScriptParamEditor}>
                        {t(t.k.editScriptParam)}
                      </Button>
                    </div>
                  ) : (
                    <PropertyInput
                      key={desc.paramName}
                      assets={project ? project.assets : null}
                      descriptor={desc}
                      value={value!}
                      onChange={effectValueChanged.bind(null, effect.id)}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </EffectListItem>
      )
    })
  }

  return (
    <Workspace direction="horizontal" className={s.keyframeView}>
      <Pane className={s.paramList}>
        {activeClip && (
          <ContextMenu>
            <MenuItem label={t(t.k.contextMenu.effect)}>
              {postEffectPlugins.length ? (
                postEffectPlugins.map((entry) => (
                  <MenuItem
                    key={entry.id}
                    label={entry.name}
                    data-clip-id={activeClip.id}
                    data-effect-id={entry.id}
                    onClick={handleAddEffect}
                  />
                ))
              ) : (
                <MenuItem label={t(t.k.contextMenu.pluginUnavailable)} enabled={false} />
              )}
            </MenuItem>
          </ContextMenu>
        )}
        {renderProperties()}
        <EffectList useDragHandle onSortEnd={handleSortEffect}>
          {renderEffectProperties()}
        </EffectList>
        {/* {activeClip && <AddEffectButton clipId={activeClip.id} />} */}
      </Pane>
      <Pane>
        <div ref={svgParent} className={s.keyframeContainer} tabIndex={-1} onWheel={_scaleTimeline}>
          {activeParam && editorOpened && activeParamDescriptor && (
            <ExpressionEditor
              title={activeParamDescriptor.label}
              target={activeParam}
              code={expressionCode}
              onClose={handleCloseExpressionEditor}
            />
          )}
          {scriptParamEditorOpened &&
            activeParam &&
            activeParamDescriptor &&
            activeParamDescriptor.type === 'CODE' &&
            (() => {
              if (!activeClip || !activeEntityObject) return null

              const value = Delir.KeyframeCalcurator.calcKeyframeAt(
                editor.currentPreviewFrame,
                activeClip.placedFrame,
                activeParamDescriptor,
                activeEntityObject?.keyframes[activeParam.paramName] || [],
              ) as Delir.Values.Expression

              return (
                <ScriptParamEditor
                  title={activeParamDescriptor.label}
                  target={activeParam}
                  langType={value.language}
                  code={value.code}
                  onClose={handleCloseScriptParamEditor}
                />
              )
            })()}
          <div className={s.measureContainer}>
            <div
              className={s.measureLayer}
              style={{
                transform: `translateX(-${scrollLeft}px)`,
              }}
            >
              <Measures measures={measures} />
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
              onRemoveKeyframe={handleRemoveKeyframe}
              onModifyKeyframe={handleModifyKeyframe}
            />
          )}
        </div>
      </Pane>
    </Workspace>
  )
}
