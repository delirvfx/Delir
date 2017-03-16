import keyMirror from '../utils/keymirror'
import * as uuid from 'uuid'
import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import Payload from '../utils/payload'
// import deprecated from '../utils/deprecated'
import RendererService from '../services/renderer'

import EditorStateActions from './editor-state-actions'

export type CreateCompositionPayload = Payload<'CreateComposition', {composition: Delir.Project.Composition}>
export type CreateLayerPayload = Payload<'CreateLayer', {targetCompositionId: string, layer: Delir.Project.Layer}>
export type CreateClipPayload = Payload<'CreateClip', {
    props: {renderer: string, placedFrame: number, durationFrames: number},
    targetLayerId: string,
}>
export type AddClipPayload = Payload<'AddClip', {targetLayer: Delir.Project.Layer, newClip: Delir.Project.Clip}>
export type AddLayerPayload = Payload<'AddLayer', {targetComposition: Delir.Project.Composition, layer: Delir.Project.Layer}>
export type AddLayerWithAssetPayload = Payload<'AddLayerWithAsset', {
    targetComposition: Delir.Project.Composition,
    clip: Delir.Project.Clip,
    asset: Delir.Project.Asset,
    pluginRegistry: Delir.PluginRegistry,
}>
export type AddAssetPayload = Payload<'AddAsset', {asset: Delir.Project.Asset}>
export type MoveClipToLayerPayload = Payload<'MoveClipToLayer', {targetLayerId: string, clipId: string}>
export type ModifyCompositionPayload = Payload<'ModifyComposition', {targetCompositionId: string, patch: Optionalized<Delir.Project.Composition>}>
export type ModifyLayerPayload = Payload<'ModifyLayer', {targetLayerId: string, patch: Optionalized<Delir.Project.Layer>}>
export type ModifyClipPayload = Payload<'ModifyClip', {targetClipId: string, patch: Optionalized<Delir.Project.Clip>}>
export type RemoveCompositionayload = Payload<'RemoveComposition', {targetCompositionId: string}>
export type RemoveLayerPayload = Payload<'RemoveLayer', {targetClipId: string}>
export type RemoveClipPayload = Payload<'RemoveClip', {targetClipId: string}>
export type RemoveAssetPayload = Payload<'RemoveAsset', {targetAssetId: string}>

export const DispatchTypes = keyMirror({
    CreateComposition: null,
    CreateLayer: null,
    CreateClip: null,
    AddClip: null,
    AddLayer: null,
    AddLayerWithAsset: null,
    AddAsset: null,
    MoveClipToLayer: null,
    ModifyComposition: null,
    ModifyLayer: null,
    ModifyClip: null,
    RemoveComposition: null,
    RemoveLayer: null,
    RemoveClip: null,
    RemoveAsset:null,
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
        backgroundColor: Delir.ColorRGB,
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
        const processablePlugins = RendererService.pluginRegistry!.getPlugins().filter(entry => !!entry.package.delir.acceptFileTypes[asset.mimeType])

        // TODO: Support selection
        if (processablePlugins.length === 0) {
            EditorStateActions.notify(`plugin not available for \`${asset.mimeType}\``, '😢 Supported plugin not available', 'info', 5000)
            return
        }

        const clip = new Delir.Project.Clip
        Object.assign(clip, {
            id: uuid.v4(),
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
        dispatcher.dispatch(new Payload(DispatchTypes.CreateClip, {
            props: {
                renderer: clipRendererId,
                placedFrame: placedFrame,
                durationFrames: durationFrames,
            },
            targetLayerId: layerId,
        }))
    },

    createClipWithAsset(
        targetLayer: Delir.Project.Layer,
        asset: Delir.Project.Asset,
        placedFrame = 0,
        durationFrames = 100,
    ) {
        const processablePlugins = RendererService.pluginRegistry!.getPlugins().filter(entry => !!entry.package.delir.acceptFileTypes[asset.mimeType])

        // TODO: Support selection
        if (processablePlugins.length === 0) {
            EditorStateActions.notify(`plugin not available for \`${asset.mimeType}\``, '😢 Supported plugin not available', 'info', 3000)
            return
        }

        const newClip = new Delir.Project.Clip
        Object.assign(newClip, {
            id: uuid.v4(),
            renderer: processablePlugins[0].id,
            placedFrame,
            durationFrames,
        })

        const propName = ProjectHelper.findAssetAttachablePropertyByMimeType(
            newClip,
            asset.mimeType,
            RendererService.pluginRegistry!
        )

        if (!propName) return
        // newClip.config.rendererOptions[propName] = asset
        dispatcher.dispatch(new Payload(DispatchTypes.AddClip, {targetLayer, newClip}))
    },

    addAsset({name, mimeType, path}: {name: string, mimeType: string, path: string})
    {
        const asset = new Delir.Project.Asset()
        asset.name = name
        asset.mimeType = mimeType
        asset.path = path

        dispatcher.dispatch(new Payload(DispatchTypes.AddAsset, {asset}))
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

    modifyComposition(compId: string, props: Optionalized<Delir.Project.Composition>)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyComposition,{
            targetCompositionId: compId,
            patch: props
        }))
    },

    modifyLayer(layerId: string, props: Optionalized<Delir.Project.Layer>)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyLayer, {
            targetLayerId: layerId,
            patch: props,
        }))
    },

    modifyClip(clipId: string, props: Optionalized<Delir.Project.Clip>) {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyClip, {
            targetClipId: clipId,
            patch: props,
        }))
    },

    removeComposition(compId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveComposition, {targetCompositionId: compId}))
    },

    removeLayer(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveLayer, {targetClipId: clipId}))
    },

    removeClip(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveClip,　{targetClipId: clipId}))
    },
}
