import Delir from './Delir'
import { Asset, Clip, Composition, Effect, Layer, Project} from './Document/index'
import { Omit } from './Utils/types'

type NewEntity<T extends { id: any }> = Omit<T, 'id'>

/**
 * Document operation methods
 */
export default class DocumentOperator {
    private context: Delir
    private project: Project

    constructor(context: Delir, project: Project) {
        this.context = context
        this.project = project
    }

    // Asset operations

    public getAsset(assetId: string): Asset|void {
        return this.project.assets.find(asset => asset.id === assetId)
    }

    public addAsset(assetProp: NewEntity<Asset>): Asset {
        const asset = { ...assetProp, id: '' }
        this.project.assets.push(asset)
        return asset
    }

    public removeAsset(assetId: string): Asset|void {
        const index = this.project.assets.findIndex(asset => asset.id === assetId)
        if (index === -1) return

        const [ asset ] = this.project.assets.splice(index, 1)
        return asset
    }

    // Composition operations

    public getComposition(compositionId: string): Composition|void {
        return this.project.compositions.find(composition => composition.id === compositionId)
    }

    // Layer operations

    // TODO: remove, add for Composition
    public getLayer(layerId: string): Layer|void {
        return this.project.layers.find(layer => layer.id === layerId)
    }

    // Clip operations

    public getClip(clipId: string): Clip|void {
        return this.project.clips.find(clip => clip.id === clipId)
    }

    // Clip keyframe operations

    // Effect operations
    public getEffect(effectId: string): Effect|void {
        return this.project.effects.find(effect => effect.id === effectId)
    }

    // Effect keyframe operations
}
