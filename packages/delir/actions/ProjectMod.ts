import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { operation } from '@ragg/fleur'

import ProjectStore from '../stores/ProjectStore'
import RendererStore from '../stores/RendererStore'
import { ProjectModActions } from './actions'
import * as AppActions from './App'

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
    const composition = new Delir.Project.Composition()
    Object.assign(composition, options)
    context.dispatch(ProjectModActions.createCompositionAction, { composition })
})

// @deprecated
export const createLayer = operation((context, { compId }: { compId: string }) => {
    const layer = new Delir.Project.Layer()
    context.dispatch(ProjectModActions.createLayerAction, { targetCompositionId: compId, layer })
})

export const addLayer = operation((context, { targetComposition, layer }: {
    targetComposition: Delir.Project.Composition,
    layer: Delir.Project.Layer
}) => {
    context.dispatch(ProjectModActions.addLayerAction, { targetComposition, layer })
})

export const addLayerWithAsset = operation((context, { targetComposition, asset }: {
    targetComposition: Delir.Project.Composition,
    asset: Delir.Project.Asset
}) => {
    const processablePlugins = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => {
        return entry.handlableFileTypes.includes(asset.fileType)
    })

    // TODO: Support selection
    if (processablePlugins.length === 0) {
        context.executeOperation(AppActions.notify, {
            message: `plugin not available for \`${asset.fileType}\``,
            title: '😢 Supported plugin not available',
            level: 'info',
            timeout: 5000
        })

        return
    }

    const clip = new Delir.Project.Clip()
    Object.assign(clip, {
        renderer: processablePlugins[0].id,
        placedFrame: 0,
        durationFrames: targetComposition.framerate,
    })

    context.dispatch(ProjectModActions.addLayerWithAssetAction, {
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
    const newClip = new Delir.Project.Clip()
    Object.assign(newClip, {
        renderer: clipRendererId,
        placedFrame: placedFrame,
        durationFrames: durationFrames,
    })

    context.dispatch(ProjectModActions.createClipAction, {
        newClip,
        targetLayerId: layerId,
    })
})

export const createClipWithAsset = operation((context, { targetLayer, asset, placedFrame = 0, durationFrames = 100 }: {
    targetLayer: Delir.Project.Layer,
    asset: Delir.Project.Asset,
    placedFrame?: number,
    durationFrames?: number,
}) => {
    const {project} = context.getStore(ProjectStore).getState()
    if (!project) return

    const processablePlugins = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => entry.handlableFileTypes.includes(asset.fileType))

    // TODO: Support selection
    if (processablePlugins.length === 0) {
        context.executeOperation(AppActions.notify, {
            message: `plugin not available for \`${asset.fileType}\``,
            title: '😢 Supported plugin not available',
            level: 'info',
            timeout: 3000
        })

        return
    }

    const newClip = new Delir.Project.Clip()
    Object.assign(newClip, {
        renderer: processablePlugins[0].id,
        placedFrame,
        durationFrames,
    })

    const propName = Delir.Engine.Renderers.getInfo(newClip.renderer).assetAssignMap[asset.fileType]

    if (!propName) return

    ProjectHelper.addKeyframe(project!, newClip, propName, Object.assign(new Delir.Project.Keyframe(), {
        frameOnClip: 0,
        value: { assetId: asset.id },
    }))

    context.dispatch(ProjectModActions.addClipAction, { targetLayer, newClip })
})

export const createOrModifyKeyframeForClip = operation((context, { clipId, propName, frameOnClip, patch }: {
    clipId: string,
    propName: string,
    frameOnClip: number,
    patch: Partial<Delir.Project.Keyframe>
}) => {
    const {project} = context.getStore(ProjectStore).getState()

    if (!project) return
    const clip = ProjectHelper.findClipById(project, clipId)

    if (!clip) return

    const props = Delir.Engine.Renderers.getInfo(clip.renderer!).parameter.properties
    const propDesc = props ? props.find(prop => prop.propName === propName) : null
    if (!propDesc) return

    frameOnClip = Math.round(frameOnClip)

    if (propDesc.animatable === false) {
        frameOnClip = 0
    }

    const keyframe = ProjectHelper.findKeyframeFromClipByPropAndFrame(clip, propName, frameOnClip)

    if (keyframe) {
        context.dispatch(ProjectModActions.modifyKeyframeAction, {
            targetKeyframeId: keyframe.id,
            patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
        })
    } else {
        const newKeyframe = new Delir.Project.Keyframe()

        Object.assign(newKeyframe, Object.assign({
            frameOnClip,
        }, patch))

        context.dispatch(ProjectModActions.addKeyframeAction, {
            targetClip: clip,
            propName,
            keyframe: newKeyframe
        })
    }
})

