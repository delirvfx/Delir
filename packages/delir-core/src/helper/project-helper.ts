// @flow
import * as _ from 'lodash'
import * as uuid from 'uuid'

import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from '../Entity'
import Expression from '../Values/Expression'

function setFreezedProp(obj: object, name: string, value: any)
{
    Object.defineProperty(obj, name, {value, writable: false})
}

function _generateAndReserveSymbolId(project: Project): string
{
    return uuid.v4()
}

export function normalizeClip(clip: Clip) {
    clip.placedFrame = Math.round(clip.placedFrame)
    return clip
}

export function normalizeKeyframe(kf: Keyframe) {
    kf.frameOnClip = Math.round(kf.frameOnClip)

    if (kf.easeInParam) {
        kf.easeInParam = [
            _.clamp(kf.easeInParam[0], 0, 1),
            _.clamp(kf.easeInParam[1], 0, 1),
        ]
    }

    if (kf.easeOutParam) {
        kf.easeOutParam = [
            _.clamp(kf.easeOutParam[0], 0, 1),
            _.clamp(kf.easeOutParam[1], 0, 1),
        ]
    }

    if (kf.value instanceof Asset) {
        kf.value = {assetId: kf.value.id}
    }

    return kf
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
        setFreezedProp(asset, '_id', entityId)
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
        setFreezedProp(composition, '_id', entityId)
    }

    project.compositions = _.uniqBy([...project.compositions, composition], 'id')

    return composition
}

export function addLayer(
    project: Project,
    targetCompositionId: Composition | string,
    layer: Layer
    // TODO: position specify option
): Layer
{
    if (typeof layer.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(layer, '_id', entityId)
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
    targetLayerId: Layer | string,
    clip: Clip
): Clip
{
    if (typeof clip.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(clip, '_id', entityId)
    }

    normalizeClip(clip)

    // TODO: Not found behaviour
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)!

    layer.clips = _.uniqBy([...layer.clips, clip], 'id')

    return clip
}

export function addEffect(
  project: Project,
  targetClipId: Clip | string,
  effect: Effect
): Effect
{
    const clip = targetClipId instanceof Clip
      ? targetClipId
      : findClipById(project, targetClipId)!

    clip.effects.push(effect)

    return effect
}

export function addKeyframe(
    project: Project,
    targetClipId: Clip | string,
    propName: string,
    keyframe: Keyframe | Keyframe[]
): Keyframe | Keyframe[]
{
    let keyframes = Array.isArray(keyframe) ? keyframe : [keyframe]

    // TODO: Not found behaviour
    const clip: Clip | null = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    for (const _keyframe of keyframes) {
        if (typeof _keyframe.id !== 'string') {
            // TODO: Clone instance
            const entityId = _generateAndReserveSymbolId(project)
            setFreezedProp(_keyframe, '_id', entityId)
        }

        if (!clip.keyframes[propName]) {
            clip.keyframes[propName] = []
        }

        normalizeKeyframe(_keyframe)

        const duplicated = clip.keyframes[propName].find(kf => kf.frameOnClip === _keyframe.frameOnClip)

        if (duplicated) {
            throw new Error(`Keyframe duplicated on frame ${duplicated.frameOnClip} (property: ${propName})`)
        }

        clip.keyframes[propName].push(_keyframe)
    }

    return keyframe
}

export function addEffectKeyframe(
    project: Project,
    targetClipId: Clip | string,
    targetEffectId: Effect | string,
    propName: string,
    keyframe: Keyframe | Keyframe[]
): Keyframe | Keyframe[] | null
{
    const keyframes = Array.isArray(keyframe) ? keyframe : [keyframe]

    // TODO: Not found behaviour
    const clip: Clip | null = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    const effect: Effect | null = targetEffectId instanceof Effect
        ? targetEffectId
        : findEffectFromClipById(clip, targetEffectId)

    if (!clip || !effect) return null

    for (const _keyframe of keyframes) {
        if (!effect.keyframes[propName]) {
            effect.keyframes[propName] = []
        }

        normalizeKeyframe(_keyframe)

        const duplicated = effect.keyframes[propName].find(kf => kf.frameOnClip === _keyframe.frameOnClip)

        if (duplicated) {
            throw new Error(`Keyframe duplicated on frame ${duplicated.frameOnClip} (property: ${propName})`)
        }

        effect.keyframes[propName].push(_keyframe)
    }

    return keyframe
}

//
// Delete
//
export function deleteAsset(
    project: Project,
    targetAssetId: Asset | string,
) {
    const asset = targetAssetId instanceof Asset
        ? targetAssetId
        : findAssetById(project, targetAssetId)!

    _.remove(project.assets, {id: asset.id})
}

export function deleteComposition(
    project: Project,
    targetCompositionId: Composition | string,
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    // TODO: Not found behaviour
    _.remove(project.compositions, {id: composition.id})
}

