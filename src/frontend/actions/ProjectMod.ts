import * as _ from 'lodash'
import * as keyMirror from 'keymirror'
import * as uuid from 'uuid'
import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../utils/Flux/Dispatcher'
import Payload from '../utils/Flux/payload'
// import deprecated from '../utils/deprecated'
import RendererService from '../services/renderer'
import ProjectStore from '../stores/ProjectStore'

import AppActions from './App'

export type CreateCompositionPayload = Payload<'CreateComposition', {composition: Delir.Project.Composition}>
export type CreateLayerPayload = Payload<'CreateLayer', {targetCompositionId: string, layer: Delir.Project.Layer}>
export type CreateClipPayload = Payload<'CreateClip', {targetLayerId: string, newClip: Delir.Project.Clip}>
export type AddClipPayload = Payload<'AddClip', {targetLayer: Delir.Project.Layer, newClip: Delir.Project.Clip}>
export type AddLayerPayload = Payload<'AddLayer', {targetComposition: Delir.Project.Composition, layer: Delir.Project.Layer}>
export type AddLayerWithAssetPayload = Payload<'AddLayerWithAsset', {
    targetComposition: Delir.Project.Composition,
    clip: Delir.Project.Clip,
    asset: Delir.Project.Asset,
}>
export type AddAssetPayload = Payload<'AddAsset', {asset: Delir.Project.Asset}>
export type AddKeyframePayload = Payload<'AddKeyframe', {targetClip: Delir.Project.Clip, propName: string, keyframe: Delir.Project.Keyframe}>
export type AddEffectIntoClipPayload = Payload<'AddEffectIntoClipPayload', { clipId: string, effect: Delir.Project.Effect }>
export type AddEffectKeyframePayload = Payload<'AddEffectKeyframe', {targetClipId: string, targetEffectId: string, propName: string, keyframe: Delir.Project.Keyframe}>
export type MoveClipToLayerPayload = Payload<'MoveClipToLayer', {targetLayerId: string, clipId: string}>
export type ModifyCompositionPayload = Payload<'ModifyComposition', {targetCompositionId: string, patch: Partial<Delir.Project.Composition>}>
export type ModifyLayerPayload = Payload<'ModifyLayer', {targetLayerId: string, patch: Partial<Delir.Project.Layer>}>
export type ModifyClipPayload = Payload<'ModifyClip', {targetClipId: string, patch: Partial<Delir.Project.Clip>}>
export type ModifyClipExpression = Payload<'ModifyClipExpression', {targetClipId: string, targetProperty: string, expr: {language: string, code: string}}>
export type ModifyEffectExpression = Payload<'ModifyEffectExpression', {targetClipId: string, targetEffectId: string, targetProperty: string, expr: {language: string, code: string}}>
export type ModifyKeyframePayload = Payload<'ModifyKeyframe', {targetKeyframeId: string, patch: Partial<Delir.Project.Keyframe>}>
export type ModifyEffectKeyframePayload = Payload<'ModifyEffectKeyframe', {targetClipId: string, effectId: string, targetKeyframeId: string, patch: Partial<Delir.Project.Keyframe>}>
export type RemoveCompositionayload = Payload<'RemoveComposition', {targetCompositionId: string}>
export type RemoveLayerPayload = Payload<'RemoveLayer', {targetLayerId: string}>
export type RemoveClipPayload = Payload<'RemoveClip', {targetClipId: string}>
export type RemoveAssetPayload = Payload<'RemoveAsset', {targetAssetId: string}>
export type RemoveKeyframePayload = Payload<'RemoveKeyframe', {targetKeyframeId: string}>
export type RemoveEffectFromClip = Payload<'RemoveEffectFromClip', { holderClipId: string, targetEffectId: string }>

export const DispatchTypes = keyMirror({
    CreateComposition: null,
    CreateLayer: null,
    CreateClip: null,
    AddClip: null,
    AddLayer: null,
    AddLayerWithAsset: null,
    AddAsset: null,
    AddKeyframe: null,
    AddEffectIntoClipPayload: null,
    AddEffectKeyframe: null,
    MoveClipToLayer: null,
    ModifyComposition: null,
    ModifyLayer: null,
    ModifyClip: null,
    ModifyClipExpression: null,
    ModifyEffectExpression: null,
    ModifyKeyframe: null,
    ModifyEffectKeyframe: null,
    RemoveComposition: null,
    RemoveLayer: null,
    RemoveClip: null,
    RemoveAsset:null,
    RemoveKeyframe: null,
    RemoveEffectFromClip: null,
})

