import * as uuid from 'uuid'
import { Branded } from '../helper/Branded'
import { safeAssign } from '../helper/safeAssign'
import ColorRGB from '../Values/ColorRGB'
import { Layer } from './Layer'
import { Project } from './Project'

interface CompositionProps {
    id?: string
    name: string
    width: number
    height: number
    framerate: number
    durationFrames: number
    samplingRate: number
    audioChannels: number
    backgroundColor: ColorRGB
}

type CompositionId = Branded<string, 'Entity/Composition/Id'>

class Composition implements CompositionProps {
    public id: Composition.Id
    public name: string
    public width: number
    public height: number
    public framerate: number
    public durationFrames: number
    public samplingRate: number
    public audioChannels: number
    public backgroundColor: ColorRGB
    public layers: ReadonlyArray<Layer> = []

    public project: Project

    constructor(props: CompositionProps) {
        this.id = uuid.v4() as Composition.Id
        safeAssign<Composition>(this, props as CompositionProps & { id: Composition.Id })
    }

    public patch(props: Partial<CompositionProps>) {
        safeAssign(this, props)
    }

    public findLayer(layerId: Layer.Id): Layer | null {
        return this.layers.find(layer => layer.id === layerId) || null
    }

    public addLayer(layer: Layer, index: number | null = null): void {
        if (index == null) {
            this.layers = [...this.layers, layer]
            return
        }

        this.layers = [...this.layers].splice(index, 0, layer)
    }

    public removeLayer(layerId: Layer.Id): boolean {
        const beforeLength = this.layers.length
        this.layers = this.layers.filter(layer => layer.id !== layerId)
        return this.layers.length !== beforeLength
    }

    public moveLayerIndex(layerId: Layer.Id, newIndex: number): boolean {
        const index = this.layers.findIndex(layer => layer.id === layerId)
        if (index === -1) return false

        const clone = [...this.layers]
        this.layers = clone.splice(newIndex, 0, ...clone.splice(index, 1))
        return true
    }
}

namespace Composition {
    export type Id = CompositionId
}

export { Composition }
