import keyMirror from 'keymirror'
import * as uuid from 'uuid'
import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import Payload from '../utils/payload'
// import deprecated from '../utils/deprecated'
import RendererService from '../services/renderer'

import EditorStateActions from './editor-state-actions'

export type CreateCompositionPayload = Payload<'CreateComposition', {composition: Delir.Project.Composition}>
export type CreateTimelanePayload = Payload<'CreateTimelane', {targetCompositionId: string, timelane: Delir.Project.Timelane}>
export type CreateLayerPayload = Payload<'CreateLayer', {
    props: {renderer: string, placedFrame: number, durationFrames: number},
    targetTimelaneId: string,
}>
export type AddLayerPayload = Payload<'AddLayer', {targetTimelane: Delir.Project.Timelane, newLayer: Delir.Project.Clip}>
export type AddTimelanePayload = Payload<'AddTimelane', {targetComposition: Delir.Project.Composition, timelane: Delir.Project.Timelane}>
export type AddTimelaneWithAssetPayload = Payload<'AddTimelaneWithAsset', {
    targetComposition: Delir.Project.Composition,
    layer: Delir.Project.Clip,
    asset: Delir.Project.Asset,
    pluginRegistry: Delir.PluginRegistry,
}>
export type AddAssetPayload = Payload<'AddAsset', {asset: Delir.Project.Asset}>
export type MoveLayerToTimelanePayload = Payload<'MoveLayerToTimelane', {targetTimelaneId: string, layerId: string}>
export type ModifyCompositionPayload = Payload<'ModifyComposition', {targetCompositionId: string, patch: any}>
export type ModifyLayerPayload = Payload<'ModifyLayer', {targetLayerId: string, patch: any}>
export type RemoveTimelanePayload = Payload<'RemoveTimelane', {targetLayerId: string}>
export type RemoveLayerPayload = Payload<'RemoveLayer', {targetLayerId: string}>

export const DispatchTypes = keyMirror({
    CreateComposition: null,
    CreateTimelane: null,
    CreateLayer: null,
    AddLayer: null,
    AddTimelane: null,
    AddTimelaneWithAsset: null,
    AddAsset: null,
    MoveLayerToTimelane: null,
    ModifyComposition: null,
    ModifyLayer: null,
    RemoveTimelane: null,
    RemoveLayer: null,
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
    createTimelane(compId: string)
    {
        const timelane = new Delir.Project.Timelane
        dispatcher.dispatch(new Payload(DispatchTypes.CreateTimelane, {targetCompositionId: compId, timelane}))
    },

    addTimelane(
        targetComposition: Delir.Project.Composition,
        timelane: Delir.Project.Timelane
    ) {
        dispatcher.dispatch(new Payload(DispatchTypes.AddTimelane, {targetComposition, timelane}))
    },

    addTimelaneWithAsset(
        targetComposition: Delir.Project.Composition,
        asset: Delir.Project.Asset
    ) {
        const processablePlugins = RendererService.pluginRegistry!.getPlugins().filter(entry => !!entry.package.delir.acceptFileTypes[asset.mimeType])

        // TODO: Support selection
        if (processablePlugins.length === 0) {
            EditorStateActions.notify(`plugin not available for \`${asset.mimeType}\``, '😢 Supported plugin not available', 'info', 5000)
            return
        }

        const layer = new Delir.Project.Clip
        Object.assign(layer, {
            id: uuid.v4(),
            renderer: processablePlugins[0].id,
            placedFrame: 0,
            durationFrames: targetComposition.framerate,
        })

        dispatcher.dispatch(new Payload(DispatchTypes.AddTimelaneWithAsset, {
            targetComposition,
            layer,
            asset,
            pluginRegistry: RendererService.pluginRegistry!,
        }))
    },

    createLayer(
        timelaneId: string,
        layerRendererId: string,
        placedFrame = 0,
        durationFrames = 100
    ) {
        dispatcher.dispatch(new Payload(DispatchTypes.CreateLayer, {
            props: {
                renderer: layerRendererId,
                placedFrame: placedFrame,
                durationFrames: durationFrames,
            },
            targetTimelaneId: timelaneId,
        }))
    },

    createLayerWithAsset(
        targetTimelane: Delir.Project.Timelane,
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

        const newLayer = new Delir.Project.Clip
        Object.assign(newLayer, {
            id: uuid.v4(),
            renderer: processablePlugins[0].id,
            placedFrame,
            durationFrames,
        })

        const propName = ProjectHelper.findAssetAttachablePropertyByMimeType(
            newLayer,
            asset.mimeType,
            RendererService.pluginRegistry!
        )

        if (!propName) return
        newLayer.config.rendererOptions[propName] = asset
        dispatcher.dispatch(new Payload(DispatchTypes.AddLayer, {targetTimelane, newLayer}))
    },

    addAsset({name, mimeType, path}: {name: string, mimeType: string, path: string})
    {
        const asset = new Delir.Project.Asset()
        asset.name = name
        asset.mimeType = mimeType
        asset.path = path

        dispatcher.dispatch(new Payload(DispatchTypes.AddAsset, {asset}))
    },


    // TODO: frame position
    moveLayerToTimelane(layerId: string, targetTimelaneId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.MoveLayerToTimelane, {targetTimelaneId, layerId}))
    },

    modifyComposition(compId: string, props: {[propKey: string]: any})
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyComposition,{
            targetCompositionId: compId,
            patch: props
        }))
    },

    modifyLayer(layerId: string, props: {[propKey: string]: any}) {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyLayer, {
            targetLayerId: layerId,
            patch: props,
        }))
    },

    removeTimelane(layerId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveTimelane, {targetLayerId: layerId}))
    },

    removeLayer(layerId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveLayer,　{targetLayerId: layerId}))
    },
}