export function deleteLayer(
    project: Project,
    targetLayerId: Layer | string,
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
    targetClipId: Clip | string,
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    const layer = findParentLayerByClipId(project, clip.id!)!
    _.remove(layer.clips, {id: clip.id})
}

export function deleteEffectFromClip(
    project: Project,
    parentClipId: Clip | string,
    targetEffectId: Effect | string,
) {
    const clip = parentClipId instanceof Clip
        ? parentClipId
        : findClipById(project, parentClipId)!

    const effect = targetEffectId instanceof Effect
        ? targetEffectId
        : findEffectFromClipById(clip, targetEffectId)

    _.remove(clip.effects, effect!)
}

export function deleteKeyframe(
    project: Project,
    targetKeyframeId: Keyframe | string,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)!

    const {clip, paramName} = findParentClipAndPropNameByKeyframeId(project, keyframe.id!)!
    if (!clip.keyframes[paramName]) return
    _.remove(clip.keyframes[paramName], kf => kf.id === targetKeyframeId) // TODO: Implement this function Or change keyframe structure
}

export function deleteEffectKeyframe(
    project: Project,
    clipId: string,
    effectId: string,
    targetKeyframeId: string
) {
    const clip = findClipById(project, clipId)!
    const effect = findEffectFromClipById(clip, effectId)!

    for (const propName of Object.keys(effect.keyframes)) {
        _.remove(effect.keyframes[propName], kf => kf.id === targetKeyframeId)
    }
}

//
// Modify
//
export function modifyAsset(
    project: Project,
    targetAssetId: Asset | string,
    patch: Partial<Asset>
) {
    const asset = targetAssetId instanceof Asset
        ? targetAssetId
        : findAssetById(project, targetAssetId)

    Object.assign(asset, patch)
}

export function modifyComposition(
    project: Project,
    targetCompositionId: Composition | string,
    patch: Partial<Composition>
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    Object.assign(composition, patch)
}

export function modifyLayer(
    project: Project,
    targetLayerId: Layer | string,
    patch: Partial<Layer>
) {
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)!

    Object.assign(layer, patch)
}

export function modifyClip(
    project: Project,
    targetClipId: Clip | string,
    patch: Partial<Clip>
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    normalizeClip(clip)

    Object.assign(clip, patch)
}

export function modifyClipExpression(
    project: Project,
    targetClipId: Clip | string,
    property: string,
    expr: Expression | null,
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    if (expr == null) {
        delete clip.expressions[property]
    } else {
        clip.expressions[property] = expr
    }
}

export function modifyEffectExpression(
    project: Project,
    targetClipId: Clip | string,
    targetEffectId: Effect | string,
    property: string,
    expr: Expression | null,
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    const effect = targetEffectId instanceof Effect
        ? targetEffectId
        : findEffectFromClipById(clip, targetEffectId)

    if (expr == null) {
        delete effect!.expressions[property]
    } else {
        effect!.expressions[property] = expr
    }
}

export function modifyEffect(
    project: Project,
    parentClipId: Clip | string,
    targetEffectId: Effect | string,
    patch: Partial<Effect>
) {
    const clip = parentClipId instanceof Clip
        ? parentClipId
        : findClipById(project, parentClipId)!

    const effect = targetEffectId instanceof Effect
        ? targetEffectId
        : findEffectFromClipById(clip, targetEffectId)

    Object.assign(effect, patch)
}

export function modifyEffectKeyframe(
    project: Project,
    effectHolderClipId: Clip | string,
    kfHolderEffectId: Effect | string,
    targetKeyframeId: Keyframe | string,
    patch: Partial<Keyframe>,
) {
    const clip = effectHolderClipId instanceof Clip
        ? effectHolderClipId
        : findClipById(project, effectHolderClipId)

    if (!clip) return

    const effect = kfHolderEffectId instanceof Effect
        ? kfHolderEffectId
        : findEffectFromClipById(clip, kfHolderEffectId)

    if (!effect) return

    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findEffectKeyframeFromEffectById(effect, targetKeyframeId)!

    if (!keyframe) return

    // TODO: Check duplicate on frame
    Object.assign(keyframe, patch)
    normalizeKeyframe(keyframe)
}

export function modifyKeyframe(
    project: Project,
    targetKeyframeId: Keyframe | string,
    patch: Partial<Keyframe>,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)!

    // TODO: Check duplicate on frame
    Object.assign(keyframe, patch)
    normalizeKeyframe(keyframe)
}

export function moveLayerOrder(
    project: Project,
    compositionId: string,
    layerId: string,
    newIndex: number
): void {
    const composition = findCompositionById(project, compositionId)!
    const layer = findLayerById(project, layerId)!

    if (!composition.layers.includes(layer)) {
        throw new Error(`Ordering layer not contained in composition "${composition.name}"`)
    }

    const prevIndex = composition.layers.indexOf(layer)
    composition.layers.splice(newIndex, 0, composition.layers.splice(prevIndex, 1)[0])
}

