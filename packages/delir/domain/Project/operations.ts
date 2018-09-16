import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { operation } from '@ragg/fleur'
import { safeAssign } from '../../utils/safeAssign'

import * as EditorOps from '../Editor/operations'
import { HistoryActions } from '../History/actions'
import RendererStore from '../Renderer/RendererStore'
import { ProjectActions } from './actions'
import ProjectStore from './ProjectStore'

import { AddAssetCommand } from './Commands/AddAssetCommand'
import { AddClipCommand } from './Commands/AddClipCommand'
import { AddEffectIntoClipCommand } from './Commands/AddEffectIntoClipCommand'
import { AddEffectKeyframeCommand } from './Commands/AddEffectKeyframeCommand'
import { AddKeyframeCommand } from './Commands/AddKeyframeCommand'
import { AddLayerCommand } from './Commands/AddLayerCommand'
import { CreateCompositionCommand } from './Commands/CreateCompositionCommand'
import { ModifyClipCommand } from './Commands/ModifyClipCommand'
import { ModifyClipExpressionCommand } from './Commands/ModifyClipExpressionCommand'
import { ModifyClipKeyframeCommand } from './Commands/ModifyClipKeyframeCommand'
import { ModifyCompositionCommand } from './Commands/ModifyCompositionCommand'
import { ModifyEffectExpressionCommand } from './Commands/ModifyEffectExpressionCommand'
import { ModifyEffectKeyframeCommand } from './Commands/ModifyEffectKeyframeCommand'
import { ModifyLayerCommand } from './Commands/ModifyLayerCommand'
import { MoveClipToLayerCommand } from './Commands/MoveClipToLayerCommand'
import { MoveLayerOrderCommand } from './Commands/MoveLayerOrderCommand'
import { RemoveAssetCommand } from './Commands/RemoveAssetCommand'
import { RemoveClipCommand } from './Commands/RemoveClipCommand'
import { RemoveCompositionCommand } from './Commands/RemoveCompositionCommand'
import { RemoveEffectCommand } from './Commands/RemoveEffectCommand'
import { RemoveEffectKeyframeCommand } from './Commands/RemoveEffectKeyframeCommand'
import { RemoveKeyframeCommand } from './Commands/RemoveKeyframeCommand'
import { RemoveLayerCommand } from './Commands/RemoveLayerCommand'

//
// Modify project
//
// @deprecated
export const createComposition = operation((context, options: {
    name: string,
    width: number,
    height: number,
    framerate: number,
    durationFrames: number,
    backgroundColor: Delir.Values.ColorRGB,
    samplingRate: number,
    audioChannels: number,
}) => {
    const composition = new Delir.Entity.Composition()
    safeAssign(composition, options, { layers: [ new Delir.Entity.Layer() ] })

    context.dispatch(HistoryActions.pushHistory, { command: new CreateCompositionCommand(composition) })
    context.dispatch(ProjectActions.createCompositionAction, { composition })
})

export const addLayer = operation((context, { targetCompositionId, layer }: {
    targetCompositionId: string,
    layer: Delir.Entity.Layer
}) => {
    context.dispatch(HistoryActions.pushHistory, { command: new AddLayerCommand(targetCompositionId, layer) })
    context.dispatch(ProjectActions.addLayerAction, { targetCompositionId, layer })
})

export const addLayerWithAsset = operation((context, { targetComposition, asset }: {
    targetComposition: Delir.Entity.Composition,
    asset: Delir.Entity.Asset
}) => {
    const processableRenderer = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => {
        return entry.handlableFileTypes.includes(asset.fileType)
    })[0]

    if (!processableRenderer) {
        context.executeOperation(EditorOps.notify, {
            message: `plugin not available for \`${asset.fileType}\``,
            title: '😢 Supported plugin not available',
            level: 'info',
            timeout: 5000
        })

        return
    }

    const assignablePropName = Delir.Engine.Renderers.getInfo(processableRenderer.id as any).assetAssignMap[asset.fileType]
    if (assignablePropName == null) return

    const layer = new Delir.Entity.Layer()
    const clip = new Delir.Entity.Clip()

    safeAssign(clip, {
        renderer: processableRenderer.id as any,
        placedFrame: 0,
        durationFrames: targetComposition.framerate,
        keyframes: {
            [assignablePropName]: [ safeAssign(new Delir.Entity.Keyframe(), { value: { assetId: asset.id } }) ],
        },
    })

    context.dispatch(HistoryActions.pushHistory, { command: new AddLayerCommand(targetComposition.id, layer) })

    context.dispatch(ProjectActions.addLayerWithAssetAction, {
        targetComposition,
        clip,
        asset,
        layer,
    })
})