export const createOrModifyKeyframeForEffect = operation((context, { clipId, effectId, propName, frameOnClip, patch }: {
    clipId: string,
    effectId: string,
    propName: string,
    frameOnClip: number,
    patch: Partial<Delir.Project.Keyframe>
}) => {
    const rendererStore = context.getStore(RendererStore)
    const {project} = context.getStore(ProjectStore).getState()
    if (!project) return

    const clip = ProjectHelper.findClipById(project, clipId)
    if (!clip) return

    const effect = ProjectHelper.findEffectFromClipById(clip, effectId)
    if (!effect) return

    const props = rendererStore.getPostEffectParametersById(effect.processor)
    const propDesc = props ? props.find(prop => prop.propName === propName) : null
    if (!propDesc) return

    if (propDesc.animatable === false) {
        frameOnClip = 0
    }

    const keyframe = ProjectHelper.findKeyframeFromEffectByPropAndFrame(effect, propName, frameOnClip)

    if (keyframe) {
        context.dispatch(ProjectModActions.modifyEffectKeyframeAction, {
            targetClipId: clipId,
            effectId: effectId,
            targetKeyframeId: keyframe.id,
            patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
        })
    } else {
        const newKeyframe = new Delir.Project.Keyframe()
        Object.assign(newKeyframe, Object.assign({ frameOnClip }, patch))

        context.dispatch(ProjectModActions.addEffectKeyframeAction, {
            targetClipId: clipId,
            targetEffectId: effectId,
            propName: propName,
            keyframe: newKeyframe,
        })
    }
})

export const addAsset = operation((context, { name, fileType, path }: {
    name: string,
    fileType: string,
    path: string
}) => {
    const asset = new Delir.Project.Asset()
    asset.name = name
    asset.fileType = fileType
    asset.path = path

    context.dispatch(ProjectModActions.addAssetAction, { asset })
})

export const addEffectIntoClip = operation((context, { clipId, processorId }: {
    clipId: string,
    processorId: string
}) => {
    const effect = new Delir.Project.Effect()
    effect.processor = processorId
    context.dispatch(ProjectModActions.addEffectIntoClipPayloadAction, { clipId, effect })
})

export const removeAsset = operation((context, { assetId }: { assetId: string }) => {
    context.dispatch(ProjectModActions.removeAssetAction, { targetAssetId: assetId })
})

// TODO: frame position
export const moveClipToLayer = operation((context, { clipId, destLayerId }: {
    clipId: string,
    destLayerId: string
}) => {
    context.dispatch(ProjectModActions.moveClipToLayerAction, { destLayerId: destLayerId, clipId })
})

export const modifyComposition = operation((context, { compositionId, props }: {
    compositionId: string,
    props: Partial<Delir.Project.Composition>
}) => {
    context.dispatch(ProjectModActions.modifyCompositionAction, {
        targetCompositionId: compositionId,
        patch: props
    })
})

export const modifyLayer = operation((context, { layerId, props }: {
    layerId: string,
    props: Partial<Delir.Project.Layer>
}) => {
    context.dispatch(ProjectModActions.modifyLayerAction, {
        targetLayerId: layerId,
        patch: props,
    })
})

export const modifyClip = operation((context, { clipId, props }: {
    clipId: string,
    props: Partial<Delir.Project.Clip>
}) => {
    context.dispatch(ProjectModActions.modifyClipAction, {
        targetClipId: clipId,
        patch: props,
    })
})

export const modifyClipExpression = operation((context, { clipId, property, expr }: {
    clipId: string,
    property: string,
    expr: { language: string, code: string }
}) => {
    context.dispatch(ProjectModActions.modifyClipExpressionAction, {
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
    context.dispatch(ProjectModActions.modifyEffectExpressionAction, {
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

    context.dispatch(ProjectModActions.moveLayerOrderAction, {
        parentCompositionId: comp.id,
        targetLayerId: layerId,
        newIndex,
    })
})

export const removeComposition = operation((context, { compositionId }: { compositionId: string }) => {
    context.dispatch(ProjectModActions.removeCompositionAction, { targetCompositionId: compositionId })
})

export const removeLayer = operation((context, { layerId }: { layerId: string }) => {
    context.dispatch(ProjectModActions.removeLayerAction, { targetLayerId: layerId })
})

export const removeClip = operation((context, { clipId }: { clipId: string }) => {
    context.dispatch(ProjectModActions.removeClipAction, { targetClipId: clipId })
})

export const removeKeyframe = operation((context, { keyframeId }: { keyframeId: string }) => {
    context.dispatch(ProjectModActions.removeKeyframeAction, { targetKeyframeId: keyframeId })
})

export const removeKeyframeForEffect = operation((context, { clipId, effectId, keyframeId }: {
    clipId: string,
    effectId: string,
    keyframeId: string
}) => {
    context.dispatch(ProjectModActions.removeEffectKeyframeAction, { clipId, effectId, targetKeyframeId: keyframeId })
})

export const removeEffect = operation((context, { holderClipId, effectId }: {
    holderClipId: string,
    effectId: string
}) => {
    context.dispatch(ProjectModActions.removeEffectFromClipAction, { holderClipId, targetEffectId: effectId })
})
