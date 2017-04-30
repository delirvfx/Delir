// @flow
import * as uuid from 'uuid'
import * as _ from 'lodash'

import Project from '../project/project'
import Asset from '../project/asset'
import Composition from '../project/composition'
import Layer from '../project/layer'
import Clip from '../project/clip'
import Effect from '../project/effect'
import Keyframe from '../project/keyframe'

import PluginRegistory from '../plugin-support/plugin-registry'

function setFreezedProp(obj: Object, name: string, value: any)
{
    Object.defineProperty(obj, name, {value, writable: false})
}

function _generateAndReserveSymbolId(project: Project): string
{
    return uuid.v4()
}

//
// Add
//
export function addAsset(
    project: Project,
    asset: Asset,
) {
    if (typeof asset.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(asset, 'id', entityId)
    }

    project.assets = _.uniqBy([...project.assets, asset], 'id')

    return asset
}

export function addComposition(
    project: Project,
    composition: Composition
): Composition
{
    if (typeof composition.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(composition, 'id', entityId)
    }

    project.compositions = _.uniqBy([...project.compositions, composition], 'id')

    return composition
}

export function addLayer(
    project: Project,
    targetCompositionId: Composition|string,
    layer: Layer
    // TODO: position specify option
): Layer
{
    if (typeof layer.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(layer, 'id', entityId)
    }

    // TODO: Not found behaviour
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    composition.layers = _.uniqBy([layer, ...composition.layers], 'id')

    return layer
}

export function addClip(
    project: Project,
    targetLayerId: Layer|string,
    clip: Clip
): Clip
{
    if (typeof clip.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(clip, 'id', entityId)
    }

    // TODO: Not found behaviour
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)!

    layer.clips.add(clip)

    return clip
}

export function addEffect(
  project: Project,
  targetClipId: Clip|string,
  effect: Effect
): Effect
{
    if (typeof effect.id !== 'string') {
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(effect, 'id', entityId)
    }

    const clip = targetClipId instanceof Clip
      ? targetClipId
      : findClipById(project, targetClipId)!

    clip.effects.push(effect)

    return effect
}

export function addKeyframe(
    project: Project,
    targetClipId: Clip|string,
    propName: string,
    keyframe: Keyframe|Keyframe[]
): Keyframe|Keyframe[]
{
    let keyframes = Array.isArray(keyframe) ? keyframe : [keyframe]

    // TODO: Not found behaviour
    const clip: Clip|null = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    for (const _keyframe of keyframes) {
        if (typeof _keyframe.id !== 'string') {
            // TODO: Clone instance
            const entityId = _generateAndReserveSymbolId(project)
            setFreezedProp(_keyframe, 'id', entityId)
        }

        if (!clip.keyframes[propName]) {
            clip.keyframes[propName] = []
        }

        const duplicated = clip.keyframes[propName].find(kf => kf.frameOnClip === _keyframe.frameOnClip)

        if (duplicated) {
            throw new Error(`Keyframe duplicated on frame ${duplicated.frameOnClip} (property: ${propName})`)
        }

        clip.keyframes[propName].push(_keyframe)
    }

    return keyframe
}



//
// Delete
//
export function deleteAsset(
    project: Project,
    targetAssetId: Asset|string,
) {
    const asset = targetAssetId instanceof Asset
        ? targetAssetId
        : findAssetById(project, targetAssetId)!

    _.remove(project.assets, {id: asset.id})
}

export function deleteComposition(
    project: Project,
    targetCompositionId: Composition|string,
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    // TODO: Not found behaviour
    _.remove(project.compositions, {id: composition.id})
}

export function deleteLayer(
    project: Project,
    targetLayerId: Layer|string,
) {
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)!

    // TODO: Not found behaviour
    const composition = findParentCompositionByLayerId(project, layer.id!)!
    _.remove(composition.layers, layer)
}

export function deleteClip(
    project: Project,
    targetClipId: Clip|string,
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    const layer = findParentLayerByClipId(project, clip.id!)!
    layer.clips.delete(clip)
}

export function deleteEffectFromClip(
    project: Project,
    parentClipId: Clip|string,
    targetEffectId: Effect|string,
) {
    const clip = parentClipId instanceof Clip
        ? parentClipId
        : findClipById(project, parentClipId)!

    const effect = targetEffectId instanceof Effect
        ? targetEffectId
        : findEffectFromClipById(clip, targetEffectId)

    _.remove(clip.effects, effect)
}

export function deleteKeyframe(
    project: Project,
    targetKeyframeId: Keyframe|string,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)!

    const {clip, propName} = findParentClipAndPropNameByKeyframeId(project, keyframe.id!)!
    if (!clip.keyframes[propName]) return
    _.remove(clip.keyframes[propName], kf => kf.id === targetKeyframeId) // TODO: Implement this function Or change keyframe structure
}

//
// Modify
//
export function modifyAsset(
    project: Project,
    targetAssetId: Asset|string,
    patch: Optionalized<Asset>
) {
    const asset = targetAssetId instanceof Asset
        ? targetAssetId
        : findAssetById(project, targetAssetId)

    Object.assign(asset, patch)
}

