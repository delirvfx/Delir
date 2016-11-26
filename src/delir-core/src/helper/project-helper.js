// @flow
import uuid from 'uuid'

import Project from '../project/project'
import Asset from '../project/asset'
import Composition from '../project/composition'
import Timelane from '../project/timelane'
import Layer from '../project/layer'
import Keyframe from '../project/keyframe'

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

    // TODO: Not found behaviour
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)
    composition.timelanes.add(timelane)

    return timelane
}

export function createAddLayer(
    project: Project,
    targetTimelaneId: Timelane|string,
    layerProps: Object
): Layer
{
    const entityId = _generateAndReserveSymbolId(project)
    const layer = new Layer

    setFreezedProp(layer, 'id', entityId)
    Object.assign(layer, layerProps)

    // TODO: Not found behaviour
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)

    timelane.layers.add(layer)

    return layer
}

export function createAddKeyframe(
    project: Project,
    targetLayerId: Layer|string,
    propName: string,
    keyframeProp: Object|Array<Object>
): Keyframe|Array<Keyframe>
{
    let keyframeProps
    if (Array.isArray(keyframeProp)) {
        keyframeProps = keyframeProp
    } else {
        keyframeProps = [keyframeProp]
    }

    const createdKeyframes = []
    // TODO: Not found behaviour
    const layer: ?Layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)

    for (const _keyframeProp of keyframeProps) {
        const entityId = _generateAndReserveSymbolId(project)
        const keyframe = new Keyframe

        setFreezedProp(keyframe, 'id', entityId)
        Object.assign(keyframe, _keyframeProp)

        if (!layer.keyframes[propName]) {
            layer.keyframes[propName] = new Set()
        }

        layer.keyframes[propName].add(keyframe)
        createdKeyframes.push(keyframe)
    }

    return Array.isArray(keyframeProps) ? createdKeyframes : createdKeyframes[0]
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
        : findCompositionById(project, targetCompositionId)
    composition.timelanes.add(timelane)

    return timelane
}

export function addLayer(
    project: Project,
    targetTimelaneId: Timelane|string,
    layer: Layer
): Layer
{
    if (typeof layer.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(layer, 'id', entityId)
    }

    // TODO: Not found behaviour
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)

    timelane.layers.add(layer)

    return layer
}

export function addKeyframe(
    project: Project,
    targetLayerId: Layer|string,
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
    const layer: ?Layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)
    console.log(layer);

    for (const _keyframe of keyframes) {
        if (typeof _keyframe.id !== 'string') {
            // TODO: Clone instance
            const entityId = _generateAndReserveSymbolId(project)
            setFreezedProp(_keyframe, 'id', entityId)
        }

        if (!layer.keyframes[propName]) {
            layer.keyframes[propName] = new Set()
        }

        layer.keyframes[propName].add(_keyframe)
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
    const asset = asset instanceof Asset
        ? asset
        : findAssetById(project, targetAssetId)

    project.assets.delete(asset)
}

export function deleteComposition(
    project: Project,
    targetCompositionId: Composition|string,
) {
    const composition = targetCompositionId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)

    // TODO: Not found behaviour
    project.compositions.delete(composition)
}

export function deleteTimelane(
    project: Project,
    targetTimelaneId: Timelane|string,
) {
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetCompositionId)

    // TODO: Not found behaviour
    const composition = findParentCompositionByTimelaneId(project, timelane.id)
    composition.timelanes.delete(composition)
}

export function deleteLayer(
    project: Project,
    targetLayerId: Layer|string,
) {
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)

    const timelane = findParentTimelaneByLayerId(project, layer.id)
    timelane.layers.delete(layer)
}

export function deleteKeyframe(
    project: Project,
    targetKeyframeId: Keyframe|string,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)

    const {layer, propName} = findParentLayerAndPropNameByKeyframeId(project, keyframe.id)
    if (!layer.keyframes[propName]) return
    layer.keyframes[propName].delete(keyframe) // TODO: Implement this function Or change keyframe structure
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
    const composition = targetAssetId instanceof Composition
        ? targetCompositionId
        : findCompositionById(project, targetCompositionId)

    Object.assign(composition, patch)
}

export function modifyTimelane(
    project: Project,
    targetTimelaneId: Timelane|string,
    patch: Object
) {
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)

    Object.assign(timelane, patch)
}

