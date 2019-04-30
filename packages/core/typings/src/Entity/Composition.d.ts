import { Branded } from '../helper/Branded'
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
declare type CompositionId = Branded<string, 'Entity/Composition/Id'>
declare class Composition implements CompositionProps {
    public id: Composition.Id
    public name: string
    public width: number
    public height: number
    public framerate: number
    public durationFrames: number
    public samplingRate: number
    public audioChannels: number
    public backgroundColor: ColorRGB
    /**
     * Layers rendering from [0].
     * The one that follows will overwrite the previous ones
     */
    public layers: ReadonlyArray<Layer>
    public project: Project
    constructor(props: CompositionProps)
    public patch(props: Partial<CompositionProps>): void
    public findLayer(layerId: string): Layer | null
    public addLayer(layer: Layer, index?: number | null): void
    public removeLayer(layerId: string): boolean
    public moveLayerIndex(layerId: string, newIndex: number): boolean
}
declare namespace Composition {
    type Id = CompositionId
}
export { Composition }