export const addClip = operation((context, { layerId, clipRendererId, placedFrame = 0, durationFrames = 100 }: {
    layerId: string,
    clipRendererId: string,
    placedFrame: number,
    durationFrames: number,
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const composition = ProjectHelper.findParentCompositionByLayerId(project, layerId)!

    const newClip = safeAssign(new Delir.Entity.Clip(), {
        renderer: clipRendererId as any,
        placedFrame: placedFrame,
        durationFrames: durationFrames,
    })

    context.dispatch(HistoryActions.pushHistory, { command: new AddClipCommand(composition.id, layerId, newClip) })
    context.dispatch(ProjectActions.addClipAction, {
        newClip,
        targetLayerId: layerId,
    })
})

export const addClipWithAsset = operation((context, { targetLayerId, asset, placedFrame = 0, durationFrames = 100 }: {
    targetLayerId: string,
    asset: Delir.Entity.Asset,
    placedFrame?: number,
    durationFrames?: number,
}) => {
    const processablePlugin = Delir.Engine.Renderers.getAvailableRenderers()
        .filter((entry) => entry.handlableFileTypes.includes(asset.fileType))[0]

    // TODO: Support selection
    if (!processablePlugin) {
        context.executeOperation(EditorOps.notify, {
            message: `plugin not available for \`${asset.fileType}\``,
            title: '😢 Supported plugin not available',
            level: 'info',
            timeout: 3000
        })

        return
    }

    const paramName = Delir.Engine.Renderers.getInfo(processablePlugin.id as any).assetAssignMap[asset.fileType]
    if (!paramName) return

    const newClip = safeAssign(new Delir.Entity.Clip(), {
        renderer: processablePlugin.id as any,
        placedFrame,
        durationFrames,
        keyframes: {
            [paramName]: [
                safeAssign(new Delir.Entity.Keyframe(), {
                    frameOnClip: 0,
                    value: { assetId: asset.id },
                })
            ]
        }
    })

    const project = context.getStore(ProjectStore).getProject()!
    const parentComposition = ProjectHelper.findParentCompositionByLayerId(project, targetLayerId)!

    context.dispatch(HistoryActions.pushHistory, { command: new AddClipCommand(parentComposition.id, targetLayerId, newClip) })
    context.dispatch(ProjectActions.addClipAction, { targetLayerId, newClip })
})

export const createOrModifyClipKeyframe = operation((context, { clipId, paramName, frameOnClip, patch }: {
    clipId: string,
    paramName: string,
    frameOnClip: number,
    patch: Partial<Delir.Entity.Keyframe>
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const clip = ProjectHelper.findClipById(project, clipId)!

    const props = Delir.Engine.Renderers.getInfo(clip.renderer!).parameter.properties
    const propDesc = props ? props.find(prop => prop.paramName === paramName) : null
    if (!propDesc) return

    frameOnClip = frameOnClip < 0 ? 0 : Math.round(frameOnClip)

    if (propDesc.animatable === false) {
        frameOnClip = 0
    }

    const keyframe = ProjectHelper.findKeyframeFromClipByPropAndFrame(clip, paramName, frameOnClip)

    if (keyframe) {
        context.dispatch(HistoryActions.pushHistory, {
            command: new ModifyClipKeyframeCommand(keyframe.id, {...keyframe}, patch, clipId, paramName)
        })

        context.dispatch(ProjectActions.modifyKeyframeAction, {
            targetKeyframeId: keyframe.id,
            patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
        })
    } else {
        const newKeyframe = safeAssign(new Delir.Entity.Keyframe(), { frameOnClip }, patch)

        context.dispatch(HistoryActions.pushHistory, {
            command: new AddKeyframeCommand(clipId, paramName, newKeyframe)
        })

        context.dispatch(ProjectActions.addKeyframeAction, {
            targetClipId: clipId,
            paramName,
            keyframe: newKeyframe
        })
    }
})

export const createOrModifyKeyframeForEffect = operation((context, { clipId, effectId, paramName, frameOnClip, patch }: {
    clipId: string,
    effectId: string,
    paramName: string,
    frameOnClip: number,
    patch: Partial<Delir.Entity.Keyframe>
}) => {
    const rendererStore = context.getStore(RendererStore)
    const project = context.getStore(ProjectStore).getProject()!
    const clip = ProjectHelper.findClipById(project, clipId)!
    const effect = ProjectHelper.findEffectFromClipById(clip, effectId)!

    const props = rendererStore.getPostEffectParametersById(effect.processor)
    const propDesc = props ? props.find(prop => prop.paramName === paramName) : null
    if (!propDesc) return

    if (propDesc.animatable === false) {
        frameOnClip = 0
    }

    const keyframe = ProjectHelper.findKeyframeFromEffectByPropAndFrame(effect, paramName, frameOnClip)

    if (keyframe) {
        context.dispatch(HistoryActions.pushHistory, {
            command: new ModifyEffectKeyframeCommand(clipId, effectId, paramName, keyframe.id, {...keyframe}, patch),
        })

        context.dispatch(ProjectActions.modifyEffectKeyframeAction, {
            targetClipId: clipId,
            effectId: effectId,
            targetKeyframeId: keyframe.id,
            patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
        })
    } else {
        const newKeyframe = safeAssign(new Delir.Entity.Keyframe(), { frameOnClip }, patch)

        context.dispatch(HistoryActions.pushHistory, {
            command: new AddEffectKeyframeCommand(clipId, effectId, paramName, newKeyframe)
        })

        context.dispatch(ProjectActions.addEffectKeyframeAction, {
            targetClipId: clipId,
            targetEffectId: effectId,
            paramName,
            keyframe: newKeyframe,
        })
    }
})

export const addAsset = operation((context, { name, fileType, path }: {
    name: string,
    fileType: string,
    path: string
}) => {
    const asset = new Delir.Entity.Asset()
    asset.name = name
    asset.fileType = fileType
    asset.path = path

    context.dispatch(HistoryActions.pushHistory, { command: new AddAssetCommand(asset) })
    context.dispatch(ProjectActions.addAssetAction, { asset })
})

export const addEffectIntoClip = operation((context, { clipId, processorId }: {
    clipId: string,
    processorId: string
}) => {
    const effect = new Delir.Entity.Effect()
    effect.processor = processorId

    context.dispatch(HistoryActions.pushHistory, {
        command: new AddEffectIntoClipCommand(clipId, effect)
    })
    context.dispatch(ProjectActions.addEffectIntoClipAction, { clipId, effect })
})

export const removeAsset = operation((context, { assetId }: { assetId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const asset = ProjectHelper.findAssetById(project, assetId)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveAssetCommand(asset)
    })
    context.dispatch(ProjectActions.removeAssetAction, { targetAssetId: assetId })
})

export const moveClipToLayer = operation((context, { clipId, destLayerId }: {
    clipId: string,
    destLayerId: string
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const sourceLayer = ProjectHelper.findParentLayerByClipId(project, clipId)!
    const parentComposition = ProjectHelper.findParentCompositionByLayerId(project, sourceLayer.id)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new MoveClipToLayerCommand(sourceLayer.id, destLayerId, clipId, parentComposition.id)
    })
    context.dispatch(ProjectActions.moveClipToLayerAction, { destLayerId: destLayerId, clipId })
})

