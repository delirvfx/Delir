import Delir from './Delir'
import { Asset, Clip, Composition, Effect, Layer, Project } from './Document/index'
import { Omit } from './Utils/types'

type NewEntity<T extends { id: any }> = Omit<T, 'id'>

export interface OperationEvents {
    'asset:add': { id: string }
    'asset:remove': { id: string }
    'composition:add': { id: string }
    'composition:remove': { id: string }
    'layer:add': { id: string }
    'layer:remove': { id: string }
    'clip:add': { id: string, parentLayerId: string }
    'clip:remove': { id: string, parentLayerId: string }
    'effect:add': { id: string }
    'effect:remove': { id: string }
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

    public off<E extends keyof OperationEvents>(event: E, listener: (payload: OperationEvents[E]) => void): void {
        if (!this.listeners[event]) return

        const index = this.listeners[event].findIndex(fn => fn === listener)
        index !== -1 && this.listeners[event].splice(index, 1)
    }

    // Asset operations

    public getAsset(assetId: string): Asset | void {
        return this.project.assets.find(asset => asset.id === assetId)
    }

    public addAsset(assetProp: NewEntity<Asset>): Asset {
        const asset = { ...assetProp, id: '' }
        this.project.assets.push(asset)
        this.emit('asset:add', { id: asset.id })
        return asset
    }

    public removeAsset(assetId: string): Asset | void {
        const index = this.project.assets.findIndex(asset => asset.id === assetId)
        if (index === -1) return

        const [ asset ] = this.project.assets.splice(index, 1)
        this.emit('asset:remove', { id: asset.id })
        return asset
    }

    // Composition operations

    public getComposition(compositionId: string): Composition | void {
        return this.project.compositions.find(composition => composition.id === compositionId)
    }

    public addComposition(compositionProp: NewEntity<Composition>): Composition {
        const composition = { ...compositionProp, id: '' }
        this.project.compositions.push(composition)
        return composition
    }

    public removeComposition(compositionId: string): Composition | void {
        const index = this.project.compositions.findIndex(comp => comp.id === compositionId)
        if (index === -1) return

        const [ composition ] = this.project.compositions.splice(index, 1)
        this.emit('composition:remove', { id: composition.id })
        return composition
    }

    // Layer operations

    // TODO: remove, add for Composition
    public getLayer(layerId: string): Layer | void {
        return this.project.layers.find(layer => layer.id === layerId)
    }

    public addLayer(layer: NewEntity<Layer>): Layer {
        // TODO
    }

    public removeLayer(layerId: string ): Layer | void {
        const index = this.project.layers.findIndex(layer => layer.id === layerId)
        if (index === -1)return

        const [ layer ] = this.project.layers.splice(index, 1)
        this.emit('layer:remove', { id: layer.id })
        return layer
    }

    // Clip operations

    public getClip(clipId: string): Clip | void {
        return this.project.clips.find(clip => clip.id === clipId)
    }

    public addClip(clip: NewEntity<Clip>): Clip {
        // TODO
    }

    public removeClip(clipId: string): Clip | void {
        const index = this.project.clips.findIndex(clip => clip.id === clipId)
        if (index === -1) return

        const [ clip ] = this.project.clips.splice(index, 1)
        const parentLayer = this.project.layers.find(layer => (
            layer.clips.includes(clip.id)
        ))!

        this.emit('clip:remove', { id: clipId, parentLayerId: parentLayer.id })
        return clip
    }

    // Clip keyframe operations

    // Effect operations
    public getEffect(effectId: string): Effect | void {
        return this.project.effects.find(effect => effect.id === effectId)
    }

    // Effect keyframe operations

    private emit<E extends keyof OperationEvents>(event: E, payload: OperationEvents[E]): void {
        if (!this.listeners[event]) return
        const frozenPayload = { ...(payload as object) }
        for (const listener of this.listeners[event]) listener(frozenPayload)
    }
}
