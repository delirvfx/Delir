// @flow
import type Project from '../project/project'
import type Asset from '../project/asset'
import type Composition from '../project/composition'
import type Timelane from '../project/timelane'
import type Layer from '../project/layer'

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