export const modifyComposition = operation((context, { compositionId, patch }: {
    compositionId: string,
    patch: Partial<Delir.Entity.Composition>
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const composition = ProjectHelper.findCompositionById(project, compositionId)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new ModifyCompositionCommand(compositionId, {...composition}, patch)
    })

    context.dispatch(ProjectActions.modifyCompositionAction, {
        targetCompositionId: compositionId,
        patch,
    })
})

export const modifyLayer = operation((context, { layerId, patch }: {
    layerId: string,
    patch: Partial<Delir.Entity.Layer>
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const layer = ProjectHelper.findLayerById(project, layerId)!
    const parentComposition = ProjectHelper.findParentCompositionByLayerId(project, layer.id)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new ModifyLayerCommand(layerId, {...layer}, patch, parentComposition.id)
    })

    context.dispatch(ProjectActions.modifyLayerAction, {
        targetLayerId: layerId,
        patch: patch,
    })
})

export const modifyClip = operation((context, { clipId, patch }: {
    clipId: string,
    patch: Partial<Delir.Entity.Clip>
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const clip = ProjectHelper.findClipById(project, clipId)!
    const layer = ProjectHelper.findParentLayerByClipId(project, clipId)!
    const composition = ProjectHelper.findParentCompositionByLayerId(project, layer.id)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new ModifyClipCommand(composition.id, clipId, { ...clip }, { ...patch })
    })

    context.dispatch(ProjectActions.modifyClipAction, {
        targetClipId: clipId,
        patch: patch,
    })
})

