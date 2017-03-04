// @flow
import * as uuid from 'uuid'
import * as _ from 'lodash'

import Project from '../project/project'
import Asset from '../project/asset'
import Composition from '../project/composition'
import Timelane from '../project/timelane'
import Clip from '../project/clip'
import Effect from '../project/effect'
import Keyframe from '../project/keyframe'

import PluginRegistory from '../plugin/plugin-registry'

function setFreezedProp(obj: Object, name: string, value: any)
{
    Object.defineProperty(obj, name, {value, writable: false})
}

function _generateAndReserveSymbolId(project: Project): string
{
    let id

    do {
        id = uuid.v4()
    } while (project.symbolIds.has(id))

    project.symbolIds.add(id)
    return id
}

//
// Create
//
export function createAddAsset(
    project: Project,
    assetProps: Object = {}
) {
    const entityId = _generateAndReserveSymbolId(project)
    const asset = new Asset()

    setFreezedProp(asset, 'id', entityId)
    Object.assign(asset, assetProps)
    project.assets.add(asset)

    return asset
}

export function createAddComposition(
    project: Project,
    compositionProps: Object = {}
): Composition
{
    const entityId = _generateAndReserveSymbolId(project)
    const composition = new Composition()

    setFreezedProp(composition, 'id', entityId)
    Object.assign(composition, compositionProps)
    project.compositions.add(composition)

    return composition
}

export function createAddTimelane(
    project: Project,
    targetCompositionId: Composition|string,
    timelaneProps: Object
    // TODO: position specify option
): Timelane
{
    const entityId = _generateAndReserveSymbolId(project)
    const timelane = new Timelane()

    setFreezedProp(timelane, 'id', entityId)
    Object.assign(timelane, timelaneProps)
    addTimelane(project, targetCompositionId, timelane);

    return timelane
}

export function createAddClip(
    project: Project,
    targetTimelaneId: Timelane|string,
    clipProps: Object
): Clip
{
    const entityId = _generateAndReserveSymbolId(project)
    const clip = new Clip

    setFreezedProp(clip, 'id', entityId)
    Object.assign(clip, clipProps)

    // TODO: Not found behaviour
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)!

    timelane.clips.add(clip)

    return clip
}

export function createAddEffect(
  project: Project,
  targetClipId: Clip|string,
  effectProps: Object
): Effect
{
    const effect = new Effect
    Object.assign(effect, effectProps)

    addEffect(project, targetClipId, effect)
    return effect
}

export function createAddKeyframe(
    project: Project,
    targetClipId: Clip|string,
    propName: string,
    keyframeProp: Object|Array<Object>
): Array<Keyframe>
{
    let keyframeProps
    if (Array.isArray(keyframeProp)) {
        keyframeProps = keyframeProp
    } else {
        keyframeProps = [keyframeProp]
    }

    const createdKeyframes = []
    // TODO: Not found behaviour
    const clip: Clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    for (const _keyframeProp of keyframeProps) {
        const entityId = _generateAndReserveSymbolId(project)
        const keyframe = new Keyframe

        setFreezedProp(keyframe, 'id', entityId)
        Object.assign(keyframe, _keyframeProp)

        if (!clip.keyframes[propName]) {
            clip.keyframes[propName] = new Set()
        }

        clip.keyframes[propName].add(keyframe)
        createdKeyframes.push(keyframe)
    }

    return createdKeyframes
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

    project.assets.add(asset)

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

    project.compositions.add(composition)

    return composition
}

export function addTimelane(
    project: Project,
    targetCompositionId: Composition|string,
    timelane: Timelane
    // TODO: position specify option
): Timelane
{
    if (typeof timelane.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(timelane, 'id', entityId)
    }

    // TODO: Not found behaviour
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    composition.timelanes = _.uniqBy([timelane, ...composition.timelanes], 'id')

    return timelane
}

