import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { operation } from '@ragg/fleur'

import * as EditorOps from '../Editor/operations'
import RendererStore from '../Renderer/RendererStore'
import { ProjectActions } from './actions'
import ProjectStore from './ProjectStore'

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
    Object.assign(composition, options)
    context.dispatch(ProjectActions.createCompositionAction, { composition })
})

export const addLayer = operation((context, { targetComposition, layer }: {
    targetComposition: Delir.Entity.Composition,
    layer: Delir.Entity.Layer
}) => {
    context.dispatch(ProjectActions.addLayerAction, { targetComposition, layer })
})

export const addLayerWithAsset = operation((context, { targetComposition, asset }: {
    targetComposition: Delir.Entity.Composition,
    asset: Delir.Entity.Asset
}) => {
    const processablePlugins = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => {
        return entry.handlableFileTypes.includes(asset.fileType)
    })

    // TODO: Support selection
    if (processablePlugins.length === 0) {
        context.executeOperation(EditorOps.notify, {
            message: `plugin not available for \`${asset.fileType}\``,
            title: '😢 Supported plugin not available',
            level: 'info',
            timeout: 5000
        })

        return
    }

    const clip = new Delir.Entity.Clip()
    Object.assign(clip, {
        renderer: processablePlugins[0].id,
        placedFrame: 0,
        durationFrames: targetComposition.framerate,
    })

    context.dispatch(ProjectActions.addLayerWithAssetAction, {
        targetComposition,
        clip,
        asset,
    })
})

export const createClip = operation((context, { layerId, clipRendererId, placedFrame = 0, durationFrames = 100 }: {
    layerId: string,
    clipRendererId: string,
    placedFrame: number,
    durationFrames: number,
}) => {
    const newClip = new Delir.Entity.Clip()
    Object.assign(newClip, {
        renderer: clipRendererId,
        placedFrame: placedFrame,
        durationFrames: durationFrames,
    })

    context.dispatch(ProjectActions.createClipAction, {
        newClip,
        targetLayerId: layerId,
    })
})

export const createClipWithAsset = operation((context, { targetLayer, asset, placedFrame = 0, durationFrames = 100 }: {
    targetLayer: Delir.Entity.Layer,
    asset: Delir.Entity.Asset,
    placedFrame?: number,
    durationFrames?: number,
}) => {
    const {project} = context.getStore(ProjectStore).getState()
    if (!project) return

    const processablePlugins = Delir.Engine.Renderers.getAvailableRenderers()
        .filter((entry) => entry.handlableFileTypes.includes(asset.fileType))

    // TODO: Support selection
    if (processablePlugins.length === 0) {
        context.executeOperation(EditorOps.notify, {
            message: `plugin not available for \`${asset.fileType}\``,
            title: '😢 Supported plugin not available',
            level: 'info',
            timeout: 3000
        })

        return
    }

    const newClip = new Delir.Entity.Clip()
    Object.assign(newClip, {
        renderer: processablePlugins[0].id,
        placedFrame,
        durationFrames,
    })

    const paramName = Delir.Engine.Renderers.getInfo(newClip.renderer).assetAssignMap[asset.fileType]

    if (!paramName) return

    ProjectHelper.addKeyframe(project!, newClip, paramName, Object.assign(new Delir.Entity.Keyframe(), {
        frameOnClip: 0,
        value: { assetId: asset.id },
    }))

    context.dispatch(ProjectActions.addClipAction, { targetLayer, newClip })
})