export const modifyClipExpression = operation((context, { clipId, paramName, expr }: {
    clipId: string,
    paramName: string,
    expr: { language: string, code: string }
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const clip = ProjectHelper.findClipById(project, clipId)!

    const newExpression = new Delir.Values.Expression(expr.language, expr.code)

    context.dispatch(HistoryActions.pushHistory, {
        command: new ModifyClipExpressionCommand(clipId, paramName, clip.expressions[paramName], newExpression)
    })

    context.dispatch(ProjectActions.modifyClipExpressionAction, {
        targetClipId: clipId,
        targetProperty: paramName,
        expression: newExpression,
    })
})

export const modifyEffectExpression = operation((context, { clipId, effectId, paramName, expr }: {
    clipId: string,
    effectId: string,
    paramName: string,
    expr: { language: string, code: string }
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const clip = ProjectHelper.findClipById(project, clipId)!
    const effect = ProjectHelper.findEffectFromClipById(clip, effectId)!

    const newExpression = new Delir.Values.Expression(expr.language, expr.code)

    context.dispatch(HistoryActions.pushHistory, {
        command: new ModifyEffectExpressionCommand(clipId, effectId, paramName, effect.expressions[paramName], newExpression)
    })

    context.dispatch(ProjectActions.modifyEffectExpressionAction, {
        targetClipId: clipId,
        targetEffectId: effectId,
        paramName: paramName,
        expression: newExpression,
    })
})

export const moveLayerOrder = operation((context, { layerId, newIndex }: { layerId: string, newIndex: number }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const comp = ProjectHelper.findParentCompositionByLayerId(project, layerId)!

    const previousIndex = comp.layers.findIndex(layer => layer.id === layerId)

    context.dispatch(HistoryActions.pushHistory, {
        command: new MoveLayerOrderCommand(comp.id, layerId, previousIndex, newIndex)
    })

    context.dispatch(ProjectActions.moveLayerOrderAction, {
        parentCompositionId: comp.id,
        targetLayerId: layerId,
        newIndex,
    })
})

export const removeComposition = operation((context, { compositionId }: { compositionId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const composition = ProjectHelper.findCompositionById(project, compositionId)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveCompositionCommand(composition)
    })

    context.dispatch(ProjectActions.removeCompositionAction, { targetCompositionId: compositionId })
})

export const removeLayer = operation((context, { layerId }: { layerId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const removingLayer = ProjectHelper.findLayerById(project, layerId)!
    const parentComposition = ProjectHelper.findParentCompositionByLayerId(project, layerId)!
    const index = parentComposition.layers.findIndex(layer => layer.id === removingLayer.id)

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveLayerCommand(parentComposition.id, removingLayer, index)
    })
    context.dispatch(ProjectActions.removeLayerAction, { targetLayerId: layerId })
})

export const removeClip = operation((context, { clipId }: { clipId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const parentLayer = ProjectHelper.findParentLayerByClipId(project, clipId)!
    const composition = ProjectHelper.findParentCompositionByLayerId(project, parentLayer.id)!
    const clip = ProjectHelper.findClipById(project, clipId)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveClipCommand( parentLayer.id, clip, composition.id)
    })
    context.dispatch(ProjectActions.removeClipAction, { targetClipId: clipId })
})

export const removeKeyframe = operation((context, { keyframeId }: { keyframeId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const keyframe = ProjectHelper.findKeyframeById(project, keyframeId)!
    const { clip, paramName } = ProjectHelper.findParentClipAndPropNameByKeyframeId(project, keyframeId)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveKeyframeCommand(clip.id, paramName, keyframe),
    })
    context.dispatch(ProjectActions.removeKeyframeAction, { targetKeyframeId: keyframeId })
})

export const removeEffectKeyframe = operation((context, { clipId, effectId, keyframeId }: {
    clipId: string,
    effectId: string,
    keyframeId: string
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const { effect, paramName } = ProjectHelper.findParentEffectAndParamNameByClipIdAndKeyframeId(project, clipId, keyframeId)!
    const keyframe = ProjectHelper.findEffectKeyframeFromEffectById(effect, keyframeId)!

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveEffectKeyframeCommand(clipId, effectId, paramName, keyframe)
    })
    context.dispatch(ProjectActions.removeEffectKeyframeAction, { clipId, effectId, targetKeyframeId: keyframeId })
})

export const removeEffect = operation((context, { holderClipId, effectId }: {
    holderClipId: string,
    effectId: string
}) => {
    const project = context.getStore(ProjectStore).getProject()!
    const holderClip = ProjectHelper.findClipById(project, holderClipId)!
    const effect = ProjectHelper.findEffectById(project, effectId)!
    const index = holderClip.effects.findIndex(effect => effect.id === effectId)

    context.dispatch(HistoryActions.pushHistory, {
        command: new RemoveEffectCommand(holderClipId, effect, index),
    })
    context.dispatch(ProjectActions.removeEffectFromClipAction, { holderClipId, targetEffectId: effectId })
})
