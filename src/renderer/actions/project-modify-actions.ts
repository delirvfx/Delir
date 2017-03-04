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
export type CreateClipPayload = Payload<'CreateClip', {
    props: {renderer: string, placedFrame: number, durationFrames: number},
    targetTimelaneId: string,
}>
export type AddClipPayload = Payload<'AddClip', {targetTimelane: Delir.Project.Timelane, newClip: Delir.Project.Clip}>
export type AddTimelanePayload = Payload<'AddTimelane', {targetComposition: Delir.Project.Composition, timelane: Delir.Project.Timelane}>
export type AddTimelaneWithAssetPayload = Payload<'AddTimelaneWithAsset', {
    targetComposition: Delir.Project.Composition,
    clip: Delir.Project.Clip,
    asset: Delir.Project.Asset,
    pluginRegistry: Delir.PluginRegistry,
}>
export type AddAssetPayload = Payload<'AddAsset', {asset: Delir.Project.Asset}>
export type MoveClipToTimelanePayload = Payload<'MoveClipToTimelane', {targetTimelaneId: string, clipId: string}>
export type ModifyCompositionPayload = Payload<'ModifyComposition', {targetCompositionId: string, patch: any}>
export type ModifyClipPayload = Payload<'ModifyClip', {targetClipId: string, patch: any}>
export type RemoveTimelanePayload = Payload<'RemoveTimelane', {targetClipId: string}>
export type RemoveClipPayload = Payload<'RemoveClip', {targetClipId: string}>

export const DispatchTypes = keyMirror({
    CreateComposition: null,
    CreateTimelane: null,
    CreateClip: null,
    AddClip: null,
    AddTimelane: null,
    AddTimelaneWithAsset: null,
    AddAsset: null,
    MoveClipToTimelane: null,
    ModifyComposition: null,
    ModifyClip: null,
    RemoveTimelane: null,
    RemoveClip: null,
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

        const clip = new Delir.Project.Clip
        Object.assign(clip, {
            id: uuid.v4(),
            renderer: processablePlugins[0].id,
            placedFrame: 0,
            durationFrames: targetComposition.framerate,
        })

        dispatcher.dispatch(new Payload(DispatchTypes.AddTimelaneWithAsset, {
            targetComposition,
            clip,
            asset,
            pluginRegistry: RendererService.pluginRegistry!,
        }))
    },

    createClip(
        timelaneId: string,
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
            targetTimelaneId: timelaneId,
        }))
    },

    createClipWithAsset(
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
        newClip.config.rendererOptions[propName] = asset
        dispatcher.dispatch(new Payload(DispatchTypes.AddClip, {targetTimelane, newClip}))
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
    moveClipToTimelane(clipId: string, targetTimelaneId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.MoveClipToTimelane, {targetTimelaneId, clipId}))
    },

    modifyComposition(compId: string, props: {[propKey: string]: any})
    {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyComposition,{
            targetCompositionId: compId,
            patch: props
        }))
    },

    modifyClip(clipId: string, props: {[propKey: string]: any}) {
        dispatcher.dispatch(new Payload(DispatchTypes.ModifyClip, {
            targetClipId: clipId,
            patch: props,
        }))
    },

    removeTimelane(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveTimelane, {targetClipId: clipId}))
    },

    removeClip(clipId: string)
    {
        dispatcher.dispatch(new Payload(DispatchTypes.RemoveClip,　{targetClipId: clipId}))
    },
}
