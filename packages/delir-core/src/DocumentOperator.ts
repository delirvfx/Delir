import Delir from './Delir'
import { Asset, Clip, Composition, Effect, Layer, Project} from './Document/index'
import { Omit } from './Utils/types'

type NewEntity<T extends { id: any }> = Omit<T, 'id'>

interface OperationEvents {
    'asset:add': { id: string }
    'asset:remove': { id: string }
    'composition:remove': { id: string }
}

/**
 * Document operation methods
 */
export default class DocumentOperator {
    private context: Delir
    private project: Project
    private listeners: {
        [event: string]: ((payload: any) => void)[]
    }

    constructor(context: Delir, project: Project) {
        this.context = context
        this.project = project
        this.listeners = Object.create(null)
    }

    // emitter
    public on<E extends keyof OperationEvents>(event: E, listener: (payload: OperationEvents[E]) => void): void {
        this.listeners[event] = this.listeners[event] || []
        this.listeners[event].push(listener)
    }

    private emit<E extends keyof OperationEvents>(event: E, payload: OperationEvents[E]): void {
        if (!this.listeners[event]) return
        for (const listener of this.listeners[event]) listener(payload)
    }


    // Asset operations

    public getAsset(assetId: string): Asset|void {
        return this.project.assets.find(asset => asset.id === assetId)
    }

    public addAsset(assetProp: NewEntity<Asset>): Asset {
        const asset = { ...assetProp, id: '' }
        this.project.assets.push(asset)
        this.emit('asset:add', { id: asset.id })
        return asset
    }

    public removeAsset(assetId: string): Asset|void {
        const index = this.project.assets.findIndex(asset => asset.id === assetId)
        if (index === -1) return

        const [ asset ] = this.project.assets.splice(index, 1)
        this.emit('asset:remove', { id: asset.id })
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