export const createOrModifyKeyframeForClip = operation((context, { clipId, paramName, frameOnClip, patch }: {
    clipId: string,
    paramName: string,
    frameOnClip: number,
    patch: Partial<Delir.Entity.Keyframe>
}) => {
    const {project} = context.getStore(ProjectStore).getState()

    if (!project) return
    const clip = ProjectHelper.findClipById(project, clipId)

    if (!clip) return

    const props = Delir.Engine.Renderers.getInfo(clip.renderer!).parameter.properties
    const propDesc = props ? props.find(prop => prop.paramName === paramName) : null
    if (!propDesc) return

    frameOnClip = frameOnClip < 0 ? 0 : Math.round(frameOnClip)

    if (propDesc.animatable === false) {
        frameOnClip = 0
    }

    const keyframe = ProjectHelper.findKeyframeFromClipByPropAndFrame(clip, paramName, frameOnClip)

    if (keyframe) {
        context.dispatch(ProjectActions.modifyKeyframeAction, {
            targetKeyframeId: keyframe.id,
            patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
        })
    } else {
        const newKeyframe = new Delir.Entity.Keyframe()

        Object.assign(newKeyframe, Object.assign({
            frameOnClip,
        }, patch))

        context.dispatch(ProjectActions.addKeyframeAction, {
            targetClip: clip,
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
    const {project} = context.getStore(ProjectStore).getState()
    if (!project) return

    const clip = ProjectHelper.findClipById(project, clipId)
    if (!clip) return

    const effect = ProjectHelper.findEffectFromClipById(clip, effectId)
    if (!effect) return

    const props = rendererStore.getPostEffectParametersById(effect.processor)
    const propDesc = props ? props.find(prop => prop.paramName === paramName) : null
    if (!propDesc) return

    if (propDesc.animatable === false) {
        frameOnClip = 0
    }

    const keyframe = ProjectHelper.findKeyframeFromEffectByPropAndFrame(effect, paramName, frameOnClip)

    if (keyframe) {
        context.dispatch(ProjectActions.modifyEffectKeyframeAction, {
            targetClipId: clipId,
            effectId: effectId,
            targetKeyframeId: keyframe.id,
            patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
        })
    } else {
        const newKeyframe = new Delir.Entity.Keyframe()
        Object.assign(newKeyframe, Object.assign({ frameOnClip }, patch))

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

    context.dispatch(ProjectActions.addAssetAction, { asset })
})

export const addEffectIntoClip = operation((context, { clipId, processorId }: {
    clipId: string,
    processorId: string
}) => {
    const effect = new Delir.Entity.Effect()
    effect.processor = processorId
    context.dispatch(ProjectActions.addEffectIntoClipAction, { clipId, effect })
})

export const removeAsset = operation((context, { assetId }: { assetId: string }) => {
    context.dispatch(ProjectActions.removeAssetAction, { targetAssetId: assetId })
})

// TODO: frame position
export const moveClipToLayer = operation((context, { clipId, destLayerId }: {
    clipId: string,
    destLayerId: string
}) => {
    context.dispatch(ProjectActions.moveClipToLayerAction, { destLayerId: destLayerId, clipId })
})

export const modifyComposition = operation((context, { compositionId, props }: {
    compositionId: string,
    props: Partial<Delir.Entity.Composition>
}) => {
    context.dispatch(ProjectActions.modifyCompositionAction, {
        targetCompositionId: compositionId,
        patch: props
    })
})

export const modifyLayer = operation((context, { layerId, props }: {
    layerId: string,
    props: Partial<Delir.Entity.Layer>
}) => {
    context.dispatch(ProjectActions.modifyLayerAction, {
        targetLayerId: layerId,
        patch: props,
    })
})

export const modifyClip = operation((context, { clipId, props }: {
    clipId: string,
    props: Partial<Delir.Entity.Clip>
}) => {
    context.dispatch(ProjectActions.modifyClipAction, {
        targetClipId: clipId,
        patch: props,
    })
})

export const modifyClipExpression = operation((context, { clipId, property, expr }: {
    clipId: string,
    property: string,
    expr: { language: string, code: string }
}) => {
    context.dispatch(ProjectActions.modifyClipExpressionAction, {
        targetClipId: clipId,
        targetProperty: property,
        expr: {
            language: expr.language,
            code: expr.code,
        }
    })
})

export const modifyEffectExpression = operation((context, { clipId, effectId, property, expr }: {
    clipId: string,
    effectId: string,
    property: string,
    expr: { language: string, code: string }
}) => {
    context.dispatch(ProjectActions.modifyEffectExpressionAction, {
        targetClipId: clipId,
        targetEffectId: effectId,
        targetProperty: property,
        expr: {
            language: expr.language,
            code: expr.code,
        }
    })
})

export const moveLayerOrder = operation((context, { layerId, newIndex }: { layerId: string, newIndex: number }) => {
    const {project} = context.getStore(ProjectStore).getState()
    if (!project) return

    const comp = ProjectHelper.findParentCompositionByLayerId(project, layerId)!

    context.dispatch(ProjectActions.moveLayerOrderAction, {
        parentCompositionId: comp.id,
        targetLayerId: layerId,
        newIndex,
    })
})

export const removeComposition = operation((context, { compositionId }: { compositionId: string }) => {
    context.dispatch(ProjectActions.removeCompositionAction, { targetCompositionId: compositionId })
})

export const removeLayer = operation((context, { layerId }: { layerId: string }) => {
    context.dispatch(ProjectActions.removeLayerAction, { targetLayerId: layerId })
})

export const removeClip = operation((context, { clipId }: { clipId: string }) => {
    context.dispatch(ProjectActions.removeClipAction, { targetClipId: clipId })
})

export const removeKeyframe = operation((context, { keyframeId }: { keyframeId: string }) => {
    context.dispatch(ProjectActions.removeKeyframeAction, { targetKeyframeId: keyframeId })
})

export const removeKeyframeForEffect = operation((context, { clipId, effectId, keyframeId }: {
    clipId: string,
    effectId: string,
    keyframeId: string
}) => {
    context.dispatch(ProjectActions.removeEffectKeyframeAction, { clipId, effectId, targetKeyframeId: keyframeId })
})

export const removeEffect = operation((context, { holderClipId, effectId }: {
    holderClipId: string,
    effectId: string
}) => {
    context.dispatch(ProjectActions.removeEffectFromClipAction, { holderClipId, targetEffectId: effectId })
})