export default {
    //
    // Modify project
    //

    // @deprecated
    createComposition(options: {
        name: string,
        width: number,
        height: number,
        framerate: number,
        durationFrames: number,
        backgroundColor: Delir.Values.ColorRGB,
        samplingRate: number,
        audioChannels: number,
    })
    {
        const composition = new Delir.Project.Composition
        Object.assign(composition, options)
        dispatcher.dispatch(new Payload(DispatchTypes.CreateComposition,　{composition}))
    },

    // @deprecated
    createLayer(compId: string)
    {
        const layer = new Delir.Project.Layer
        dispatcher.dispatch(new Payload(DispatchTypes.CreateLayer, {targetCompositionId: compId, layer}))
    },

    addLayer(
        targetComposition: Delir.Project.Composition,
        layer: Delir.Project.Layer
    ) {
        dispatcher.dispatch(new Payload(DispatchTypes.AddLayer, {targetComposition, layer}))
    },

    addLayerWithAsset(
        targetComposition: Delir.Project.Composition,
        asset: Delir.Project.Asset
    ) {
        const processablePlugins = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => entry.handlableFileTypes.includes(asset.fileType))

        // TODO: Support selection
        if (processablePlugins.length === 0) {
            AppActions.notify(`plugin not available for \`${asset.fileType}\``, '😢 Supported plugin not available', 'info', 5000)
            return
        }

        const clip = new Delir.Project.Clip
        Object.assign(clip, {
            renderer: processablePlugins[0].id,
            placedFrame: 0,
            durationFrames: targetComposition.framerate,
        })

        dispatcher.dispatch(new Payload(DispatchTypes.AddLayerWithAsset, {
            targetComposition,
            clip,
            asset,
            pluginRegistry: RendererService.pluginRegistry!,
        }))
    },

    createClip(
        layerId: string,
        clipRendererId: string,
        placedFrame = 0,
        durationFrames = 100
    ) {
        const newClip = new Delir.Project.Clip()
        Object.assign(newClip, {
            renderer: clipRendererId,
            placedFrame: placedFrame,
            durationFrames: durationFrames,
        })

        dispatcher.dispatch(new Payload(DispatchTypes.CreateClip, {
            newClip,
            targetLayerId: layerId,
        }))
    },

    createClipWithAsset(
        targetLayer: Delir.Project.Layer,
        asset: Delir.Project.Asset,
        placedFrame = 0,
        durationFrames = 100,
    ) {
        const project = ProjectStore.getState().get('project')

        if (!project) return

        const processablePlugins = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => entry.handlableFileTypes.includes(asset.fileType))

        // TODO: Support selection
        if (processablePlugins.length === 0) {
            AppActions.notify(`plugin not available for \`${asset.fileType}\``, '😢 Supported plugin not available', 'info', 3000)
            return
        }

        const newClip = new Delir.Project.Clip
        Object.assign(newClip, {
            renderer: processablePlugins[0].id,
            placedFrame,
            durationFrames,
        })

        const propName = Delir.Engine.Renderers.getInfo(newClip.renderer).assetAssignMap[asset.fileType]

        if (!propName) return

        ProjectHelper.addKeyframe(project!, newClip, propName, Object.assign(new Delir.Project.Keyframe(), {
            frameOnClip: 0,
            value: {assetId: asset.id},
        }))
        dispatcher.dispatch(new Payload(DispatchTypes.AddClip, {targetLayer, newClip}))
    },

    createOrModifyKeyframeForClip(clipId: string, propName: string, frameOnClip: number, patch: Partial<Delir.Project.Keyframe>)
    {
        const project = ProjectStore.getState().get('project')

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
            dispatcher.dispatch(new Payload(DispatchTypes.ModifyKeyframe, {
                targetKeyframeId: keyframe.id,
                patch: propDesc.animatable === false ? Object.assign(patch, {frameOnClip: 0}) : patch,
            }))
        } else {
            const newKeyframe = new Delir.Project.Keyframe()

            Object.assign(newKeyframe, Object.assign({
                frameOnClip,
            }, patch))

            dispatcher.dispatch(new Payload(DispatchTypes.AddKeyframe, {
                targetClip: clip,
                propName,
                keyframe: newKeyframe
            }))
        }
    },

    createOrModifyKeyframeForEffect(clipId: string, effectId: string, propName: string, frameOnClip: number, patch: Partial<Delir.Project.Keyframe>)
    {
        const project = ProjectStore.getState().get('project')
        if (!project) return

        const clip = ProjectHelper.findClipById(project, clipId)
        if (!clip) return

        const effect = ProjectHelper.findEffectFromClipById(clip, effectId)
        if (!effect) return

        const props = RendererService.pluginRegistry.getPostEffectParametersById(effect.processor)
        const propDesc = props ? props.find(prop => prop.propName === propName) : null
        if (!propDesc) return

        if (propDesc.animatable === false) {
            frameOnClip = 0
        }

        const keyframe = ProjectHelper.findKeyframeFromEffectByPropAndFrame(effect, propName, frameOnClip)

        console.log(keyframe)
        if (keyframe) {
            dispatcher.dispatch(new Payload(DispatchTypes.ModifyEffectKeyframe, {
                targetClipId: clipId,
                effectId: effectId,
                targetKeyframeId: keyframe.id,
                patch: propDesc.animatable === false ? Object.assign(patch, {frameOnClip: 0}) : patch,
            }))
        } else {
            const newKeyframe = new Delir.Project.Keyframe()
            Object.assign(newKeyframe, Object.assign({ frameOnClip }, patch))

            dispatcher.dispatch(new Payload(DispatchTypes.AddEffectKeyframe, {
                targetClipId: clipId,
                targetEffectId: effectId,
                propName: propName,
                keyframe: newKeyframe,
            }))
        }
    },

    addAsset({name, fileType, path}: {name: string, fileType: string, path: string})
    {
        const asset = new Delir.Project.Asset()
        asset.name = name
        asset.fileType = fileType
        asset.path = path

        dispatcher.dispatch(new Payload(DispatchTypes.AddAsset, {asset}))
    },

    addEffectIntoClipPayload(clipId: string, processorId: string)
    {
        const effect = new Delir.Project.Effect()
        effect.processor = processorId
        dispatcher.dispatch(new Payload(DispatchTypes.AddEffectIntoClipPayload, { clipId, effect }))
    },

    removeAsset(assetId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveAsset, {targetAssetId: assetId}))
    },

    // TODO: frame position
    moveClipToLayer(clipId: string, targetLayerId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.MoveClipToLayer, {targetLayerId, clipId}))
    },

    modifyComposition(compId: string, props: Partial<Delir.Project.Composition>)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyComposition, {
            targetCompositionId: compId,
            patch: props
        }))
    },

    modifyLayer(layerId: string, props: Partial<Delir.Project.Layer>)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyLayer, {
            targetLayerId: layerId,
            patch: props,
        }))
    },

    modifyClip(clipId: string, props: Partial<Delir.Project.Clip>) {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyClip, {
            targetClipId: clipId,
            patch: props,
        }))
    },

    modifyClipExpression(clipId: string, property: string, expr: {language: string, code: string})
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyClipExpression, {
            targetClipId: clipId,
            targetProperty: property,
            expr: {
                language: expr.language,
                code: expr.code,
            }
        }))
    },

    modifyEffectExpression(clipId: string, effectId: string, property: string, expr: {language: string, code: string})
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyEffectExpression, {
            targetClipId: clipId,
            targetEffectId: effectId,
            targetProperty: property,
            expr: {
                language: expr.language,
                code: expr.code,
            }
        }))
    },

    removeComposition(compId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveComposition, {targetCompositionId: compId}))
    },

    removeLayer(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveLayer, {targetLayerId: clipId}))
    },

    removeClip(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveClip,　{targetClipId: clipId}))
    },

    removeKeyframe(keyframeId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveKeyframe, {targetKeyframeId: keyframeId}))
    },

    removeEffect(holderClipId: string, effectId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveEffectFromClip, { holderClipId, targetEffectId: effectId }))
    },
}