export function modifyTimelaneId(
    project: Project,
    targetTimelaneId: Timelane|string,
    patch: Object
) {
    const asset = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)

    Object.assign(asset, patch)
}

export function modifyLayer(
    project: Project,
    targetLayerId: Layer|string,
    patch: Object
) {
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)

    Object.assign(layer, patch)
}

export function modifyKeyframe(
    project: Project,
    targetKeyframeId: Keyframe|string,
    patch: Object,
) {
    const keyframe = targetKeyframeId instanceof Keyframe
        ? targetKeyframeId
        : findKeyframeById(project, targetKeyframeId)

    Object.assign(keyframe, patch)
}

//
// Finders
//
export function findAssetById(project: Project, assetId: string): ?Asset {
    let targetAsset: ?Asset = null

    compSearch:
        for (const asset of project.assets.values()) {
            if (asset.id === assetId) {
                targetAsset = asset
                break compSearch
            }
        }

    return targetAsset
}

export function findCompositionById(project: Project, compositionId: string): ?Composition {
    let targetComp: ?Composition = null

    compSearch:
        for (const comp of project.compositions.values()) {
            if (comp.id === compositionId) {
                targetComp = comp
                break compSearch
            }
        }

    return targetComp
}

export function findTimelaneById(project: Project, timelaneId: string): ?Timelane {
    let targetTimelane: ?Timelane = null

    timelaneSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes.values()) {
                if (timelane.id === timelaneId) {
                    targetTimelane = timelane
                    break timelaneSearch
                }
            }
        }

    return targetTimelane
}

export function findLayerById(project: Project, layerId: string): ?Layer {
    let targetLayer: ?Layer = null

    layerSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes.values()) {
                for (const layer of timelane.layers.values()) {
                    if (layer.id === layerId) {
                        targetLayer = layer
                        break layerSearch
                    }
                }
            }
        }

    return targetLayer
}

export function findParentCompositionByTimelaneId(project: Project, timelaneId: string): ?Composition {
    let targetComp: ?Composition = null

    compositionSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes.values()) {
                if (timelane.id === timelaneId) {
                    targetComp = comp
                    break compositionSearch
                }
            }
        }

    return targetComp
}

export function findParentTimelaneByLayerId(project: Project, layerId: string): ?Timelane {
    let targetTimelane: ?Timelane = null

    timelaneSearch:
        for (const comp of project.compositions.values()) {
            for (const timelane of comp.timelanes.values()) {
                for (const layer of timelane.layers.values()) {
                    if (layer.id === layerId) {
                        targetTimelane = timelane
                        break timelaneSearch
                    }
                }
            }
        }

    return targetTimelane
}

export function findKeyframeFromLayerById(
    layer: Layer,
    keyframeId: string
): ?Keyframe
{
    let targetKeyframe: ?Keyframe = null

    keyframeSearch:
        for (const propName: string of Object.keys(layer.keyframes)) {
            for (const keyframe: Keyframe of layer.keyframes[propName]) {
                if (keyframe.id === keyframeId) {
                    targetKeyframe = keyframe
                    break keyframeSearch
                }
            }
        }

    return targetKeyframe
}

export function findKeyframeById(project: Project, keyframeId: string): ?Keyframe
{
    let targetKeyframe: ?Keyframe = null

    keyframeSearch:
        for (const comp: Composition of project.compositions.values()) {
            for (const timelane: Timelane of comp.timelanes.values()) {
                for (const layer: Layer of timelane.layers.values()) {
                    for (const propName: string of Object.keys(layer.keyframes)) {
                        for (const keyframe: Keyframe of layer.keyframes[propName]) {
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

export function findParentLayerAndPropNameByKeyframeId(project: Project, keyframeId: string): ?{layer: Layer, propName: string}
{
    let target: ?{layer: Layer, propName: string} = null

    keyframeSearch:
        for (const comp: Composition of project.compositions.values()) {
            for (const timelane: Timelane of comp.timelanes.values()) {
                for (const layer: Layer of timelane.layers.values()) {
                    for (const propName: string of Object.keys(layer.keyframes)) {
                        for (const keyframe: Keyframe of layer.keyframes[propName]) {
                            if (keyframe.id === keyframeId) {
                                target = {layer, propName}
                                break keyframeSearch
                            }
                        }
                    }
                }
            }
        }

    return target
}
