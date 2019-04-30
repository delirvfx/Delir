import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from '../Entity'
export declare const walkAssets: (project: Project, callback: (asset: Asset) => void) => void
export declare const walkCompositions: (project: Project, callback: (composition: Composition) => void) => void
export declare const walkLayers: (project: Project, callback: (layer: Layer) => void) => void
export declare const walkClips: (project: Project, callback: (clip: Clip) => void) => void
export declare const walkEffects: (project: Project, callback: (effect: Effect) => void) => void
export declare const walkClipKeyframes: (
    project: Project,
    callback: (keyframe: Keyframe<import('../Entity').KeyframeValueTypes>, paramName: string, clip: Clip) => void,
) => void
export declare const walkEffectKeyframes: (
    project: Project,
    callback: (keyframe: Keyframe<import('../Entity').KeyframeValueTypes>, paramName: string, clip: Clip) => void,
) => void