//
// Finders
//
export function findAssetById(project: Project, assetId: string): Asset | null
{
    let targetAsset: Asset | null = null

    compSearch:
        for (const asset of project.assets) {
            if (asset.id === assetId) {
                targetAsset = asset
                break compSearch
            }
        }

    return targetAsset
}

export function findCompositionById(project: Project, compositionId: string): Composition | null
{
    let targetComp: Composition | null = null

    compSearch:
        for (const comp of project.compositions) {
            if (comp.id === compositionId) {
                targetComp = comp
                break compSearch
            }
        }

    return targetComp
}

export function findLayerById(project: Project, layerId: string): Layer | null
{
    let targetLayer: Layer | null = null

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

export function findClipById(project: Project, clipId: string): Clip | null
{
    let targetClip: Clip | null = null

    clipSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips) {
                    if (clip.id === clipId) {
                        targetClip = clip
                        break clipSearch
                    }
                }
            }
        }

    return targetClip
}

export function findEffectFromClipById(clip: Clip, effectId: string): Effect | null
{
    for (const effect of clip.effects) {
        if (effect.id === effectId) {
            return effect
        }
    }

    return null
}

export function findParentCompositionByLayerId(project: Project, layerId: string): Composition | null
{
    let targetComp: Composition | null = null

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

export function findParentLayerByClipId(project: Project, clipId: string): Layer | null
{
    let targetLayer: Layer | null = null

    layerSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips) {
                    if (clip.id === clipId) {
                        targetLayer = layer
                        break layerSearch
                    }
                }
            }
        }

    return targetLayer
}

export function findKeyframeFromClipById(clip: Clip, keyframeId: string): Keyframe | null
{
    let targetKeyframe: Keyframe | null = null

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

export function findEffectKeyframeFromEffectById(effect: Effect, keyframeId: string): Keyframe | null
{
    let targetKeyframe: Keyframe | null = null

    keyframeSearch:
        for (const paramNEm of Object.keys(effect.keyframes)) {
            for (const keyframe of effect.keyframes[paramNEm]) {
                if (keyframe.id === keyframeId) {
                    targetKeyframe = keyframe
                    break keyframeSearch
                }
            }
        }

    return targetKeyframe
}

export function findKeyframeById(project: Project, keyframeId: string): Keyframe | null
{
    let targetKeyframe: Keyframe | null = null

    keyframeSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips) {
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

export function findKeyframeFromClipByPropAndFrame(clip: Clip, propName: string, frameOnClip: number): Keyframe | null
{
    if (!clip.keyframes[propName]) return null
    const target: Keyframe | undefined = _.find(clip.keyframes[propName], kf => kf.frameOnClip === frameOnClip)
    return target ? target : null
}

export function findKeyframeFromEffectByPropAndFrame(effect: Effect, propName: string, frameOnClip: number): Keyframe | null
{
    if (!effect.keyframes[propName]) return null
    const target: Keyframe | undefined = _.find(effect.keyframes[propName], kf => kf.frameOnClip === frameOnClip)
    return target ? target : null
}

export function findParentClipAndPropNameByKeyframeId(project: Project, keyframeId: string): {clip: Clip, paramName: string} | null
{
    let target: {clip: Clip, paramName: string} | null = null

    keyframeSearch:
        for (const comp of project.compositions) {
            for (const layer of comp.layers) {
                for (const clip of layer.clips) {
                    for (const paramName of Object.keys(clip.keyframes)) {
                        for (const keyframe of clip.keyframes[paramName]) {
                            if (keyframe.id === keyframeId) {
                                target = {clip, paramName}
                                break keyframeSearch
                            }
                        }
                    }
                }
            }
        }

    return target
}

export function findParentEffectAndParamNameByClipIdAndKeyframeId(project: Project, clipId: string, effectKeyframeId: string): {effect: Effect, paramName: string} | null
{
    let target: {effect: Effect, paramName: string} | null = null
    const clip = findClipById(project, clipId)

    if (!clip) return null

    keyframeSearch:
        for (const effect of clip.effects) {
            for (const paramName of Object.keys(effect.keyframes)) {
                for (const keyframe of effect.keyframes[paramName]) {
                    if (keyframe.id === effectKeyframeId) {
                        target = {effect, paramName}
                        break keyframeSearch
                    }
                }
            }
        }

    return target
}

// export function findAssetAttachablePropertyByFileType(
//     clip: Clip,
//     fileType: string,
//     registry: PluginRegistory
// ): string|null
// {
//     const plugin = registry.getPlugin(clip.renderer)
//     return plugin.pluginInfo.acceptFileTypes[fileType]
// }
