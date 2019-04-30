import { Asset, Clip, Composition, Layer, Project } from './Entity'

const visitProject = (json: any) => {
    const project = new Project()
    project.assets = visitAssets(json.assets, project)
    project.compositions = visitCompositions(json.compositions, project)
    return project
}

const visitAssets = (json: any[], project: Project) =>
    json.map(assetJSON => {
        const asset = new Asset(assetJSON)
        asset.project = project
        return asset
    })

const visitCompositions = (json: any[], project: Project) =>
    json.map(compositionJSON => {
        const composition = new Composition(compositionJSON)
        composition.layers = visitLayers(compositionJSON.layers, composition)
        composition.project = project
        return composition
    })

const visitLayers = (json: any[], composition: Composition) =>
    json.map(layerJSON => {
        const layer = new Layer(layerJSON)
        layer.clips = visitClips(layerJSON.clips, layer)

        return
    })

const visitClips = (json: any[], layer: Layer) =>
    json.map(clipJSON => {
        const clip = new Clip(clipJSON)
        clip.keyframes = visitKeyframes(clipJSON.keyframes, clip)
        clip.expressions = visitExpressions(clipJSON.expressions, clip)
        clip.effects = visitEffects(clipJson.effects)
        clip.layer = layer
        return layer
    })

const visitKeyframes = (json: any[], clip: Clip) => {
    json.map(json => {
        const keyframe = new Keyframe(json)
        keyframe.clip = C
    })
}
const visitExpressions = (json: any[], clip: Clip) => {
    json.map(json => {
        const expression = new Expression(json)
        expression.clip = C
    })
}
const visitEffects = (json: any[], clip: Clip) => {
    json.map(json => {
        const effect = new Effect(json)
        effect.clip = C
    })
}
