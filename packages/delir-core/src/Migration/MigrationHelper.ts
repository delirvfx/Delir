import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from '../Entity'

export const walkAssets = (project: Project, callback: (asset: Asset) => void) => {
    for (const asset of project.assets) {
        callback(asset)
    }
}

export const walkCompositions = (project: Project, callback: (composition: Composition) => void) => {
    for (const composition of project.compositions) {
        callback(composition)
    }
}

export const walkLayers = (project: Project, callback: (layer: Layer) => void) => {
    walkCompositions(project, composition => {
        for (const layer of composition.layers) {
            callback(layer)
        }
    })
}

export const walkClips = (project: Project, callback: (clip: Clip) => void) => {
    walkLayers(project, layer => {
        for (const clip of layer.clips) {
            callback(clip)
        }
    })
}

export const walkEffects = (project: Project, callback: (effect: Effect) => void) => {
    walkClips(project, clip => {
        for (const effect of clip.effects) {
            callback(effect)
        }
    })
}

const walkKeyframes = (
    entity: Clip | Effect,
    callback: (keyframe: Keyframe, paramName: string, entity: Clip | Effect) => void,
) => {
    for (const paramName of Object.keys(entity.keyframes)) {
        for (const keyframe of entity.keyframes[paramName]) {
            callback(keyframe, paramName, entity)
        }
    }
}

export const walkClipKeyframes = (
    project: Project,
    callback: (keyframe: Keyframe, paramName: string, clip: Clip) => void,
) => {
    walkClips(project, clip => walkKeyframes(clip, callback))
}

export const walkEffectKeyframes = (
    project: Project,
    callback: (keyframe: Keyframe, paramName: string, clip: Clip) => void,
) => {
    walkEffects(project, clip => walkKeyframes(clip, callback))
}