export function modifyComposition(
    project: Project,
    targetCompositionId: Composition|string,
    patch: Optionalized<Composition>
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    Object.assign(composition, patch)
}

export function modifyLayer(
    project: Project,
    targetLayerId: Layer|string,
    patch: Optionalized<Layer>
) {
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)!

    Object.assign(layer, patch)
}

export function modifyClip(
    project: Project,
    targetClipId: Clip|string,
    patch: Optionalized<Clip>
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    Object.assign(clip, patch)
}

export function modifyEffect(
    project: Project,
    parentClipId: Clip|string,
    targetEffectId: Effect|string,
    patch: Optionalized<Effect>
) {
    const clip = parentClipId instanceof Clip
        ? parentClipId
        : findClipById(project, parentClipId)!

    const effect = targetEffectId instanceof Effect
        ? targetEffectId
        : findEffectFromClipById(clip, targetEffectId)

    Object.assign(effect, patch)
}

export function modifyKeyframe(
    project: Project,
    targetKeyframeId: Keyframe|string,
    patch: Optionalized<Keyframe>,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)!

    if (patch.frameOnClip != null) {
        patch.frameOnClip = patch.frameOnClip | 0
    }

    // TODO: Check duplicate on frame
    Object.assign(keyframe, patch)
}

//
// Finders
//
export function findAssetById(project: Project, assetId: string): Asset|null
{
    let targetAsset: Asset|null = null

    compSearch:
        for (const asset of project.assets) {
            if (asset.id === assetId) {
                targetAsset = asset
                break compSearch
            }
        }

    return targetAsset
}

export function findCompositionById(project: Project, compositionId: string): Composition|null
{
    let targetComp: Composition|null = null

    compSearch:
        for (const comp of project.compositions) {
            if (comp.id === compositionId) {
                targetComp = comp
                break compSearch
            }
        }

    return targetComp
}

export function findLayerById(project: Project, layerId: string): Layer|null
{
    let targetLayer: Layer|null = null

    layerSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                if (layer.id === layerId) {
                    targetLayer = layer
                    break layerSearch
                }
            }
        }

    return targetLayer
}

export function findClipById(project: Project, clipId: string): Clip|null
{
    let targetClip: Clip|null = null

    clipSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips.values()) {
                    if (clip.id === clipId) {
                        targetClip = clip
                        break clipSearch
                    }
                }
            }
        }

    return targetClip
}

export function findEffectFromClipById(clip: Clip, effectId: string): Effect|null
{
    for (const effect of clip.effects) {
        if (effect.id === effectId) {
            return effect
        }
    }

    return null
}

export function findParentCompositionByLayerId(project: Project, layerId: string): Composition|null
{
    let targetComp: Composition|null = null

    compositionSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                if (layer.id === layerId) {
                    targetComp = comp
                    break compositionSearch
                }
            }
        }

    return targetComp
}

export function findParentLayerByClipId(project: Project, clipId: string): Layer|null
{
    let targetLayer: Layer|null = null

    layerSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips.values()) {
                    if (clip.id === clipId) {
                        targetLayer = layer
                        break layerSearch
                    }
                }
            }
        }

    return targetLayer
}

export function findKeyframeFromClipById(clip: Clip, keyframeId: string): Keyframe|null
{
    let targetKeyframe: Keyframe|null = null

    keyframeSearch:
        for (const propName of Object.keys(clip.keyframes)) {
            for (const keyframe of clip.keyframes[propName]) {
                if (keyframe.id === keyframeId) {
                    targetKeyframe = keyframe
                    break keyframeSearch
                }
            }
        }

    return targetKeyframe
}

export function findKeyframeById(project: Project, keyframeId: string): Keyframe|null
{
    let targetKeyframe: Keyframe|null = null

    keyframeSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips.values()) {
                    for (const propName of Object.keys(clip.keyframes)) {
                        for (const keyframe of clip.keyframes[propName]) {
                            if (keyframe.id === keyframeId) {
                                targetKeyframe = keyframe
                                break keyframeSearch
                            }
                        }
                    }
                }
            }
        }

    return targetKeyframe
}

export function findKeyframeFromClipByPropAndFrame(clip: Clip, propName: string, frameOnClip: number): Keyframe|null
{
    if (!clip.keyframes[propName]) return null
    const target: Keyframe|undefined = _.find(clip.keyframes[propName], kf => kf.frameOnClip === frameOnClip)
    return target ? target : null
}

export function findParentClipAndPropNameByKeyframeId(project: Project, keyframeId: string): {clip: Clip, propName: string}|null
{
    let target: {clip: Clip, propName: string}|null = null

    keyframeSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips.values()) {
                    for (const propName of Object.keys(clip.keyframes)) {
                        for (const keyframe of clip.keyframes[propName]) {
                            if (keyframe.id === keyframeId) {
                                target = {clip, propName}
                                break keyframeSearch
                            }
                        }
                    }
                }
            }
        }

    return target
}

export function findAssetAttachablePropertyByFileType(
    clip: Clip,
    fileType: string,
    registry: PluginRegistory
): string|null
{
    const plugin = registry.getPlugin(clip.renderer)
    return plugin.pluginInfo.acceptFileTypes[fileType]
}
