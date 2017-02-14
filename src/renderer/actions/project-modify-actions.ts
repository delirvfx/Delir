import keyMirror from 'keymirror'
import * as uuid from 'uuid'
import * as Delir from 'delir-core'

import dispatcher from '../dispatcher'
import Payload from '../utils/payload'
// import deprecated from '../utils/deprecated'
import RendererService from '../services/renderer'

export type CreateCompositionPayload = Payload<'CreateComposition', {composition: Delir.Project.Composition}>
export type CreateTimelanePayload = Payload<'CreateTimelane', {targetCompositionId: string, timelane: Delir.Project.Timelane}>
export type CreateLayerPayload = Payload<'CreateLayer', {
    props: {renderer: string, placedFrame: number, durationFrames: number},
    targetTimelaneId: string,
}>
export type AddTimelanePayload = Payload<'AddTimelane', {targetComposition: Delir.Project.Composition, timelane: Delir.Project.Timelane}>
export type AddTimelaneWithAssetPayload = Payload<'AddTimelaneWithAsset', {targetComposition: Delir.Project.Composition, timelane: Delir.Project.Timelane, asset: Delir.Project.Asset}>
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
    createComposition({name, width, height, framerate, durationFrames}: {
        name: string,
        width: number,
        height: number,
        framerate: number,
        durationFrames: number,
    })
    {
        const composition = new Delir.Project.Composition
        composition.name = name
        composition.width = width
        composition.height = height
        composition.framerate = framerate
        composition.durationFrames = durationFrames

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
        const processablePlugins = RendererService.pluginRegistry!.getPlugins().filter(entry => entry.package.delir.acceptFileTypes.includes(g))

        // TODO: Support selection
        if (processablePlugins.length) {
            const timelane = new Delir.Project.Timelane
            timelane.id = uuid.v4()

            const layer = new Delir.Project.Layer
            Object.assign(layer, {
                id: uuid.v4(),
                renderer: processablePlugins[0].id,
                placedFrame: 0,
                durationFrames: 1,
            })

            timelane.layers.add(layer)

            dispatcher.dispatch(new Payload(DispatchTypes.AddTimelaneWithAsset, {
                targetComposition,
                timelane: timelane,
                asset
            }))
        }
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
