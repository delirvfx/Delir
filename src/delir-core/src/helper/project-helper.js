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
    Object.defineProperty(obj, name, {value})
}

function _generateAndReserveSymbolId(project: Project): string
{
    let id

    do {
        id = uuid.v4()
    } while (project._symbolIds.includes(id))

    project._symbolIds.add(id)
    return id
}

//
// Create
//
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

export function createAddKeyFrame(
    project: Project,
    targetLayerId: Layer|string,
    keyframeProps: Object
): Keyframe
{
    const entityId = _generateAndReserveSymbolId(project)
    const keyframe = new Keyframe

    setFreezedProp(keyframe, 'id', entityId)
    Object.assign(keyframe, keyframeProps)

    // TODO: Not found behaviour
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)
    layer.keyframes.add(layer)

    return keyframe
}

//
// Add
//
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
        setFreezedProp(composition, 'id', entityId)
    }

    // TODO: Not found behaviour
    const timelane = targetTimelaneId instanceof Timelane
        ? targetTimelaneId
        : findTimelaneById(project, targetTimelaneId)
    timelane.layers.add(layer)

    return layer
}

export function addKeyFrame(
    project: Project,
    targetLayerId: Layer|string,
    keyframe: Keyframe
): Keyframe
{
    if (typeof keyframe.id !== 'string') {
        // TODO: Clone instance
        const entityId = _generateAndReserveSymbolId(project)
        setFreezedProp(composition, 'id', entityId)
    }

    // TODO: Not found behaviour
    const layer = targetLayerId instanceof Layer
        ? targetLayerId
        : findLayerById(project, targetLayerId)
    layer.keyframes.add(layer)

    return keyframe
}

//
// Delete
//
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
        : findKeyframeById(project, targetKeyframeId) // TODO: Implement this function

    const {layer, propName} = findParentLayerAndPropNameByKeyframeId(project, keyframe.id)
    layer.keyframes[propName].delete(keyframe) // TODO: Implement this function Or change keyframe structure
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
