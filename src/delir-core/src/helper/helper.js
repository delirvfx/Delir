// @flow
import type Project from '../project/project'

export function findTimelaneById(project: Project, timelaneId: string) {
    let targetTimelane

    timelaneSearch:
        for (let comp of project.compositions.values()) {
            for (let timelane of comp.timelanes.values()) {
                if (timelane.id === timelaneId) {
                    targetTimelane = timelane
                    break timelaneSearch
                }
            }
        }

    return targetTimelane
}

export function findParentTimelaneByLayerId(project: Project, layerId: string) {
    let targetTimelane

    timelaneSearch:
        for (let comp of project.compositions.values()) {
            for (let timelane of comp.timelanes.values()) {
                for (let layer of timelane.layers.values()) {
                    if (layer.id === layerId) {
                        targetTimelane = timelane
                        break timelaneSearch
                    }
                }
            }
        }

    return targetTimelane
}

export function findLayerById(project: Project, layerId: string) {
    let targetLayer

    layerSearch:
        for (let comp of project.compositions.values()) {
            for (let timelane of comp.timelanes.values()) {
                for (let layer of timelane.layers.values()) {
                    if (layer.id === layerId) {
                        targetLayer = layer
                        break layerSearch
                    }
                }
            }
        }

    return targetLayer
}