export function addClip(
    project: Project,
    targetTimelaneId: Timelane|string,
    clip: Clip
): Clip
{
    if (typeof clip.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(clip, 'id', entityId)
    }

    // TODO: Not found behaviour
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)!

    timelane.clips.add(clip)

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
    keyframe: Keyframe|Array<Keyframe>
): Keyframe|Array<Keyframe>
{
    let keyframes
    if (Array.isArray(keyframe)) {
        keyframes = keyframe
    } else {
        keyframes = [keyframe]
    }

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
            clip.keyframes[propName] = new Set()
        }

        clip.keyframes[propName].add(_keyframe)
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

    project.assets.delete(asset)
}

export function deleteComposition(
    project: Project,
    targetCompositionId: Composition|string,
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    // TODO: Not found behaviour
    project.compositions.delete(composition)
}

export function deleteTimelane(
    project: Project,
    targetTimelaneId: Timelane|string,
) {
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)!

    // TODO: Not found behaviour
    const composition = findParentCompositionByTimelaneId(project, timelane.id!)!
    _.remove(composition.timelanes, timelane)
}

export function deleteClip(
    project: Project,
    targetClipId: Clip|string,
) {
    const clip = targetClipId instanceof Clip
        ? targetClipId
        : findClipById(project, targetClipId)!

    const timelane = findParentTimelaneByClipId(project, clip.id!)!
    timelane.clips.delete(clip)
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
    clip.keyframes[propName].delete(keyframe) // TODO: Implement this function Or change keyframe structure
}

//
// Modify
//
export function modifyAsset(
    project: Project,
    targetAssetId: Asset|string,
    patch: Object
) {
    const asset = targetAssetId instanceof Asset
        ? targetAssetId
        : findAssetById(project, targetAssetId)

    Object.assign(asset, patch)
}

export function modifyComposition(
    project: Project,
    targetCompositionId: Composition|string,
    patch: Object
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)!

    Object.assign(composition, patch)
}

export function modifyTimelane(
    project: Project,
    targetTimelaneId: Timelane|string,
    patch: Object
) {
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)!

    Object.assign(timelane, patch)
}

export function modifyClip(
    project: Project,
    targetClipId: Clip|string,
    patch: Object
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
    patch: Object
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
    patch: Object,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)!

    Object.assign(keyframe, patch)
}

//
// Finders
//
export function findAssetById(project: Project, assetId: string): Asset|null
{
    let targetAsset: Asset|null = null

    compSearch:
        for (const asset of Array.from(project.assets)) {
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
        for (const comp of Array.from(project.compositions)) {
            if (comp.id === compositionId) {
                targetComp = comp
                break compSearch
            }
        }

    return targetComp
}

export function findTimelaneById(project: Project, timelaneId: string): Timelane|null
{
    let targetTimelane: Timelane|null = null

    timelaneSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes) {
                if (timelane.id === timelaneId) {
                    targetTimelane = timelane
                    break timelaneSearch
                }
            }
        }

    return targetTimelane
}

export function findClipById(project: Project, clipId: string): Clip|null
{
    let targetClip: Clip|null = null

    clipSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes) {
                for (const clip of timelane.clips.values()) {
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

export function findParentCompositionByTimelaneId(project: Project, timelaneId: string): Composition|null
{
    let targetComp: Composition|null = null

    compositionSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes) {
                if (timelane.id === timelaneId) {
                    targetComp = comp
                    break compositionSearch
                }
            }
        }

    return targetComp
}

export function findParentTimelaneByClipId(project: Project, clipId: string): Timelane|null
{
    let targetTimelane: Timelane|null = null

    timelaneSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes) {
                for (const clip of timelane.clips.values()) {
                    if (clip.id === clipId) {
                        targetTimelane = timelane
                        break timelaneSearch
                    }
                }
            }
        }

    return targetTimelane
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
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes) {
                for (const clip of timelane.clips.values()) {
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

export function findParentClipAndPropNameByKeyframeId(project: Project, keyframeId: string): {clip: Clip, propName: string}|null
{
    let target: {clip: Clip, propName: string}|null = null

    keyframeSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes) {
                for (const clip of timelane.clips.values()) {
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

export function findAssetAttachablePropertyByMimeType(
    clip: Clip,
    mimeType: string,
    registry: PluginRegistory
): string|null
{
    const plugin = registry.getPlugin(clip.renderer)
    return plugin.pluginInfo.acceptFileTypes[mimeType]
}